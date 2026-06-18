import React from 'react'
import { getBaseUrl, getTenantContext } from '@/lib/tenant/helper'
import ReviewCard from '@/components/card/ReviewCard'
import { RiChatQuoteLine } from 'react-icons/ri'

const ReviewsPage = async () => {
  const baseUrl = await getBaseUrl()
  
  const tenantCtx = await getTenantContext()
  if (!tenantCtx.success) {
    return (
      <div className='w-full min-h-screen flex items-center justify-center bg-gray-50'>
        <p className='text-gray-500 font-semibold'>Website not available.</p>
      </div>
    )
  }

  // Fetch all reviews
  const reviewRes = await fetch(`${baseUrl}/api/review`, { cache: 'no-store' }).catch(() => null)
  const reviews = reviewRes?.ok ? (await reviewRes.json()).payload : []

  return (
    <main className='w-full min-h-screen bg-white pt-32 pb-20'>
      <div className='max-w-7xl mx-auto px-6 space-y-16'>
        
        <div className='flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto'>
          <div className='flex items-center gap-3 text-pink-600 font-sans font-bold uppercase tracking-[0.4em] text-[10px]'>
            <RiChatQuoteLine className='text-lg' />
            All Testimonials
          </div>
          <h1 className='text-5xl md:text-6xl font-serif text-gray-900 tracking-tight'>
            Guest <span className='italic font-normal text-gray-400'>Voices</span>
          </h1>
          <p className='text-gray-500 max-w-xl mx-auto'>
            Read what our valued guests have to say about their experiences dining with us.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className='h-[400px] flex items-center justify-center text-gray-300 font-serif italic text-xl bg-gray-50 rounded-[2rem] border border-gray-100'>
            Awaiting your first story...
          </div>
        )}

      </div>
    </main>
  )
}

export default ReviewsPage
