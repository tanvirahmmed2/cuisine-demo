'use client'
import axios from 'axios'
import Link from 'next/link'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa'

const LoginForm = () => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: ''
    })
    
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const loginHandle = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post('/api/user/login', formData, { withCredentials: true })
            toast.success(response.data.message)
            
            const { role } = response.data.payload
            
            // Role-based redirection
            if (role === 'admin' || role === 'manager' || role === 'sales') {
                window.location.replace('/dashboard')
            } else {
                window.location.replace('/profile')
            }
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className='flex-1 w-full max-w-md'
        >
            <form onSubmit={loginHandle} className='flex flex-col gap-8 bg-white p-10 rounded-xl border border-gray-100'>
                <div className='space-y-2'>
                    <div className='inline-block px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-semibold uppercase tracking-widest rounded-full'>
                        Security Check
                    </div>
                    <h2 className='text-3xl font-semibold text-gray-900 tracking-tight'>Welcome Back.</h2>
                    <p className='text-gray-400 text-xs font-medium'>Sign in to manage your dining experience.</p>
                </div>

                <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="email" className='text-[10px] font-semibold uppercase text-gray-400 tracking-widest ml-1'>Email Address</label>
                        <input 
                            type="email" 
                            id='email' 
                            name='email' 
                            required 
                            value={formData.email} 
                            onChange={handleChange} 
                           
                            className='w-full px-4 py-3 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-pink-500 focus:bg-white transition-all text-sm font-medium'
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <div className='flex items-center justify-between ml-1'>
                            <label htmlFor="password" className='text-[10px] font-semibold uppercase text-gray-400 tracking-widest'>Password</label>
                            <Link href="/forgot-password" size="sm" className='text-[10px] font-semibold uppercase text-gray-300 hover:text-pink-600 transition-colors'>Forgot?</Link>
                        </div>
                        <input 
                            type="password" 
                            id='password' 
                            name='password' 
                            required 
                            value={formData.password} 
                            onChange={handleChange} 
                           
                            className='w-full px-4 py-3 bg-gray-50 border border-gray-50 rounded-xl outline-none focus:border-pink-500 focus:bg-white transition-all text-sm font-medium'
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                    <button 
                        type='submit' 
                        disabled={loading}
                        className='w-full py-4 bg-pink-500 text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-pink-600 transition-all active:scale-[0.98] shadow-xl shadow-pink-900/10 disabled:opacity-50'
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>

                    <p className='text-center text-xs text-gray-400 font-medium'>
                        Don't have an account? <Link href='/register' className='text-gray-900 font-semibold hover:underline'>Create one</Link>
                    </p>
                </div>
            </form>
        </motion.div>
    )
}

export default LoginForm
