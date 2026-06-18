// components/forms/Orderform.jsx
'use client'
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../context/Context'
import toast from 'react-hot-toast'
import axios from 'axios'
import Image from 'next/image'
import { MdDeleteOutline, MdChevronRight } from 'react-icons/md'

const paymentOptions = ['bkash', 'card', 'nagad', 'rocket', 'cash']
const deliveryOptions = ['takeaway', 'takein']

const Orderform = () => {
    const { addToCart, removeFromCart, decreaseQuantity, clearCart, cart } = useContext(Context)

    const [subTotal, setSubTotal] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0)
    const [totalDiscount, setTotalDiscount] = useState(0)
    
    const [formData, setFormData] = useState({
        phone: '',
        payment_method: 'cash',
        delivery_method: 'takein',
        payment_status: 'paid',
        transaction_id: '',
        status: 'confirmed',
        table_no: ''
    })

    const [popUp, setPopUp] = useState(false)

    useEffect(() => {
        let tempSubTotal = 0
        let tempTotalPrice = 0

        cart?.items.forEach((item) => {
            tempSubTotal += item.price * item.quantity
            tempTotalPrice += item.salePrice
        })

        setSubTotal(tempSubTotal)
        setTotalPrice(tempTotalPrice)
        setTotalDiscount(tempSubTotal - tempTotalPrice)
    }, [cart])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalOrderData = {
            ...formData,
            phone: formData.phone.trim() || '01900000000',
            sub_total: subTotal,
            total_discount: totalDiscount,
            total_price: totalPrice,
            items: cart?.items || []
        };

        if (finalOrderData.items.length === 0) {
            return toast.error("Cart is empty");
        }

        try {
            const res = await axios.post('/api/order', finalOrderData, { withCredentials: true });
            toast.success(res.data.message);
            setPopUp(false);
            clearCart();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Failed to place order');
        }
    };

    return (
        <form onSubmit={handleSubmit} className='w-full flex flex-col gap-6 bg-white rounded-xl border border-gray-100'>
            <div className='w-full flex flex-col gap-1.5'>
                <label htmlFor="phone" className='text-[10px] font-semibold uppercase tracking-widest text-gray-400 ml-1'>Customer Phone</label>
                <input 
                    type="text" name='phone' id='phone' 
                    onChange={handleChange} value={formData.phone} 
                    className='w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-pink-500 transition-all font-semibold text-sm' 
                    
                />
            </div>
            
            <div className='w-full flex flex-col gap-3'>
                <div className='flex items-center justify-between px-2 pb-2 border-b border-gray-50'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-gray-300'>Order Items</p>
                    <button type='button' className='text-[10px] font-semibold text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-colors' onClick={() => clearCart()}>Clear Cart</button>
                </div>

                {cart?.items.length > 0 ? (
                    <div className='w-full flex flex-col gap-4'>
                        <div className='max-h-[350px] overflow-y-auto w-full pr-1 space-y-2'>
                            {cart.items.map((item) => (
                                <div key={item.cartItemId} className='w-full flex items-center gap-3 py-2 border-b border-gray-50 last:border-0'>
                                    <div className='w-10 h-10 overflow-hidden rounded-lg bg-gray-50 border border-gray-100'>
                                        <Image src={item.image} alt={item.title} width={40} height={40} className='w-full h-full object-cover' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-xs font-semibold text-gray-800 truncate'>{item.title}</p>
                                        <div className='flex items-center gap-1.5 mt-0.5'>
                                            <p className='text-[10px] font-semibold text-gray-900'>৳{item.salePrice.toLocaleString()}</p>
                                            {item.selectedVariants && Object.values(item.selectedVariants).length > 0 && (
                                                <span className='text-[8px] text-gray-400 uppercase font-medium tracking-tighter'>
                                                    • {Object.values(item.selectedVariants).map(v => v.value).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex items-center bg-gray-50 rounded-lg p-1'>
                                        <button className='w-5 h-5 flex items-center justify-center font-semibold text-gray-400 hover:text-pink-600 transition-colors' type='button' onClick={() => decreaseQuantity(item.cartItemId)}>-</button>
                                        <span className='text-[10px] font-semibold w-5 text-center'>{item.quantity}</span>
                                        <button className='w-5 h-5 flex items-center justify-center font-semibold text-gray-400 hover:text-pink-600 transition-colors' type='button' onClick={() => addToCart(item)}>+</button>
                                    </div>
                                    <button className='p-1.5 text-gray-200 hover:text-rose-500 transition-all' type='button' onClick={() => removeFromCart(item.cartItemId)}>
                                        <MdDeleteOutline size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className='bg-pink-500 text-white p-5 rounded-xl w-full flex flex-col gap-3'>
                            <div className='space-y-1.5'>
                                <div className='flex justify-between text-[10px] font-semibold uppercase tracking-widest opacity-50'>
                                    <p>Subtotal</p>
                                    <p>৳{subTotal.toLocaleString()}</p>
                                </div>
                                <div className='flex justify-between text-[10px] font-semibold uppercase tracking-widest text-emerald-400'>
                                    <p>Discounts</p>
                                    <p>-৳{totalDiscount.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className='flex justify-between items-center border-t border-white/10 pt-3'>
                                <div>
                                    <p className='text-[10px] font-semibold uppercase tracking-widest opacity-50'>Total Payable</p>
                                    <p className='text-2xl font-semibold tracking-tight'>৳{totalPrice.toLocaleString()}</p>
                                </div>
                                <button 
                                    className='px-5 py-2.5 bg-white text-black rounded-lg font-semibold text-[11px] uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center gap-1.5' 
                                    type='button' 
                                    onClick={() => setPopUp(true)}
                                >
                                    Review <MdChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='py-20 flex flex-col items-center gap-3 text-gray-200'>
                         <MdDeleteOutline size={48} className='opacity-20' />
                         <p className='font-semibold uppercase tracking-widest text-[9px]'>Cart is empty</p>
                    </div>
                )}
            </div>

            {popUp && (
                <div className='flex items-center justify-center fixed inset-0 backdrop-blur-sm bg-pink-500/40 z-[60]'>
                    <div className='w-full max-w-sm mx-4 flex flex-col p-6 gap-6 bg-white rounded-xl border border-gray-100'>
                        <div className='flex justify-between items-center border-b border-gray-50 pb-4'>
                            <div>
                                <h2 className='text-lg font-semibold text-gray-800 tracking-tight'>Checkout</h2>
                                <p className='text-[10px] font-semibold uppercase tracking-widest text-gray-400'>Order Settlement</p>
                            </div>
                            <p className='text-xl font-semibold text-black tracking-tight'>৳{totalPrice.toLocaleString()}</p>
                        </div>

                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-1.5'>
                                <label htmlFor="payment_method" className='text-[10px] font-semibold uppercase tracking-widest text-gray-400 ml-1'>Payment</label>
                                <select name="payment_method" id="payment_method" onChange={handleChange} required value={formData.payment_method} className='w-full p-3 bg-gray-50 border border-gray-50 rounded-xl outline-none font-semibold text-sm appearance-none cursor-pointer'>
                                    {paymentOptions.map((p) => (
                                        <option value={p} key={p}>{p.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label htmlFor="delivery_method" className='text-[10px] font-semibold uppercase tracking-widest text-gray-400 ml-1'>Type</label>
                                <select name="delivery_method" id="delivery_method" onChange={handleChange} required value={formData.delivery_method} className='w-full p-3 bg-gray-50 border border-gray-50 rounded-xl outline-none font-semibold text-sm appearance-none cursor-pointer'>
                                    {deliveryOptions.map((d) => (
                                        <option value={d} key={d}>{d.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label htmlFor="table_no" className='text-[10px] font-semibold uppercase tracking-widest text-gray-400 ml-1'>Table (Optional)</label>
                                <input name="table_no" id="table_no" onChange={handleChange} value={formData.table_no} className='w-full p-3 bg-gray-50 border border-gray-50 rounded-xl outline-none font-semibold text-sm'/>
                            </div>
                        </div>

                        <div className='flex flex-row gap-3 mt-2'>
                            <button className='flex-1 py-3 border border-gray-100 rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-400' type='button' onClick={() => setPopUp(false)}>Cancel</button>
                            <button className='flex-1 py-3 bg-pink-500 text-white rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-all' type='submit'>Pay Now</button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}

export default Orderform
