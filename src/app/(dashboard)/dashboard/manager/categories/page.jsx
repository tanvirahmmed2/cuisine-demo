'use client'
import { Context } from '@/components/context/Context'
import axios from 'axios'
import Image from 'next/image'
import React, { useContext, useState, useRef } from 'react'
import { MdDeleteOutline, MdEdit, MdClose, MdImage } from 'react-icons/md'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa'

const CategorListPage = () => {
  const { categories, fetchCategories } = useContext(Context)
  const [editCat, setEditCat] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure to delete this category?')
    if (!confirm) return
    try {
      const res = await axios.delete('/api/category', { data: { id }, withCredentials: true })
      toast.success(res.data.message)
      fetchCategories()
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete category")
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setIsEditing(true)
    const formData = new FormData()
    formData.append('id', editCat.id)
    formData.append('name', editCat.name)
    if (editImageFile) {
      formData.append('image', editImageFile)
    }

    try {
      const res = await axios.put('/api/category', formData, { withCredentials: true })
      toast.success(res.data.message)
      setEditCat(null)
      setEditImageFile(null)
      setEditImagePreview(null)
      fetchCategories()
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update category")
    } finally {
      setIsEditing(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditImageFile(file)
      setEditImagePreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className='w-full max-w-4xl mx-auto flex flex-col gap-8'>
      <div className='flex flex-row items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold text-gray-900 tracking-tight'>Categories</h1>
          <p className='text-gray-500 text-sm'>Organize your menu items into groups.</p>
        </div>
        <Link 
          href="/dashboard/manager/new-category" 
          className='flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white rounded-xl font-semibold text-sm hover:bg-pink-600 transition-all active:scale-[0.98]'
        >
          <FaPlus size={12}/>
          <span>Add Category</span>
        </Link>
      </div>

      <div className='w-full flex flex-col gap-4'>
        {categories && categories.length > 0 ? (
          <div className='flex flex-col gap-1.5'>
            <div className='w-full grid grid-cols-12 bg-gray-50/50 p-4 rounded-xl font-semibold text-[10px] uppercase text-gray-400 tracking-widest border border-gray-100'>
              <p className='col-span-10'>Category Detail</p>
              <p className='col-span-2 text-right'>Action</p>
            </div>
            
            <div className='flex flex-col gap-1.5'>
              {categories.map((cat) => (
                <div key={cat.id} className='w-full grid grid-cols-12 p-3 items-center bg-white border border-gray-100 rounded-xl hover:border-pink-500 transition-all group'>
                  <div className='col-span-10 flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-lg overflow-hidden border border-gray-50'>
                      <Image src={cat?.image} alt={cat?.name} width={40} height={40} className='object-cover w-full h-full'/>
                    </div>
                    <p className='font-semibold text-gray-800 text-sm'>{cat?.name}</p>
                  </div>
                  <div className='col-span-2 flex flex-row items-center justify-end gap-2'>
                    <button className='p-2 text-gray-400 hover:text-pink-600 transition-colors' onClick={() => { setEditCat(cat); setEditImagePreview(cat.image); setEditImageFile(null); }}><MdEdit/></button>
                    <button className='p-2 text-rose-300 hover:text-rose-600 transition-colors' onClick={() => handleDelete(cat.id)}><MdDeleteOutline /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='text-center py-24 bg-gray-50/50 rounded-xl border border-dashed border-gray-200'>
            <p className='text-gray-400 text-sm font-medium'>No categories found.</p>
          </div>
        )}
      </div>

      {editCat && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>Edit Category</h2>
              <button 
                onClick={() => { setEditCat(null); setEditImagePreview(null); setEditImageFile(null); }}
                className='text-gray-400 hover:text-gray-600 transition-colors p-1'
              >
                <MdClose size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className='flex flex-col gap-5'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-700'>Category Name</label>
                <input 
                  type='text' 
                  value={editCat.name} 
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  className='w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all'
                 
                  required
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-700'>Category Image</label>
                <div 
                  className='relative w-full h-40 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden group cursor-pointer hover:border-pink-300 transition-colors'
                  onClick={() => fileInputRef.current?.click()}
                >
                  {editImagePreview ? (
                    <Image src={editImagePreview} alt='Preview' fill className='object-cover' />
                  ) : (
                    <div className='flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-pink-500 transition-colors'>
                      <MdImage size={32} className='mb-2' />
                      <span className='text-sm'>Click to upload new image</span>
                    </div>
                  )}
                  <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <span className='text-white font-medium text-sm'>Change Image</span>
                  </div>
                </div>
                <input 
                  type='file' 
                  accept='image/*' 
                  className='hidden' 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>

              <div className='flex justify-end gap-3 mt-4'>
                <button 
                  type='button'
                  onClick={() => { setEditCat(null); setEditImagePreview(null); setEditImageFile(null); }}
                  className='px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors'
                  disabled={isEditing}
                >
                  Cancel
                </button>
                <button 
                  type='submit'
                  className='px-5 py-2.5 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors disabled:bg-pink-300 flex items-center gap-2'
                  disabled={isEditing}
                >
                  {isEditing ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategorListPage
