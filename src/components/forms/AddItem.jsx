// components/forms/AddProduct.jsx
'use client'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { Context } from '../context/Context'
import TiptapEditor from './TiptapEditor'

const AddItem = () => {
    const { categories } = useContext(Context)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        discount: '0',
        category_id: '',
        image: null,
    })
    const [variants, setVariants] = useState([])

    const addVariantField = () => {
        setVariants([...variants, { name: '', value: '', price_adjustment: 0, is_default: false }])
    }

    const removeVariantField = (index) => {
        const newVariants = [...variants]
        newVariants.splice(index, 1)
        setVariants(newVariants)
    }

    const handleVariantChange = (index, e) => {
        const { name, value, type, checked } = e.target
        const newVariants = [...variants]
        newVariants[index][name] = type === 'checkbox' ? checked : value
        setVariants(newVariants)
    }

    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (files) {
            setFormData({ ...formData, image: files[0] })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const addNewItem = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const newData = new FormData()
            newData.append('title', formData.title)
            newData.append('description', formData.description)
            newData.append('price', formData.price)
            newData.append('discount', formData.discount)
            newData.append('category_id', formData.category_id)
            newData.append('image', formData.image)
            newData.append('variants', JSON.stringify(variants))

            const response = await axios.post('/api/product', newData, { withCredentials: true })
            toast.success(response.data.message)
            
            setVariants([])
            
            setFormData({
                title: '',
                description: '',
                price: '',
                discount: '0',
                category_id: '',
                image: null,
            })
            e.target.reset()
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || 'Failed to add item')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={addNewItem} className='w-full flex flex-col items-center justify-center gap-4 border-b border-slate-200 p-6 bg-white rounded-xl shadow-sm'>
            <h1 className='text-2xl font-bold text-slate-800 self-start'>Add New Item</h1>
            
            <div className='w-full flex flex-col gap-1.5'>
                <label htmlFor="title" className='text-sm font-medium text-slate-700'>Title</label>
                <input type="text" name='title' id='title' required value={formData.title} onChange={handleChange} 
                    className='w-full p-2 px-3 outline-none border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/5 focus:border-pink-500 transition-all' />
            </div>

            <div className='w-full flex flex-col gap-1.5'>
                <label htmlFor="description" className='text-sm font-medium text-slate-700'>Description</label>
                <TiptapEditor 
                    content={formData.description} 
                    onChange={(html) => setFormData({ ...formData, description: html })} 
                />
            </div>

            <div className='w-full flex flex-col gap-1.5'>
                <label htmlFor="category_id" className='text-sm font-medium text-slate-700'>Category</label>
                <select name="category_id" id="category_id" required value={formData.category_id} onChange={handleChange} 
                    className='w-full p-2 px-3 outline-none border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/5 focus:border-pink-500 transition-all bg-white'>
                    <option value="">--Select Category--</option>
                    {categories && categories.map((cat) => (
                        <option value={cat.id} key={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className='flex w-full gap-4'>
                <div className='w-1/2 flex flex-col gap-1.5'>
                    <label htmlFor="price" className='text-sm font-medium text-slate-700'>Price</label>
                    <input type="number" name='price' id='price' min={0} step="0.01" required value={formData.price} onChange={handleChange} 
                        className='w-full p-2 px-3 outline-none border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/5 focus:border-pink-500 transition-all' />
                </div>
                <div className='w-1/2 flex flex-col gap-1.5'>
                    <label htmlFor="discount" className='text-sm font-medium text-slate-700'>Discount Value</label>
                    <input type="number" name='discount' id='discount' min={0} value={formData.discount} onChange={handleChange} 
                        className='w-full p-2 px-3 outline-none border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/5 focus:border-pink-500 transition-all' />
                </div>
            </div>

            <div className='w-full flex flex-col gap-1.5'>
                <label htmlFor="image" className='text-sm font-medium text-slate-700'>Item Image</label>
                <input type="file" accept='image/*' required name='image' onChange={handleChange} id='image' 
                    className='w-full p-1.5 px-3 outline-none border border-slate-300 rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200' />
            </div>

            {/* Variants Section */}
            <div className='w-full flex flex-col gap-4 mt-4 border-t border-slate-100 pt-4'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-bold text-slate-800'>Variants (Sizes/Add-ons)</h3>
                    <button type='button' onClick={addVariantField} className='text-xs font-bold bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all'>
                        + Add Variant
                    </button>
                </div>
                
                {variants.length > 0 && (
                    <div className='flex flex-col gap-3'>
                        {variants.map((variant, index) => (
                            <div key={index} className='grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl relative group'>
                                <div className='flex flex-col gap-1'>
                                    <input type="text" name="name" value={variant.name} onChange={(e) => handleVariantChange(index, e)} required className='w-full p-1.5 text-sm outline-none border border-slate-300 rounded-lg focus:border-pink-500 transition-all' />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <input type="text" name="value" value={variant.value} onChange={(e) => handleVariantChange(index, e)} required className='w-full p-1.5 text-sm outline-none border border-slate-300 rounded-lg focus:border-pink-500 transition-all' />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <input type="number" name="price_adjustment" value={variant.price_adjustment} onChange={(e) => handleVariantChange(index, e)} className='w-full p-1.5 text-sm outline-none border border-slate-300 rounded-lg focus:border-pink-500 transition-all' />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <label className='flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer'>
                                        <input type="checkbox" name="is_default" checked={variant.is_default} onChange={(e) => handleVariantChange(index, e)} className='w-4 h-4 accent-black' />
                                        Default
                                    </label>
                                    <button type='button' onClick={() => removeVariantField(index)} className='ml-auto text-red-500 hover:text-red-700 transition-all'>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button 
                type='submit' 
                disabled={loading}
                className={`w-full md:w-auto mt-2 bg-pink-500 text-white p-2 px-10 rounded-lg font-semibold shadow-md active:scale-95 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800 cursor-pointer'}`}>
                {loading ? 'Adding Item...' : 'Create Item'}
            </button>
        </form>
    )
}

export default AddItem