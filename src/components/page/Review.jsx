'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { RiMapPinUserLine, RiDoubleQuotesL, RiStarFill, RiCloseLine, RiChatQuoteLine } from 'react-icons/ri'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import TiptapEditor from '../forms/TiptapEditor'

const Review = () => {
    const [reviews, setReviews] = useState([])
    const [index, setIndex] = useState(0)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        comment: '',
        rating: 5
    })

    const fetchReviews = async () => {
        try {
            const res = await axios.get('/api/review', { withCredentials: true })
            setReviews(res.data.payload || [])
        } catch (error) {
            setReviews([])
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [])

    useEffect(() => {
        if (reviews.length === 0) return
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % reviews.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [reviews])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post('/api/review', formData)
            toast.success(res.data.message)
            setIsFormOpen(false)
            setFormData({ name: '', email: '', comment: '', rating: 5 })
            fetchReviews()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='w-full py-32 bg-white overflow-hidden border-t border-gray-100'>
            <div className='max-w-7xl mx-auto px-6'>
                
                <div className='flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20'>
                    <div className='space-y-4'>
                        <div className='flex items-center gap-3 text-pink-600 font-sans font-bold uppercase tracking-[0.4em] text-[10px]'>
                            <RiChatQuoteLine className='text-lg' />
                            Testimonials
                        </div>
                        <h2 className='text-5xl md:text-6xl font-serif text-gray-900 tracking-tight'>
                            Guest <span className='italic font-normal text-gray-400'>Voices</span>
                        </h2>
                    </div>
                    
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className='group relative px-10 py-4 border border-gray-200 text-gray-900 rounded-full font-sans font-bold text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all active:scale-95'
                    >
                        Share Your Story
                    </button>
                </div>

                {reviews.length > 0 ? (
                    <div className='relative h-[400px] flex items-center justify-center'>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={reviews[index].id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className='absolute w-full max-w-3xl flex flex-col items-center text-center gap-10'
                            >
                                <RiDoubleQuotesL className='text-7xl text-gray-50/50 absolute -top-10 left-1/2 -translate-x-1/2 -z-10' />
                                
                                <div className='flex flex-col items-center gap-6'>
                                    <div className='w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl text-gray-200 border-4 border-white shadow-xl overflow-hidden'>
                                        <RiMapPinUserLine />
                                    </div>
                                    <div className='flex gap-1'>
                                        {[...Array(5)].map((_, i) => (
                                            <RiStarFill 
                                                key={i} 
                                                className={`text-sm ${i < reviews[index].rating ? 'text-amber-400' : 'text-gray-100'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className='space-y-6'>
                                    <div 
                                        className='text-2xl md:text-3xl font-serif italic text-gray-800 leading-relaxed max-w-2xl text-center prose prose-xl prose-gray'
                                        dangerouslySetInnerHTML={{ __html: reviews[index].comment }}
                                    />
                                    <div className='space-y-1'>
                                        <h3 className='text-lg font-bold text-gray-900 tracking-tight'>{reviews[index].name}</h3>
                                        <p className='text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]'>Verified Guest</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className='h-[400px] flex items-center justify-center text-gray-300 font-serif italic text-xl'>
                        Awaiting your first story...
                    </div>
                )}

                {/* Dots Navigation */}
                {reviews.length > 1 && (
                    <div className='flex justify-center gap-4 mt-12'>
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-1.5 transition-all duration-700 rounded-full ${
                                    i === index ? 'w-12 bg-pink-500' : 'w-4 bg-gray-100 hover:bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Review Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className='fixed inset-0 z-[100] flex items-center justify-center p-6'>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFormOpen(false)}
                            className='absolute inset-0 bg-black/20 backdrop-blur-md'
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className='relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden'
                        >
                            <div className='p-8 border-b border-gray-50 flex items-center justify-between'>
                                <div>
                                    <h3 className='text-2xl font-serif text-gray-900'>Your Experience</h3>
                                    <p className='text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-1'>We value your feedback</p>
                                </div>
                                <button 
                                    onClick={() => setIsFormOpen(false)}
                                    className='w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all'
                                >
                                    <RiCloseLine size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className='p-8 space-y-6'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1'>Name</label>
                                        <input 
                                            required
                                            type='text' 
                                            placeholder='John Doe'
                                            className='w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 transition-all'
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1'>Email</label>
                                        <input 
                                            required
                                            type='email' 
                                            placeholder='john@example.com'
                                            className='w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-pink-500/20 transition-all'
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1'>Rating</label>
                                    <div className='flex gap-2 p-2'>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type='button'
                                                onClick={() => setFormData({...formData, rating: star})}
                                                className={`text-2xl transition-all ${star <= formData.rating ? 'text-amber-400 scale-110' : 'text-gray-100 hover:text-gray-200'}`}
                                            >
                                                <RiStarFill />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1'>Comment</label>
                                    <TiptapEditor 
                                        content={formData.comment}
                                        onChange={(html) => setFormData({...formData, comment: html})}
                                        placeholder='Tell us about your visit...'
                                    />
                                </div>

                                <button 
                                    disabled={loading}
                                    type='submit'
                                    className='w-full py-5 bg-gray-900 text-white rounded-2xl font-sans font-bold text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-900/10 active:scale-[0.98] disabled:opacity-50'
                                >
                                    {loading ? 'Submitting...' : 'Send Review'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default Review