'use client'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Context } from '../context/Context'
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa'

const UpdateUserForm = () => {
    const { userData, setUpdateUserBox } = useContext(Context)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        email: userData?.email || '',
        password: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.patch('/api/user', formData, { withCredentials: true })
            toast.success(res.data.message)
            setUpdateUserBox(false)
            window.location.reload()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Update failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-6'>
            <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="name" className='text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1'>Display Name</label>
                    <div className='relative'>
                        <FaUser className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-300' />
                        <input 
                            type="text" 
                            name='name' 
                            id='name' 
                            required 
                            onChange={handleChange} 
                            value={formData.name} 
                            className='w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-500 focus:bg-white transition-all text-sm' 
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="email" className='text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1'>Email Address</label>
                    <div className='relative'>
                        <FaEnvelope className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-300' />
                        <input 
                            type="email" 
                            name='email' 
                            id='email' 
                            onChange={handleChange} 
                            required 
                            value={formData.email} 
                            className='w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-500 focus:bg-white transition-all text-sm' 
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="password" className='text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1'>New Password (Optional)</label>
                    <div className='relative'>
                        <FaLock className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-300' />
                        <input 
                            type="password" 
                            name='password' 
                            onChange={handleChange} 
                            id='password' 
                            value={formData.password} 
                           
                            className='w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-500 focus:bg-white transition-all text-sm' 
                        />
                    </div>
                </div>
            </div>

            <button 
                type='submit'
                disabled={loading}
                className='w-full py-4 bg-pink-500 text-white rounded-2xl font-black text-sm hover:bg-pink-600 transition-all shadow-xl shadow-pink-900/10 active:scale-[0.98] mt-4 disabled:opacity-50'
            >
                {loading ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
            </button>
        </form>
    )
}

export default UpdateUserForm
