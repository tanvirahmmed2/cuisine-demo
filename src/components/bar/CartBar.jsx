'use client'
import React, { useContext, useState, useMemo } from 'react'
import { Context } from '../context/Context'
import Link from 'next/link'
import Image from 'next/image'
import { MdDeleteOutline, MdClose, MdEdit } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

const VariantEditor = ({ item, onClose }) => {
    const { updateCartItemVariant } = useContext(Context)
    
    const [selectedVariants, setSelectedVariants] = useState(() => {
        return item.selectedVariants || {}
    })

    const hasDiscount = item.discount !== 0 && item.discount !== null;

    const groupedVariants = useMemo(() => {
        const groups = {}
        if (item.variants) {
            item.variants.forEach(v => {
                if (!groups[v.name]) groups[v.name] = []
                groups[v.name].push(v)
            })
        }
        return groups
    }, [item.variants])

    const currentAdjustment = useMemo(() => {
        let adj = 0;
        if (item.selectedVariants) {
            Object.values(item.selectedVariants).forEach(v => {
                adj += Number(v.price_adjustment || 0);
            });
        }
        return adj;
    }, [item.selectedVariants]);

    const originalBasePrice = Number(item.price) - currentAdjustment;

    const modalVariantAdjustment = useMemo(() => {
        let adj = 0;
        Object.values(selectedVariants).forEach(v => {
            adj += Number(v.price_adjustment || 0);
        });
        return adj;
    }, [selectedVariants]);

    const newCalculatedPrice = originalBasePrice + modalVariantAdjustment;
    const displayCurrentPrice = hasDiscount ? newCalculatedPrice - Number(item.discount) : newCalculatedPrice;

    const handleVariantSelect = (groupName, variant) => {
        setSelectedVariants(prev => ({
            ...prev,
            [groupName]: variant
        }));
    }

    const handleSave = () => {
        updateCartItemVariant(item.cartItemId, selectedVariants, newCalculatedPrice)
        onClose()
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 z-10 bg-white flex flex-col min-h-screen shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl sm:rounded-none"
        >
            <div className="p-2 border-b border-pink-50 flex items-center justify-between bg-linear-to-r from-pink-50/50 to-transparent">
                <div>
                    <h3 className="font-semibold text-gray-900 text-xl tracking-tight">Edit Variant</h3>
                    <p className="text-[10px] uppercase tracking-widest text-pink-500 font-bold mt-1">{item.title}</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all"
                >
                    <MdClose size={22} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50">
                {Object.entries(groupedVariants).map(([groupName, variants]) => (
                    <div key={groupName} className="space-y-2 bg-white p-1 rounded-2xl border border-pink-50/50 shadow-sm">
                        <div className="flex items-center gap-2">
                            <h4 className="text-[10px] font-semibold text-pink-400 uppercase tracking-widest">{groupName}</h4>
                            <div className="h-px flex-1 bg-pink-50" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {variants.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => handleVariantSelect(groupName, v)}
                                    className={`px-3 py-2.5 text-xs font-bold rounded-xl border transition-all text-left flex flex-col gap-1 ${
                                        selectedVariants[groupName]?.id === v.id
                                            ? 'border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-500/20'
                                            : 'border-pink-100 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50/50'
                                    }`}
                                >
                                    <span className="truncate">{v.value}</span>
                                    {v.price_adjustment > 0 && (
                                        <span className={`text-[9px] ${
                                            selectedVariants[groupName]?.id === v.id ? 'text-pink-100' : 'text-pink-500'
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

            <div className="p-6 border-t border-pink-50 bg-white flex flex-col gap-4 shadow-[0_-20px_40px_rgba(236,72,153,0.05)]">
                <div className="flex items-end justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Updated Price</span>
                    <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                            <span className="text-[11px] font-bold text-gray-300 line-through">৳{newCalculatedPrice.toFixed(2)}</span>
                        )}
                        <span className="text-2xl font-semibold text-gray-900 tracking-tighter">৳{displayCurrentPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3.5 bg-pink-50 text-pink-600 rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] hover:bg-pink-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-2 py-3.5 bg-pink-500 text-white rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] shadow-lg shadow-pink-500/25 hover:bg-pink-600 hover:shadow-pink-600/25 transition-all active:scale-[0.98]"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

const CartBar = () => {
    const { subTotal, totalPrice, totalDiscount, cartBar, setCartBar, addToCart, removeFromCart, decreaseQuantity, clearCart, cart } = useContext(Context)
    const [editingItem, setEditingItem] = useState(null)

    return (
        <AnimatePresence>
            {cartBar && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setCartBar(false);
                            setEditingItem(null);
                        }}
                        className="fixed inset-0 bg-pink-950/20 backdrop-blur-sm z-[60]"
                    />

                    {/* Cart Sidebar */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-[70] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 flex items-center justify-between border-b border-pink-50 bg-gradient-to-b from-pink-50/30 to-transparent">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 tracking-tighter">My Cart</h2>
                                <p className="text-[10px] text-pink-500 uppercase font-semibold tracking-[0.2em] mt-1">
                                    {cart?.items?.length || 0} Items Reserved
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    setCartBar(false);
                                    setEditingItem(null);
                                }}
                                className="p-3 bg-white hover:bg-pink-50 rounded-2xl transition-all cursor-pointer border border-pink-100 hover:border-pink-200 text-gray-400 hover:text-pink-500 shadow-sm"
                            >
                                <MdClose size={24} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                            {cart?.items?.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                                    <div className="w-20 h-20 bg-pink-50 rounded-[2rem] flex items-center justify-center text-pink-300">
                                        <MdDeleteOutline size={48} />
                                    </div>
                                    <div className='space-y-2'>
                                        <p className="text-gray-900 font-semibold text-lg">Your cart is empty</p>
                                        <p className="text-gray-400 text-sm font-medium">Add some treats to your basket!</p>
                                    </div>
                                    <Link 
                                        href="/menu" 
                                        onClick={() => setCartBar(false)}
                                        className="px-10 py-4 bg-pink-500 text-white rounded-2xl font-semibold text-sm uppercase tracking-[0.2em] hover:bg-pink-600 transition-all shadow-xl shadow-pink-500/20"
                                    >
                                        Browse Menu
                                    </Link>
                                </div>
                            ) : (
                                cart.items.map((item) => (
                                    <div key={item.cartItemId} className="flex gap-4 p-2 items-center justify-between bg-white rounded-3xl border border-pink-100 shadow-sm group hover:border-pink-300 hover:shadow-md hover:shadow-pink-500/5 transition-all duration-300">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-pink-50 relative">
                                            <Image 
                                                src={item.image} 
                                                alt={item.title} 
                                                width={100} 
                                                height={100} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            />
                                            {item.discount > 0 && (
                                                <div className="absolute top-1 left-1 bg-pink-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                                    Sale
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight tracking-tight">{item.title}</h3>
                                                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                            {Object.values(item.selectedVariants).map(v => (
                                                                <span key={v.id} className='text-[9px] font-bold text-pink-600 uppercase tracking-wider bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100'>
                                                                    {v.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="font-semibold text-gray-900 text-base tracking-tighter">৳{item.salePrice || item.price}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-3 bg-pink-50/50 rounded-xl px-3 py-1.5 border border-pink-100">
                                                    <button 
                                                        onClick={() => decreaseQuantity(item.cartItemId)}
                                                        className="text-pink-400 hover:text-pink-600 font-semibold text-lg cursor-pointer transition-colors"
                                                    >-</button>
                                                    <span className="text-sm font-semibold w-6 text-center text-gray-900">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => addToCart(item)}
                                                        className="text-pink-400 hover:text-pink-600 font-semibold text-lg cursor-pointer transition-colors"
                                                    >+</button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {item.variants && item.variants.length > 0 && (
                                                        <button 
                                                            onClick={() => setEditingItem(item)}
                                                            className="p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-pink-200 shadow-sm"
                                                            title="Edit Variant"
                                                        >
                                                            <MdEdit size={18} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => removeFromCart(item.cartItemId)}
                                                        className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
                                                        title="Remove Item"
                                                    >
                                                        <MdDeleteOutline size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            <AnimatePresence>
                                {editingItem && (
                                    <VariantEditor 
                                        item={editingItem} 
                                        onClose={() => setEditingItem(null)} 
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {cart?.items?.length > 0 && (
                            <div className="p-4 bg-white border-t border-pink-100 space-y-4 shadow-[0_-20px_60px_rgba(236,72,153,0.08)] relative z-20">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-gray-400">
                                        <span>Subtotal</span>
                                        <span>৳{subTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-emerald-500">
                                        <span>Discount</span>
                                        <span>-৳{totalDiscount}</span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-semibold text-gray-900 pt-4 border-t border-pink-50">
                                        <span>Total</span>
                                        <span className='tracking-tighter text-pink-500'>৳{totalPrice}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link 
                                        href="/checkout" 
                                        onClick={() => setCartBar(false)}
                                        className="w-full py-4 bg-pink-500 text-white text-center rounded-2xl font-semibold text-xs uppercase tracking-[0.2em] shadow-xl shadow-pink-500/25 hover:bg-pink-600 transition-all active:scale-[0.98]"
                                    >
                                        Checkout Now
                                    </Link>
                                    <button 
                                        onClick={() => clearCart()}
                                        className="text-[10px] font-semibold text-gray-300 hover:text-rose-500 uppercase tracking-[0.2em] transition-colors cursor-pointer text-center"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default CartBar
