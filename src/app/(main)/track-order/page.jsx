'use client'
import React, { useState, useContext } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MdSearch, MdOutlineReceiptLong, MdRestaurant, MdDeliveryDining, MdCheckCircleOutline, MdClose, MdPrint } from 'react-icons/md'
import { Context } from '@/components/context/Context'
import { generateReceipt } from '@/lib/database/print'

const TrackOrder = () => {
    const { siteData } = useContext(Context)
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [orders, setOrders] = useState([])
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        const cleanQuery = query.trim()
        if (!cleanQuery) return toast.error("Please enter a phone number or order ID")

        setLoading(true)
        try {
            const res = await axios.get(`/api/order/track?q=${encodeURIComponent(cleanQuery)}`)
            if (res.data.success) {
                setOrders(res.data.payload)
                setSearched(true)
                if (res.data.payload.length === 0) {
                    toast.error("No orders found matching details")
                } else {
                    toast.success(`Found ${res.data.payload.length} order(s)`)
                }
            }
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || "Failed to search orders")
        } finally {
            setLoading(false)
        }
    }

    const getStatusStep = (status) => {
        const s = status?.toLowerCase()
        if (s === 'pending') return 1
        if (s === 'confirmed') return 2
        if (s === 'delivered') return 3
        if (s === 'cancelled') return -1
        return 1
    }

    const steps = [
        { label: 'Pending', icon: MdOutlineReceiptLong },
        { label: 'Confirmed', icon: MdRestaurant },
        { label: 'Delivered', icon: MdDeliveryDining }
    ]

    return (
        <div className="w-full max-w-4xl mx-auto py-16 px-6 flex flex-col gap-10 min-h-[70vh]">
            <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tight">Track Your Feast</h1>
                <p className="text-gray-500 text-sm md:text-base font-light max-w-md mx-auto">
                    Enter your Order ID or phone number used during order placement to view live order progress.
                </p>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-md mx-auto flex items-center gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-pink-900/5 focus-within:border-pink-500/30 transition-all duration-300">
                <div className="flex-1 flex items-center gap-2.5 px-3">
                    <MdSearch size={22} className="text-gray-400" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Order ID or Phone Number..." 
                        className="w-full py-2 bg-transparent text-sm font-semibold outline-none text-gray-800 placeholder-gray-400"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-pink-500/20 active:scale-95"
                >
                    {loading ? 'Searching...' : 'Track'}
                </button>
            </form>

            {/* Results Section */}
            {searched && (
                <div className="w-full flex flex-col gap-8">
                    {orders.length > 0 ? (
                        orders.map((order) => {
                            const currentStep = getStatusStep(order.status)
                            return (
                                <div key={order.id} className="w-full bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-8">
                                    
                                    {/* Order Header Info */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500">Order ID</p>
                                            <h3 className="text-lg font-bold text-gray-900 font-serif">#{order.id.toString().slice(-6).toUpperCase()}</h3>
                                            <p className="text-[10px] font-medium text-gray-400">Placed on {new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3 items-center">
                                            <button 
                                                onClick={() => generateReceipt(order, siteData)}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-sm"
                                            >
                                                <MdPrint size={15} />
                                                <span>Print Receipt</span>
                                            </button>
                                            <span className="px-3.5 py-1.5 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider">
                                                {order.delivery_method === 'takein' ? `Table ${order.table_no}` : 'Takeaway'}
                                            </span>
                                            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                                                order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                            }`}>
                                                {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stepper Status Indicator */}
                                    {currentStep === -1 ? (
                                        <div className="w-full py-4 px-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center gap-3">
                                            <MdClose size={22} />
                                            <span className="text-xs font-bold uppercase tracking-wider">This order has been cancelled</span>
                                        </div>
                                    ) : (
                                        <div className="w-full py-4 flex flex-col md:flex-row items-center justify-between gap-8 relative px-4">
                                            {/* Progress connecting line for larger screens */}
                                            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-gray-100 -z-10">
                                                <div 
                                                    className="h-full bg-pink-500 transition-all duration-500" 
                                                    style={{ width: `${(Math.max(0, currentStep - 1) / (steps.length - 1)) * 100}%` }}
                                                />
                                            </div>

                                            {steps.map((step, idx) => {
                                                const StepIcon = step.icon
                                                const stepNum = idx + 1
                                                const isActive = stepNum <= currentStep
                                                const isCurrent = stepNum === currentStep

                                                return (
                                                    <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2.5 flex-1 w-full md:w-auto">
                                                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                                            isCurrent ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/30' :
                                                            isActive ? 'bg-pink-50 border-pink-200 text-pink-500' :
                                                            'bg-white border-gray-100 text-gray-300'
                                                        }`}>
                                                            {isActive && stepNum < currentStep ? (
                                                                <MdCheckCircleOutline size={20} />
                                                            ) : (
                                                                <StepIcon size={20} />
                                                            )}
                                                        </div>
                                                        <div className="text-left md:text-center">
                                                            <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</p>
                                                            {isCurrent && (
                                                                <span className="text-[9px] font-bold text-pink-500 uppercase tracking-widest bg-pink-50 px-2 py-0.5 rounded-full mt-1 inline-block">Active</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {/* Order Items Table/Summary */}
                                    <div className="w-full flex flex-col gap-4 border-t border-gray-50 pt-6">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Items</p>
                                        <div className="flex flex-col gap-3">
                                            {order.items?.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-pink-500">{item.quantity}x</span>
                                                        <span className="font-semibold text-gray-700">{item.title}</span>
                                                    </div>
                                                    <span className="font-mono text-gray-900 font-semibold">৳{(Number(item.price - (item.discount || 0)) * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary Calculations */}
                                    <div className="w-full border-t border-gray-50 pt-5 flex justify-between items-center bg-gray-50/50 p-4 rounded-xl">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Payment via</p>
                                            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">{order.payment_method}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Total Bill</p>
                                            <p className="text-xl font-bold text-gray-900 font-mono">৳{Number(order.total_price).toLocaleString()}</p>
                                        </div>
                                    </div>

                                </div>
                            )
                        })
                    ) : (
                        <div className="w-full text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-xs">
                            <p className="text-gray-400 text-sm font-semibold">No active orders matching this detail.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TrackOrder
