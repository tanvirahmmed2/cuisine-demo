'use client'
import Image from 'next/image'
import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Context } from '../context/Context'
import { BiCartDownload } from "react-icons/bi";

const Item = ({ item }) => {
  const { addToCart } = useContext(Context)

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...item, price: baseWithVariant, selectedVariants: defaultVariants });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
      className='group relative bg-white flex flex-col rounded-md overflow-hidden transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-50'
    >
      <Link href={`/menu/${item.slug}`} className='relative aspect-4/5 overflow-hidden bg-gray-50'>
        <Image 
          src={item.image} 
          alt={item.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className='object-cover transition-transform duration-1000 group-hover:scale-105' 
        />
        
        {hasDiscount && (
          <div className='absolute top-5 left-5 z-10'>
            <div className='bg-white/90 backdrop-blur-md text-pink-600 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-2xl shadow-sm'>
              -৳{item.discount}
            </div>
          </div>
        )}

        <div className='absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
      </Link>

      <div className='p-3 pt-5 flex flex-col gap-4'>
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]'>{item.category_name}</span>
            {item.variants && item.variants.length > 0 && (
                <div className='flex items-center gap-1'>
                    <div className='w-1 h-1 rounded-full bg-emerald-500 animate-pulse' />
                    <span className='text-[8px] font-bold text-gray-400 uppercase tracking-tighter'>Custom</span>
                </div>
            )}
          </div>
          <Link href={`/menu/${item.slug}`} className='text-lg font-serif text-gray-900 hover:text-pink-600 transition-colors line-clamp-1 leading-tight'>
            {item.title}
          </Link>
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            {hasDiscount && (
              <p className='text-[10px] line-through text-pink-300 font-sans'>৳{baseWithVariant.toFixed(2)}</p>
            )}
            <p className='text-2xl font-sans font-medium text-gray-900 tracking-tight'>৳{currentPrice.toFixed(2)}</p>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className='w-12 h-12 flex transition ease-in-out duration-700 rounded-2xl items-center justify-center   active:scale-90 '
          >
            <BiCartDownload size={22} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Item
