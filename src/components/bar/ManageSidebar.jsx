'use client'
import Link from 'next/link'
import React, { useContext, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import {
  MdDashboard,
  MdSell,
  MdPendingActions,
  MdCheckCircle,
  MdHistory,
  MdInventory,
  MdCategory,
  MdPayments,
  MdPeople,
  MdAnalytics,
  MdEvent,
  MdSupportAgent,
  MdSettings,
  MdExitToApp,
  MdPublic,
  MdLocalOffer,
  MdRateReview,
  MdDownload,
  MdPerson,
  MdMessage
} from 'react-icons/md'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Context } from '../context/Context'

const ManageSidebar = () => {
  const pathname = usePathname()
  const { manageSidebar, setManageSidebar, userData } = useContext(Context)
  const role = userData?.role || ''

  const handleLogout = async () => {
    try {
      const res = await axios.get('/api/user/logout', { withCredentials: true })
      toast.success(res.data.message)
      window.location.replace('/login')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to logout')
    }
  }

  const handleDownloadDB = async () => {
    try {
      toast.loading('Preparing database...')
      window.location.href = '/api/admin/database/download'
      toast.dismiss()
    } catch (error) {
      toast.error('Failed to download database')
    }
  }

  const linkStyle = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm
     ${pathname === path
      ? 'bg-pink-500 text-white shadow-lg shadow-pink-900/10'
      : 'text-gray-500 hover:bg-gray-50 hover:text-pink-600'}`

  const menuItems = useMemo(() => {
    const items = {
      sales: [
        { name: 'POS Sale', href: '/dashboard/sales/sale', icon: <MdSell /> },
        { name: 'Pending', href: '/dashboard/sales/pending', icon: <MdPendingActions /> },
        { name: 'Deliver', href: '/dashboard/sales/deliver', icon: <MdCheckCircle /> },
        { name: 'History', href: '/dashboard/sales/orders', icon: <MdHistory /> },
      ],
      manager: [
        { name: 'Items', href: '/dashboard/manager/items', icon: <MdInventory /> },
        { name: 'Categories', href: '/dashboard/manager/categories', icon: <MdCategory /> },
        { name: 'Expenses', href: '/dashboard/manager/expenses', icon: <MdPayments /> },
        { name: 'History', href: '/dashboard/manager/history', icon: <MdHistory /> },
        { name: 'Reservations', href: '/dashboard/manager/reservation', icon: <MdEvent /> },
        { name: 'Reviews', href: '/dashboard/manager/reviews', icon: <MdRateReview /> },
        { name: 'Contact', href: '/dashboard/manager/contact', icon: <MdSupportAgent /> },
        { name: 'Chat', href: '/dashboard/manager/support', icon: <MdMessage /> },
        { name: 'Offers', href: '/dashboard/manager/offers', icon: <MdLocalOffer /> },
      ],
      admin: [
        { name: 'Overview', href: '/dashboard/admin', icon: <MdDashboard /> },
        { name: 'History', href: '/dashboard/admin/history', icon: <MdHistory /> },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: <MdAnalytics /> },
        { name: 'People', href: '/dashboard/admin/people', icon: <MdPeople /> },
        { name: 'Customers', href: '/dashboard/admin/customers', icon: <MdPerson /> },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: <MdSettings /> },
      ]
    }
    return items
  }, [])

  return (
    <aside className={`fixed top-14 left-0 bottom-0 z-40 w-72 bg-white border-r border-gray-100 transition-transform duration-500 ease-in-out flex flex-col p-6 gap-6 overflow-y-auto ${manageSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>

      {/* Role Badge */}
      <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Active Session</p>
        <p className="text-sm font-semibold text-black capitalize">{role} Access</p>
      </div>

      <div className="flex-1 flex flex-col gap-6">

        {/* Dashboard Home */}
        <div className="flex flex-col gap-1">
          <Link href="/dashboard" className={linkStyle('/dashboard')}>
            <span className="text-xl"><MdDashboard /></span> Home
          </Link>
        </div>

        {/* Role Specific Section */}
        {role === 'admin' && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest px-4 mb-2">Admin Panel</p>
            {menuItems.admin.map((item) => (
              <Link key={item.href} href={item.href} className={linkStyle(item.href)}>
                <span className="text-xl">{item.icon}</span> {item.name}
              </Link>
            ))}
            <button
              onClick={handleDownloadDB}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm text-gray-500 hover:bg-gray-50 hover:text-pink-600 w-full text-left"
            >
              <span className="text-xl"><MdDownload /></span> Download DB
            </button>
          </div>
        )}

        {role === 'manager' && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest px-4 mb-2">Management</p>
            {menuItems.manager.map((item) => (
              <Link key={item.href} href={item.href} className={linkStyle(item.href)}>
                <span className="text-xl">{item.icon}</span> {item.name}
              </Link>
            ))}
          </div>
        )}

        {role === 'sales' && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest px-4 mb-2">Sales Ops</p>
            {menuItems.sales.map((item) => (
              <Link key={item.href} href={item.href} className={linkStyle(item.href)}>
                <span className="text-xl">{item.icon}</span> {item.name}
              </Link>
            ))}
          </div>
        )}

      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-1 pt-6 border-t border-gray-100">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 font-semibold text-sm hover:bg-gray-50 hover:text-pink-600 transition-all">
          <span className="text-xl"><MdPublic /></span> Website
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 font-semibold text-sm hover:bg-rose-50 transition-all cursor-pointer"
        >
          <span className="text-xl"><MdExitToApp /></span> Logout
        </button>
      </div>

    </aside>
  )
}

export default ManageSidebar