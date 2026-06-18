import About from '@/components/page/About'
import FlashSale from '@/components/page/FlashSale'
import Intro from '@/components/page/Intro'
import Latest from '@/components/page/Latest'
import Review from '@/components/page/Review'
import OfferPopup from '@/components/page/OfferPopup'
import React from 'react'
import { getBaseUrl, getTenantContext } from '@/lib/tenant/helper'

const Main = async () => {
  const baseUrl = await getBaseUrl()
  
  // Verify tenant exists before fetching all data
  const tenantCtx = await getTenantContext()
  if (!tenantCtx.success) {
    return (
      <div className='w-full min-h-screen flex items-center justify-center bg-gray-50'>
        <p className='text-gray-500 font-semibold'>Website not available.</p>
      </div>
    )
  }

  // Fetch all initial data concurrently
  const [flashSaleRes, latestRes, reviewRes, offerRes] = await Promise.all([
    fetch(`${baseUrl}/api/product/discount/latest`, { cache: 'no-store' }).catch(() => null),
    fetch(`${baseUrl}/api/product/latest`, { cache: 'no-store' }).catch(() => null),
    fetch(`${baseUrl}/api/review`, { cache: 'no-store' }).catch(() => null),
    fetch(`${baseUrl}/api/offer?active=true`, { cache: 'no-store' }).catch(() => null)
  ])

  const flashSales = flashSaleRes?.ok ? (await flashSaleRes.json()).payload : []
  const latestItems = latestRes?.ok ? (await latestRes.json()).payload : []
  const reviews = reviewRes?.ok ? (await reviewRes.json()).payload : []
  const activeOffers = offerRes?.ok ? (await offerRes.json()).payload : []

  return (
    <div className='w-full overflow-hidden min-h-screen flex flex-col items-center justify-center'>
      <Intro/>
      <FlashSale initialProducts={flashSales} />
      <Latest initialProducts={latestItems} />
      <Review initialReviews={reviews} />
      <About/>
      <OfferPopup initialOffers={activeOffers} />
    </div>
  )
}

export default Main
