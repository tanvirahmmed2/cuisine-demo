// components/forms/WebsiteDetails.jsx
'use client'
import axios from 'axios'
import React, { useState, useEffect, useContext } from 'react'
import toast from 'react-hot-toast'
import { Context } from '../context/Context'

const WebsiteDetails = () => {
    const { siteData } = useContext(Context)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        hero_title: '',
        hero_subtitle: '',
        email: '',
        phone: '',
        address: '',
        sociallink: '',
        theme_color: '#10b981',
        logo_url: ''
    })

    useEffect(() => {
        if (siteData) {
            setFormData({
                name: siteData.name || '',
                tagline: siteData.tagline || '',
                hero_title: siteData.hero_title || '',
                hero_subtitle: siteData.hero_subtitle || '',
                email: siteData.email || '',
                phone: siteData.phone || '',
                address: siteData.address || '',
                sociallink: siteData.sociallink || '',
                theme_color: siteData.theme_color || '#10b981',
                logo_url: siteData.logo_url || ''
            })
        }
    }, [siteData])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post('/api/website', formData, { withCredentials: true })
            toast.success(response.data.message)
            // Optionally refresh context or page
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || 'Failed to update settings')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='p-8 flex flex-col gap-8'>
            <div className='flex items-center justify-between border-b border-gray-100 pb-6'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800'>Website Settings</h2>
                    <p className='text-sm text-gray-500'>Update your restaurant's branding and info.</p>
                </div>
                <button 
                    type='submit' 
                    disabled={loading}
                    className='px-6 py-2 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all active:scale-95 disabled:opacity-50'
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* General Info */}
                <div className='flex flex-col gap-4'>
                    <h3 className='text-xs font-bold uppercase text-pink-600 tracking-wider'>General Info</h3>
                    
                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-bold text-gray-400 uppercase'>Restaurant Name</label>
                        <input type="text" name='name' value={formData.name} required onChange={handleChange} className='p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition-all'/>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-bold text-gray-400 uppercase'>Website Tagline</label>
                        <input type="text" name='tagline' value={formData.tagline} required onChange={handleChange} className='p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition-all'/>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-bold text-gray-400 uppercase'>Hero Title</label>
                        <input type="text" name='hero_title' value={formData.hero_title} required onChange={handleChange} className='p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition-all'/>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-bold text-gray-400 uppercase'>Hero Subtitle</label>
                        <textarea name="hero_subtitle" value={formData.hero_subtitle} required onChange={handleChange} className='p-3 bg-gray-50 border border-gray-200 rounded-xl h-28 outline-none focus:border-pink-500 transition-all resize-none'></textarea>
                    </div>
                </div>

                {/* Contact Info */}
                <div className='flex flex-col gap-4'>
                    <h3 className='text-xs font-bold uppercase text-pink-600 tracking-wider'>Contact & Location</h3>
                    
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex flex-col gap-1'>
                            <label className='text-xs font-bold text-gray-400 uppercase'>Email</label>
                            <input type="email" name='email' value={formData.email} required onChange={handleChange} className='p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition-all' />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label className='text-xs font-bold text-gray-400 uppercase'>Phone</label>
                            <input type="text" name='phone' value={formData.phone} required onChange={handleChange} className='p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition-all' />
                        </div>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-bold text-gray-400 uppercase'>Street Address</label>
                        <input type="text" name='address' value={formData.address} required onChange={handleChange} className='p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition-all' />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-xs font-bold text-gray-400 uppercase'>Social Link</label>
                        <input type="text" name='sociallink' value={formData.sociallink} onChange={handleChange} className='p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-500 transition-all'/>
                    </div>
                    
                    <div className='flex flex-col gap-1 mt-4'>
                        <h3 className='text-xs font-bold uppercase text-pink-600 tracking-wider'>Preferences</h3>
                        <label className='text-xs font-bold text-gray-400 uppercase'>Theme Color</label>
                        <div className='flex items-center gap-2'>
                            <input type="color" name="theme_color" value={formData.theme_color} onChange={handleChange} className='w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent'/>
                            <input type="text" name="theme_color" value={formData.theme_color} onChange={handleChange} className='flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase'/>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default WebsiteDetails
