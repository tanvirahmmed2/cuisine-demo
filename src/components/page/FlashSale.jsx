'use client'
import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Context } from '../context/Context'
import { BiCartDownload } from 'react-icons/bi'
import { MdTimer } from 'react-icons/md'

const FlashSale = ({ initialProducts = [] }) => {
  const { addToCart } = useContext(Context)
  const products = initialProducts

  if (!products || products.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const imageVariants = (index) => ({
    hidden: { opacity: 0, scale: 0.8, rotate: index % 2 === 0 ? -5 : 5 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  })

  return (
    <section className='w-full py-32 bg-white overflow-hidden'>
      <div className='max-w-7xl mx-auto px-6 space-y-24'>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className='flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-12'
        >
          <div className='space-y-4'>
            <div className='flex items-center gap-3 text-pink-600 font-sans font-bold uppercase tracking-[0.4em] text-[10px]'>
              <MdTimer className='animate-pulse text-lg' />
              Limited Time Curations
            </div>
            <h2 className='text-5xl md:text-6xl font-serif text-gray-900 tracking-tight'>
              Chef&apos;s <span className='italic font-normal text-gray-400'>Specials</span>
            </h2>
          </div>
          <Link href='/flashsale' className='group flex items-center gap-2 font-sans font-bold text-[10px] uppercase tracking-widest text-gray-400 hover:text-pink-600 transition-colors'>
            View All Offers <span className='group-hover:translate-x-1 transition-transform duration-300'>→</span>
          </Link>
        </motion.div>

        <div className='space-y-40'>
          {products.slice(0, 4).map((item, index) => {
            const hasDiscount = item.discount !== 0 && item.discount !== null;

            let variantAdjustment = 0;
            const defaultVariants = {};
            if (item.variants) {
              item.variants.forEach(v => {
                if (!defaultVariants[v.name] || v.is_default) {
                  defaultVariants[v.name] = v;
                }
              });
              Object.values(defaultVariants).forEach(v => {
                variantAdjustment += Number(v.price_adjustment || 0);
              });
            }

            const baseWithVariant = Number(item.price) + variantAdjustment;
            const currentPrice = hasDiscount ? baseWithVariant - Number(item.discount) : baseWithVariant;
            
            return (
              <div 
                key={item.id} 
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-16 lg:gap-24`}
              >
                <motion.div 
                  variants={imageVariants(index)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }}
                  className='w-full md:w-1/2 lg:w-3/5 relative'
                >
                  <div className='relative aspect-square overflow-hidden rounded-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-8 border-gray-50'>
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                      className='object-cover transition-transform duration-1000 hover:scale-110' 
                    />
                  </div>
                  {hasDiscount && (
                     <motion.div 
                      initial={{ opacity: 0, scale: 0, rotate: -20 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: -12 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      className='absolute -top-4 -left-4 bg-pink-600 text-white px-6 py-3 rounded-xl shadow-[0_20px_40px_-10px_rgba(219,39,119,0.4)] z-20'
                     >
                        <span className='text-xs font-bold uppercase tracking-widest'>Save ৳{item.discount}</span>
                     </motion.div>
                  )}
                  <div className={`absolute -z-10 top-1/2 -translate-y-1/2 ${index % 2 === 0 ? '-left-20' : '-right-20'} w-80 h-80 bg-pink-50 rounded-full blur-3xl opacity-50`} />
                </motion.div>

                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }}
                  className='w-full  flex flex-col items-center lg:items-start text-center lg:text-left'
                >
                  <motion.div variants={itemVariants} className='space-y-4 mb-8'>
                    <span className='text-[10px] font-bold uppercase text-pink-600 tracking-[0.4em]'>{item.category_name}</span>
                    <h2 className='text-5xl md:text-6xl font-serif text-gray-900 leading-[1.1] tracking-tight'>
                      {item.title}
                    </h2>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className='text-gray-500 text-lg leading-relaxed font-light max-w-lg mb-10 prose prose-sm prose-slate max-w-none'
                    dangerouslySetInnerHTML={{ __html: item.description || "<p>A masterpiece of flavor, crafted with hand-picked seasonal ingredients and refined culinary techniques.</p>" }}
                  />

                  <motion.div 
                    variants={itemVariants}
                    className='flex flex-col gap-2 items-center lg:items-start mb-12'
                  >
                    {hasDiscount && <span className='text-sm line-through text-gray-300 font-sans font-medium'>৳{Number(baseWithVariant).toFixed(2)}</span>}
                    <div className='flex items-center gap-3'>
                       <span className='text-5xl md:text-6xl font-sans font-medium text-gray-900 tracking-tighter'>৳{Number(currentPrice).toFixed(2)}</span>
                       <span className='px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-bold rounded-full uppercase tracking-widest'>Special Price</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants}
                    className='w-full flex justify-center lg:justify-start'
                  >
                    <button 
                      onClick={() => addToCart({ ...item, price: baseWithVariant, selectedVariants: defaultVariants })} 
                      className='group relative px-14 py-3 bg-gray-900 text-white rounded-full font-sans font-bold text-xs uppercase tracking-widest overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] active:scale-95 flex items-center justify-center gap-4'
                    >
                      <span className='relative z-10 flex items-center gap-3 text-sm'>
                        <BiCartDownload size={24} />
                        Add to Cart
                      </span>
                      <div className='absolute inset-0 bg-pink-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500' />
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default FlashSale
