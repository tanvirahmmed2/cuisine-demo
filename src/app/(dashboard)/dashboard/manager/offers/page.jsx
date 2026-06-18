'use client'
import AddOffer from '@/components/forms/AddOffer'
import UpdateOffer from '@/components/forms/UpdateOffer'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { MdDelete, MdAdd, MdEdit } from 'react-icons/md'

const OffersPage = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editOffer, setEditOffer] = useState(null)

  const fetchOffers = async () => {
    try {
      const res = await axios.get('/api/offer')
      if (res.data.success) {
        setOffers(res.data.payload)
      }
    } catch (error) {
      toast.error('Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return
    try {
      const res = await axios.delete('/api/offer', { data: { id }, withCredentials: true })
      toast.success(res.data.message)
      fetchOffers()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete offer')
    }
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Offers & Promotions</h1>
          <p className="text-gray-500 text-sm">Manage special offers, discounts, and promotional banners.</p>
        </div>
        <button 
          onClick={() => {
            setEditOffer(null)
            setShowAdd(!showAdd)
          }}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-600 transition-colors"
        >
          {showAdd || editOffer ? 'Close Form' : <><MdAdd size={20} /> Add Offer</>}
        </button>
      </div>

      {showAdd && !editOffer && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Create New Offer</h2>
          <AddOffer fetchOffers={fetchOffers} />
        </div>
      )}

      {editOffer && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl border-pink-200">
          <h2 className="text-xl font-bold mb-4 text-pink-600">Edit Offer: {editOffer.title}</h2>
          <UpdateOffer 
            initialData={editOffer} 
            fetchOffers={fetchOffers} 
            onClose={() => setEditOffer(null)} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-400">Loading offers...</p>
        ) : offers.length === 0 ? (
          <p className="text-gray-400">No offers found. Create one above.</p>
        ) : (
          offers.map(offer => (
            <div key={offer.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col relative group">
              <div className="relative w-full h-48 bg-slate-100">
                <Image src={offer.image} alt={offer.title} fill className="object-cover" />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setShowAdd(false)
                      setEditOffer(offer)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="p-2 bg-white text-slate-700 hover:text-pink-600 rounded-lg shadow-md transition-colors"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(offer.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md transition-colors"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${offer.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {offer.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{offer.title}</h3>
                <div 
                  className="mt-2 text-sm text-slate-500 line-clamp-3 prose prose-sm prose-slate"
                  dangerouslySetInnerHTML={{ __html: offer.description }}
                />
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 flex flex-col gap-1">
                  {offer.start_date && <p>Starts: {new Date(offer.start_date).toLocaleString()}</p>}
                  {offer.end_date && <p>Ends: {new Date(offer.end_date).toLocaleString()}</p>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default OffersPage
