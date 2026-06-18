'use client'
import axios from 'axios'
import React, { useState, useContext } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FaCalendarAlt, FaChair } from 'react-icons/fa'
import { Context } from '@/components/context/Context'

const Reservation = () => {
  const { siteData } = useContext(Context)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    member: '',
    table: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('/api/reservation', formData, { withCredentials: true })
      toast.success(response.data.message || 'Reservation submitted successfully!')
      setFormData({
        name: '',
        email: '',
        date: '',
        member: '',
        table: '',
        message: ''
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit reservation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-50/30 pt-28 pb-20 px-6'>
      <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>

        {/* Text Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }}
          className='space-y-8'
        >
          <div className='space-y-4'>
            <div className='inline-block px-4 py-1 bg-pink-500 text-white text-[10px] font-semibold uppercase tracking-widest rounded-full'>
              Reservations
            </div>
            <h1 className='text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight leading-tight'>
              Experience the Art of <span className='text-gray-400 italic'>Fine Dining</span>
            </h1>
          </div>
          <p className='text-gray-500 text-lg leading-relaxed max-w-md font-medium'>
            {siteData?.meta_description || "Book your table at Grand Kitchen and prepare for an unforgettable culinary journey."}
          </p>
          <div className='flex flex-col gap-4 pt-4 border-t border-gray-100'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900'>
                <FaCalendarAlt size={16} />
              </div>
              <div>
                <p className='text-[10px] font-semibold uppercase tracking-widest text-gray-400'>Open Hours</p>
                <p className='text-sm font-semibold text-gray-900'>Mon - Sun: 10:00 AM - 11:00 PM</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900'>
                <FaChair size={16} />
              </div>
              <div>
                <p className='text-[10px] font-semibold uppercase tracking-widest text-gray-400'>Location</p>
                <p className='text-sm font-semibold text-gray-900'>{siteData?.address || "123 Culinary Ave, Gourmet City"}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.1 }}
          className='bg-white p-8 rounded-xl border border-gray-100'
        >
          <div className='mb-8'>
            <h2 className='text-xl font-semibold text-gray-900 tracking-tight'>Request a Table</h2>
            <p className='text-gray-400 text-xs font-medium'>Fill in your details and we&apos;ll confirm your spot.</p>
          </div>
          
          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor="name" className='text-[10px] font-semibold uppercase text-gray-400 tracking-widest ml-1'>Name</label>
                <input type="text" id='name' name='name' required onChange={handleChange} value={formData.name} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-pink-500 transition-all text-sm font-semibold' />
              </div>
              
              <div className='flex flex-col gap-1.5'>
                <label htmlFor="email" className='text-[10px] font-semibold uppercase text-gray-400 tracking-widest ml-1'>Email</label>
                <input type="email" id='email' name='email' required onChange={handleChange} value={formData.email} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-pink-500 transition-all text-sm font-semibold' />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor="date" className='text-[10px] font-semibold uppercase text-gray-400 tracking-widest ml-1'>Date</label>
                <input type="date" id='date' name='date' required onChange={handleChange} value={formData.date} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-pink-500 transition-all text-sm font-semibold' />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor="member" className='text-[10px] font-semibold uppercase text-gray-400 tracking-widest ml-1'>Guests</label>
                <input type="number" id='member' name='member' min="1" required onChange={handleChange} value={formData.member} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-pink-500 transition-all text-sm font-semibold' />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor="table" className='text-[10px] font-semibold uppercase text-gray-400 tracking-widest ml-1'>Table</label>
                <input type="number" id='table' name='table' required onChange={handleChange} value={formData.table} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-pink-500 transition-all text-sm font-semibold' />
              </div>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label htmlFor="message" className='text-[10px] font-semibold uppercase text-gray-400 tracking-widest ml-1'>Notes (Optional)</label>
              <textarea name="message" id="message" rows="2" onChange={handleChange} value={formData.message} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-pink-500 transition-all text-sm font-semibold resize-none' />
            </div>

            <button 
              type='submit' 
              disabled={loading}
              className='w-full py-3.5 bg-pink-500 text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-[0.98] disabled:opacity-50 mt-2'
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default Reservation