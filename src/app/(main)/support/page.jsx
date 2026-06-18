'use client'
import { Context } from '@/components/context/Context'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import TiptapEditor from '@/components/forms/TiptapEditor'
import { FaHeadset, FaEnvelope, FaPenNib, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa'

const Support = () => {
    const { siteData } = useContext(Context)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
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
            const response = await axios.post('/api/contact', formData, { withCredentials: true })
            toast.success(response.data.message)
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to submit request')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full min-h-screen bg-gray-50/50 pt-28 pb-20 px-6'>
            <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>

                {/* Info Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.8 }}
                    className='space-y-10'
                >
                    <div className='space-y-4'>
                        <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em]'>
                            <FaHeadset className='text-lg' />
                            Support Center
                        </div>
                        <h1 className='text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-none'>
                            How Can We <span className='text-emerald-600'>Help?</span>
                        </h1>
                    </div>
                    
                    <p className='text-gray-500 text-lg md:text-xl leading-relaxed max-w-lg'>
                        Whether you have a question about your order, need help with a reservation, or just want to say hello, our team is here for you.
                    </p>

                    <div className='space-y-6 pt-6 border-t border-gray-100'>
                        <div className='flex items-center gap-6'>
                            <div className='w-14 h-14 bg-white rounded-2xl shadow-xl shadow-pink-900/5 flex items-center justify-center text-emerald-600 border border-gray-50'>
                                <FaMapMarkerAlt size={22} />
                            </div>
                            <div>
                                <p className='text-[10px] font-black uppercase text-gray-400 tracking-widest'>Our Location</p>
                                <p className='font-bold text-gray-900'>{siteData?.address || 'Main Branch, Mymensingh'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-6'>
                            <div className='w-14 h-14 bg-white rounded-2xl shadow-xl shadow-pink-900/5 flex items-center justify-center text-emerald-600 border border-gray-50'>
                                <FaEnvelope size={22} />
                            </div>
                            <div>
                                <p className='text-[10px] font-black uppercase text-gray-400 tracking-widest'>Official Email</p>
                                <p className='font-bold text-gray-900'>{siteData?.email || 'support@restaurant.com'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Form Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className='bg-white p-10 rounded-[40px] shadow-2xl shadow-pink-900/5 border border-gray-100'
                >
                    <div className='mb-8 text-center'>
                        <h2 className='text-2xl font-black text-gray-900'>Get In Touch</h2>
                        <p className='text-gray-400 text-sm'>We typically respond within 24 hours</p>
                    </div>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1'>Name</label>
                                <input type="text" name='name' required onChange={handleChange} value={formData.name} className='w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm' />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1'>Email</label>
                                <input type="email" name='email' required onChange={handleChange} value={formData.email} className='w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm' />
                            </div>
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label className='text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1'>Subject</label>
                            <div className='relative'>
                                <FaPenNib className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-300' />
                                <input type="text" name='subject' required onChange={handleChange} value={formData.subject} className='w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-emerald-500 transition-all text-sm' />
                            </div>
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label className='text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1'>Detailed Message</label>
                            <TiptapEditor
                                content={formData.message}
                                onChange={(html) => setFormData(prev => ({ ...prev, message: html }))}
                               
                            />
                        </div>

                        <button 
                            type='submit' 
                            disabled={loading}
                            className='group w-full py-5 bg-pink-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-pink-900/10 active:scale-[0.98] disabled:opacity-50 mt-2'
                        >
                            {loading ? 'SENDING...' : (
                                <>
                                    SEND MESSAGE
                                    <FaArrowRight className='group-hover:translate-x-1 transition-transform' />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

            </div>
        </div>
    )
}

export default Support
