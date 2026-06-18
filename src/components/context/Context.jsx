// context/Context.jsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export const Context = createContext()

export const ContextProvider = ({ children }) => {
  
  const [hydrated, setHydrated] = useState(false)
  const [cart, setCart] = useState({ items: [] })
  const [siteData, setSiteData] = useState(null)
  const [userData, setUserData] = useState(null)
  const [categories, setCategories] = useState([])

  const [manageSidebar, setManageSidebar] = useState(false)
  const [cartBar, setCartBar]= useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [updateUserBox,setUpdateUserBox]= useState(false)

  const [siteLoading, setSiteLoading] = useState(true)
  const [tenantError, setTenantError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user', { withCredentials: true })
        setUserData(response.data.payload)
      } catch (error) {
        setUserData(null)
      }
    }
    fetchUserData()
  }, [])


  useEffect(() => {
    const fetchWebsiteData = async () => {
      setSiteLoading(true)
      try {
        const response = await axios.get('/api/website', { withCredentials: true })
        const data = response.data.payload;
        setSiteData(data)

        if (data && data.theme_color && typeof window !== 'undefined') {
           document.documentElement.style.setProperty('--theme-base', data.theme_color);
        }
      } catch (error) {
        if (error.response && error.response.data && !error.response.data.success) {
          if ([402, 403, 404].includes(error.response.status)) {
            setTenantError({
              status: error.response.status,
              message: error.response.data.message
            });
          }
        }
        setSiteData(null)
      } finally {
        setSiteLoading(false)
      }
    }
    fetchWebsiteData()
  }, [])

  
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/category', { withCredentials: true })
      setCategories(res.data.payload)
    } catch (error) {
      setCategories([])
    }
  }

  const fetchCart = () => {
    if (typeof window === 'undefined') return
    const storedCart = localStorage.getItem('cart')

    if (!storedCart || storedCart === 'undefined') {
      setCart({ items: [] })
      setHydrated(true)
      return
    }

    try {
      const parsed = JSON.parse(storedCart)
      if (parsed && Array.isArray(parsed.items)) {
        setCart(parsed)
      } else {
        setCart({ items: [] })
      }
    } catch (err) {
      localStorage.removeItem('cart')
      setCart({ items: [] })
    }
    setHydrated(true)
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && hydrated) {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  }, [cart, hydrated])

  const addToCart = (product, qty = 1) => {
    if (!product?.id) return;

    const variantKeys = product.selectedVariants 
      ? Object.values(product.selectedVariants).map(v => v.id).sort().join('-')
      : '';
    
    const cartItemId = variantKeys ? `${product.id}-${variantKeys}` : `${product.id}`;

    const existingInCart = cart.items.find(item => item.cartItemId === cartItemId);

    if (existingInCart) {
      setCart((prev) => ({
        ...prev,
        items: prev.items.map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + qty;
            return { 
              ...item, 
              quantity: newQty,
              salePrice: (item.price - item.discount) * newQty 
            };
          }
          return item;
        })
      }));
      toast(`Updated quantity: ${existingInCart.quantity + qty}`);
    } else {
      const price = parseFloat(product?.price) || 0;
      const discount = parseFloat(product?.discount) || 0;

      setCart((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            cartItemId: cartItemId,
            id: product.id,
            title: product.title,
            quantity: qty,
            price: price,
            discount: discount,
            image: product.image,
            salePrice: (price - discount) * qty,
            selectedVariants: product.selectedVariants || null,
            variants: product.variants || null
          }
        ]
      }));
      toast.success("Added to cart");
    }
  };

  const updateCartItemVariant = (oldCartItemId, newSelectedVariants, newPrice) => {
    setCart((prev) => {
      const existingItem = prev.items.find(item => item.cartItemId === oldCartItemId);
      if (!existingItem) return prev;

      const variantKeys = newSelectedVariants 
        ? Object.values(newSelectedVariants).map(v => v.id).sort().join('-')
        : '';
      
      const newCartItemId = variantKeys ? `${existingItem.id}-${variantKeys}` : `${existingItem.id}`;

      const targetItem = prev.items.find(item => item.cartItemId === newCartItemId);

      let newItems = [];
      if (targetItem && targetItem.cartItemId !== oldCartItemId) {
        newItems = prev.items.map(item => {
          if (item.cartItemId === newCartItemId) {
            const newQty = item.quantity + existingItem.quantity;
            return {
              ...item,
              quantity: newQty,
              salePrice: (item.price - item.discount) * newQty
            };
          }
          return item;
        }).filter(item => item.cartItemId !== oldCartItemId);
      } else {
        newItems = prev.items.map(item => {
          if (item.cartItemId === oldCartItemId) {
            return {
              ...item,
              cartItemId: newCartItemId,
              selectedVariants: newSelectedVariants,
              price: newPrice,
              salePrice: (newPrice - item.discount) * item.quantity
            };
          }
          return item;
        });
      }

      return { ...prev, items: newItems };
    });
    toast.success("Variant updated");
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => ({ 
      ...prev, 
      items: prev.items.filter(item => item.cartItemId !== cartItemId) 
    }))
    toast.error("Removed from cart");
  }

  const decreaseQuantity = (cartItemId) => {
    setCart((prev) => {
      const existing = prev.items.find(item => item.cartItemId === cartItemId);
      if (!existing) return prev;

      if (existing.quantity > 1) {
        return {
          ...prev,
          items: prev.items.map(item => {
            if (item.cartItemId === cartItemId) {
              const newQty = item.quantity - 1;
              return { 
                ...item, 
                quantity: newQty,
                salePrice: (item.price - item.discount) * newQty 
              };
            }
            return item;
          })
        };
      }
      return { ...prev, items: prev.items.filter(item => item.cartItemId !== cartItemId) };
    });
  };

  const clearCart = () => {
    setCart({ items: [] });
    if (typeof window !== 'undefined') localStorage.removeItem('cart');
    toast.success("Cart cleared");
  };

  useEffect(() => {
    fetchCategories()
    fetchCart()
  }, [])

  const [subTotal, setSubTotal] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDiscount, setTotalDiscount] = useState(0)
      
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

  const contextValue = {
    manageSidebar, setManageSidebar, cartBar, setCartBar, mobileSidebar, setMobileSidebar, updateUserBox, setUpdateUserBox,
    cart, siteData, userData, subTotal, totalPrice, totalDiscount,
    categories,
    fetchCategories, addToCart, removeFromCart, decreaseQuantity, clearCart, fetchCart, updateCartItemVariant
  }

 
  return (
    <Context.Provider value={contextValue}>
      {tenantError ? (
        <div className="fixed inset-0 z-[99999] bg-gray-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
            <p className="text-gray-600 mb-6 text-lg font-medium">{tenantError.message}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
               <p className="text-sm text-gray-500 font-medium">Error Code: {tenantError.status}</p>
            </div>
            <p className="text-sm text-gray-500">
              Please contact support or the website administrator to resolve this issue and restore access to the website.
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </Context.Provider>
  )
}


