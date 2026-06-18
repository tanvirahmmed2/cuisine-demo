'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MdClose, MdLocalOffer, MdTimer } from 'react-icons/md'
import Link from 'next/link'

const OfferPopup = ({ initialOffers = [] }) => {
  const [offers, setOffers] = useState(initialOffers)
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (offers.length > 0) {
      setTimeout(() => {
        setIsOpen(true)
      }, 1500)
    }
  }, [offers])

  // Auto-slider logic
  useEffect(() => {
    if (!isOpen || offers.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isOpen, offers.length])

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!isOpen || offers.length === 0) return null

  const currentOffer = offers[currentIndex]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-sm md:max-w-md rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-pink-600 hover:bg-white shadow-sm transition-colors"
            >
              <MdClose size={20} />
            </button>

            {/* Slider Container */}
            <div className="relative w-full aspect-video md:h-56 bg-gray-100 overflow-hidden shrink-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentOffer.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image 
                    src={currentOffer.image} 
                    alt={currentOffer.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={true}
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Slider Indicators */}
              {offers.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {offers.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-pink-500 w-6' : 'bg-white/50 hover:bg-white'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col gap-4 relative bg-white flex-1 overflow-y-auto">
              <div className="absolute -top-6 right-8 w-12 h-12 bg-pink-500 text-white rounded-2xl shadow-xl flex items-center justify-center rotate-6 shrink-0">
                <MdLocalOffer size={24} />
              </div>

              <div className="space-y-2 pr-8">
                <p className="text-[10px] font-black uppercase text-pink-600 tracking-widest">Special Offer</p>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentOffer.id + "-title"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {currentOffer.title}
                    </motion.span>
                  </AnimatePresence>
                </h3>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentOffer.id + "-desc"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="prose prose-sm prose-slate max-w-none line-clamp-3 text-gray-500"
                  dangerouslySetInnerHTML={{ __html: currentOffer.description }}
                />
              </AnimatePresence>

              {currentOffer.end_date && (
                <div className="bg-pink-50 text-pink-600 px-4 py-2 rounded-xl text-xs font-bold self-start flex items-center gap-2">
                  <MdTimer size={16} className="animate-pulse" />
                  Valid until: {new Date(currentOffer.end_date).toLocaleDateString()}
                </div>
              )}

              <Link 
                href="/offers" 
                onClick={handleClose}
                className="w-full mt-4 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm text-center uppercase tracking-widest hover:bg-pink-600 transition-colors shadow-lg shadow-gray-900/20 shrink-0"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default OfferPopup
