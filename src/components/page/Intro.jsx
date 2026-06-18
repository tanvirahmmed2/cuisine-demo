'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext, useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Context } from '../context/Context'

const Intro = () => {
  const { siteData } = useContext(Context)
  const [items, setItems] = useState(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/product/discount/latest', { withCredentials: true })
        setItems(response.data.payload)
      } catch (error) {
        setItems(null)
      }
    }
    fetchItems()
  }, [])

  const item = useMemo(() => {
    if (!items || items.length === 0) return null
    return items[Math.floor(Math.random() * items.length)]
  }, [items])

  if (!item) return null

  return (
    <section className='relative w-full min-h-screen bg-[#fafafa] flex items-center justify-center py-20 px-6 overflow-hidden'>
      
      {/* Background accents */}
      <div className='absolute top-0 right-0 w-1/3 h-full bg-pink-50/50 -skew-x-12 translate-x-1/4 -z-10' />
      
      <div className='max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center'>
        
        {/* Left Column: Text Content */}
        <div className='lg:col-span-5 space-y-12 z-10'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='space-y-6'
          >
            <div className='flex items-center gap-4'>
              <span className='h-px w-8 bg-pink-500' />
              <span className='text-[10px] font-bold text-pink-500 uppercase tracking-[0.4em]'>
                {siteData?.name || 'EST. 2024'}
              </span>
            </div>
            
            <h1 className='text-6xl md:text-8xl font-serif text-gray-900 leading-[0.9] tracking-tight'>
              Taste the <br />
              <span className=' font-normal text-pink-500/80'>Extraordinary</span>
            </h1>

            <p className='text-gray-500 text-lg md:text-xl font-light max-w-md leading-relaxed'>
              {siteData?.meta_description || "Experience culinary excellence with our curated selection of fine dishes and seasonal flavors."}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className='flex flex-wrap gap-5'
          >
            <Link href='/menu' className='px-10 py-4 bg-gray-900 text-white rounded-full  font-bold text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95'>
              View Menu
            </Link>
            <Link href='/reservation' className='px-10 py-4 border border-gray-200 text-gray-900 bg-white rounded-full  font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95'>
              Reservation
            </Link>
          </motion.div>

          {/* Social Proof / Tiny Details */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className='flex gap-10 pt-4 border-t border-gray-100'
          >
            <div className='space-y-1'>
              <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Ingredients</p>
              <p className='text-sm font-serif  text-gray-800'>100% Organic & Local</p>
            </div>
            <div className='space-y-1'>
              <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Service</p>
              <p className='text-sm font-serif  text-gray-800'>Chef&apos;s Special Touch</p>
            </div>
          </motion.div>
        </div>

        <div className='lg:col-span-7 relative'>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className='relative flex items-center justify-center lg:justify-end'
          >
            
            <div className='relative w-full aspect-square max-w-lg overflow-hidden rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]'>
              <Image 
                src={item.image} 
                alt={item.title} 
                fill 
                className='object-cover hover:scale-105 transition-transform duration-1000'
              />
              <div className='absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none' />
            </div>

         

            <div className='absolute -top-10 right-0 w-32 h-32 border-t-2 border-r-2 border-pink-100 rounded-tr-[3rem] -z-10' />
          </motion.div>
        </div>

      </div>

      <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30'>
         <p className='text-[10px] font-bold uppercase tracking-[0.5em] [writing-mode:vertical-lr] text-gray-400'>Scroll</p>
         <div className='w-px h-12 bg-linear-to-b from-pink-500 to-transparent' />
      </div>

    </section>
  )
}

export default Intro