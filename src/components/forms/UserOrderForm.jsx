'use client'
import React, { useContext, useState, useEffect } from 'react'
import { Context } from '../context/Context'
import Link from 'next/link'
import Image from 'next/image'
import { MdDeleteOutline, MdArrowBack, MdPayment, MdLocalShipping, MdPerson, MdReceiptLong } from 'react-icons/md'
import axios from 'axios'
import toast from 'react-hot-toast'

const deliveryOptions = [
    { id: 'takeaway', label: 'Takeaway', icon: '🛍️' },
    { id: 'takein', label: 'Dine In', icon: '🍽️' }
]
const paymentOptions = [
    { id: 'bkash', label: 'bKash', color: 'bg-[#e2136e]' },
    { id: 'nagad', label: 'Nagad', color: 'bg-[#f69220]' },
    { id: 'rocket', label: 'Rocket', color: 'bg-[#8c3494]' },
    { id: 'card', label: 'Card', color: 'bg-pink-600' },
    { id: 'cash', label: 'Cash on Delivery', color: 'bg-slate-800' }
]

const UserOrderForm = () => {
    const { subTotal, totalPrice, totalDiscount, addToCart, removeFromCart, decreaseQuantity, clearCart, userData, cart } = useContext(Context)
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        delivery_method: 'takein',
        payment_method: 'bkash',
        transaction_id: '',
    })

    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name || '',
                phone: userData.phone || ''
            }))
        }
    }, [userData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleOrder = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const orderPayload = {
                ...formData,
                items: cart.items,
                sub_total: subTotal,
                total_discount: totalDiscount,
                total_price: totalPrice,
                status: 'pending'
            }
            const res = await axios.post('/api/order', orderPayload, { withCredentials: true })
            toast.success(res.data.message)
            clearCart()
            window.location.replace('/profile')
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || "Failed to place order")
        } finally {
            setLoading(false)
        }
    }

    if (!isMounted) return null;

    if (cart?.items?.length === 0) {
        return (
            <div className='w-full md:w-1/2 min-h-[60vh] p-10 flex flex-col items-center justify-center gap-10 pt-20 px-6 bg-white rounded-[3rem]'>
                <div className='w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-6xl shadow-inner'>🥣</div>
                <div className='text-center space-y-4'>
                    <h2 className='text-4xl font-semibold text-slate-900 tracking-tighter'>The kitchen is quiet...</h2>
                    <p className='text-slate-400 font-medium max-w-sm'>Your cart is waiting for some delicious flavors. Let's find something amazing for you.</p>
                </div>
                <Link href={'/menu'} className='px-12 py-5 bg-pink-500 text-white rounded-2xl font-semibold text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-pink-900/20'>Explore Menu</Link>
            </div>
        )
    }

    return (
        <div className='w-full min-h-screen bg-slate-50/30  p-6'>
            <div className='max-w-7xl mx-auto flex flex-col gap-6'>
                
                <div className='flex items-center gap-6'>
                    <Link href="/menu" className='p-4 bg-white rounded-2xl border border-slate-100 text-slate-300 hover:text-pink-600 hover:shadow-2xl transition-all'>
                        <MdArrowBack size={28} />
                    </Link>
                    <div>
                        <h1 className='text-5xl font-semibold text-slate-900 tracking-tight'>Checkout</h1>
                        <p className='text-slate-400 text-[10px] font-semibold uppercase tracking-[0.3em] mt-2 ml-1'>Order Settlement & Details</p>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
                    
                    <div className='lg:col-span-7 flex flex-col gap-6'>
                        
                        <section className='bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-pink-900/2 space-y-8'>
                            <div className='flex items-center gap-4 border-b border-slate-50 pb-6'>
                                <div className='w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center shadow-sm'><MdPerson size={20}/></div>
                                <h2 className='text-2xl font-semibold text-slate-800 tracking-tight'>Recipient Details</h2>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                <div className='flex flex-col gap-2'>
                                    <label className='text-[10px] font-semibold uppercase text-slate-400 tracking-[0.2em] ml-1'>Full Name</label>
                                    <input type="text" name='name' required onChange={handleChange} value={formData.name} className='w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/5 transition-all font-bold text-slate-700' />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label className='text-[10px] font-semibold uppercase text-slate-400 tracking-[0.2em] ml-1'>Phone Number</label>
                                    <input type="text" name='phone' required onChange={handleChange} value={formData.phone} className='w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/5 transition-all font-bold text-slate-700' />
                                </div>
                            </div>
                        </section>

                        <section className='space-y-2'>
                            <div className='flex items-center justify-between px-2'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm'><MdReceiptLong size={20}/></div>
                                    <h2 className='text-2xl font-semibold text-slate-800 tracking-tight'>Order Review</h2>
                                </div>
                                <button onClick={() => clearCart()} className='text-[10px] font-semibold text-slate-300 hover:text-rose-500 uppercase tracking-widest transition-colors cursor-pointer'>Discard Cart</button>
                            </div>
                            <div className='flex flex-col gap-5'>
                                {cart?.items.map((item) => (
                                    <div key={item.cartItemId} className='bg-white p-2 rounded-lg border border-slate-100 shadow w-full flex items-center gap-8 group  transition-all duration-500'>
                                        <div className='w-28 h-28 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-slate-50'>
                                            <Image src={item?.image} alt={item.title} width={150} height={150} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' />
                                        </div>
                                        <div className='flex-1 flex flex-col justify-between py-1'>
                                            <div className='flex justify-between items-start gap-4'>
                                                <div>
                                                    <h3 className='font-semibold text-slate-900 text-xl tracking-tight leading-tight'>{item.title}</h3>
                                                    {item.selectedVariants && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {Object.values(item.selectedVariants).map(v => (
                                                                
                                                                <span key={v.id} className='text-[9px] font-semibold text-pink-500 uppercase tracking-wider bg-pink-50 px-2 py-0.5 rounded-full'>
                                                                    {v.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className='font-semibold text-slate-900 text-xl tracking-tighter'>৳{item.salePrice || item.price}</p>
                                            </div>
                                            <div className='flex items-center justify-between mt-6'>
                                                <div className='flex items-center gap-6 bg-slate-50 rounded-2xl px-6 py-2.5 border border-transparent hover:border-slate-100 transition-all'>
                                                    <button className='text-slate-400 hover:text-pink-600 font-semibold text-xl' onClick={() => decreaseQuantity(item.cartItemId)}>-</button>
                                                    <span className='font-semibold text-slate-900 w-6 text-center'>{item.quantity}</span>
                                                    <button className='text-slate-400 hover:text-pink-600 font-semibold text-xl' onClick={() => addToCart(item)}>+</button>
                                                </div>
                                                <button className='p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer' onClick={() => removeFromCart(item.cartItemId)}><MdDeleteOutline size={24} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className='lg:col-span-5 sticky top-32 space-y-4'>
                        
                        <section className='bg-white p-4 rounded-[3rem] border border-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.06)] space-y-10'>
                            <div className='space-y-2'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm'><MdLocalShipping size={20}/></div>
                                    <h2 className='text-xl font-semibold text-slate-800 tracking-tight'>Fulfillment</h2>
                                </div>
                                <div className='grid grid-cols-2 gap-5'>
                                    {deliveryOptions.map((opt) => (
                                        <button 
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setFormData(p => ({...p, delivery_method: opt.id}))}
                                            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 cursor-pointer ${
                                                formData.delivery_method === opt.id 
                                                ? 'border-pink-500 bg-slate-50 shadow-inner' 
                                                : 'border-slate-50 hover:border-slate-100'
                                            }`}
                                        >
                                            <span className="text-3xl">{opt.icon}</span>
                                            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${formData.delivery_method === opt.id ? 'text-black' : 'text-slate-300'}`}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className='space-y-6 border-t border-slate-50 pt-10'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center shadow-sm'><MdPayment size={20}/></div>
                                    <h2 className='text-xl font-semibold text-slate-800 tracking-tight'>Payment Mode</h2>
                                </div>
                                <div className='grid grid-cols-3 gap-3'>
                                    {paymentOptions.map((opt) => (
                                        <button 
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setFormData(p => ({...p, payment_method: opt.id}))}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                                formData.payment_method === opt.id 
                                                ? 'border-pink-500 bg-slate-50' 
                                                : 'border-slate-50 hover:border-slate-100'
                                            }`}
                                        >
                                            <div className={`w-full h-1 rounded-full ${opt.color} mb-1`} />
                                            <span className={`text-[9px] font-semibold uppercase tracking-tighter text-center ${formData.payment_method === opt.id ? 'text-black' : 'text-slate-300'}`}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {formData.payment_method !== 'cash' && (
                                    <div className='flex flex-col gap-2 animate-in fade-in slide-in-from-top-2'>
                                        <label className='text-[10px] font-semibold uppercase text-slate-400 tracking-[0.2em] ml-1'>Transaction Ref</label>
                                        <input 
                                            type="text" 
                                            name='transaction_id' 
                                            required 
                                            onChange={handleChange} 
                                            value={formData.transaction_id} 
                                           
                                            className='w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-pink-500/5 transition-all font-bold text-slate-700' 
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Order Summary */}
                            <div className='space-y-4 border-t border-slate-50 pt-10'>
                                <div className='flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                                    <span>Gross Amount</span>
                                    <span className='font-semibold text-slate-900'>৳{subTotal}</span>
                                </div>
                                <div className='flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500'>
                                    <span>Gourmet Savings</span>
                                    <span>-৳{totalDiscount}</span>
                                </div>
                                <div className='flex justify-between text-4xl font-semibold text-slate-900 pt-6 border-t border-dashed border-slate-100'>
                                    <span>Total</span>
                                    <span className='tracking-tighter'>৳{totalPrice}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleOrder}
                                disabled={loading}
                                className='w-full py-6 bg-pink-500 text-white rounded-xl font-semibold text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.2)] active:scale-[0.98] disabled:opacity-50 mt-6'
                            >
                                {loading ? 'CONFIRMING ORDER...' : 'FINALIZE ORDER'}
                            </button>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default UserOrderForm