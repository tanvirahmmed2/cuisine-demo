'use client'
import React, { useState, useMemo } from 'react'
import AddtoCart from '@/components/buttons/AddtoCart'
import Image from 'next/image'

const ItemDetails = ({ product }) => {
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const defaults = {}
    if (product.variants) {
      product.variants.forEach(v => {
        if (!defaults[v.name] || v.is_default) {
          defaults[v.name] = v
        }
      })
    }
    return defaults
  })

  const totalPrice = useMemo(() => {
    let price = parseFloat(product.price)
    Object.values(selectedVariants).forEach(v => {
      price += parseFloat(v.price_adjustment || 0)
    })
    return price
  }, [product.price, selectedVariants])

  const hasDiscount = product.discount !== 0 && product.discount !== null;
  const currentPrice = hasDiscount ? totalPrice - Number(product.discount) : totalPrice;

  const handleVariantSelect = (groupName, variant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [groupName]: variant
    }))
  }

  const groupedVariants = useMemo(() => {
    const groups = {}
    if (product.variants) {
      product.variants.forEach(v => {
        if (!groups[v.name]) groups[v.name] = []
        groups[v.name].push(v)
      })
    }
    return groups
  }, [product.variants])

  return (
    <div className='bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100'>
      <div className='flex flex-col lg:flex-row w-full'>
        {/* Image Section */}
        <div className='w-full lg:w-1/2 aspect-square relative overflow-hidden bg-slate-50'>
          <div className='absolute right-6 top-6 z-20'>
            {product.is_available ? (
              <span className='text-[10px] font-black uppercase tracking-[0.2em] text-white py-2 px-5 rounded-full bg-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.3)]'>
                In Stock
              </span>
            ) : (
              <span className='text-[10px] font-black uppercase tracking-[0.2em] text-white py-2 px-5 rounded-full bg-rose-500 shadow-[0_8px_20px_rgba(244,63,94,0.3)]'>
                Sold Out
              </span>
            )}
          </div>
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority
            className="object-cover transition-transform duration-1000 hover:scale-110"
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none' />
        </div>

        {/* Content Section */}
        <div className='w-full lg:w-1/2 p-8 md:p-14 flex flex-col gap-10 bg-white'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <p className='text-[11px] font-black uppercase text-pink-500 tracking-[0.3em]'>
                {product.category_name}
              </p>
              <h1 className='text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight'>
                {product.title}
              </h1>
            </div>
            <div 
              className='text-slate-500 leading-relaxed text-lg font-medium prose prose-slate max-w-none'
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Variants Section */}
          {Object.keys(groupedVariants).length > 0 && (
            <div className='flex flex-col gap-8 py-10 border-y border-slate-100'>
              {Object.entries(groupedVariants).map(([groupName, variants]) => (
                <div key={groupName} className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <h3 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>{groupName}</h3>
                    <div className='h-px flex-1 bg-slate-100' />
                  </div>
                  <div className='flex flex-wrap gap-3'>
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleVariantSelect(groupName, v)}
                        className={`group relative px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                          selectedVariants[groupName]?.id === v.id
                            ? 'bg-pink-500 text-white border-pink-500 shadow-[0_10px_25px_rgba(0,0,0,0.2)] scale-[1.02]'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-pink-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className='relative z-10'>{v.value}</span>
                        {v.price_adjustment > 0 && (
                          <span className={`ml-2 text-[10px] font-black ${
                            selectedVariants[groupName]?.id === v.id ? 'text-white/60' : 'text-pink-500'
                          }`}>
                            +৳{v.price_adjustment}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-8">
            <div className='flex flex-col gap-1'>
              <span className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>Price Amount</span>
              {hasDiscount && (
                <span className="text-lg line-through text-slate-300 font-bold tracking-tighter">
                  ৳{totalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                ৳{currentPrice.toFixed(2)}
              </span>
            </div>
            <div className='scale-110 origin-right'>
              <AddtoCart product={{ ...product, price: totalPrice, selectedVariants }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetails
