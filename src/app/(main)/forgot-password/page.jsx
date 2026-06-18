'use client';
import { motion } from 'framer-motion';
import { useState, useContext } from 'react';
import axios from 'axios';
import { Context } from '@/components/context/Context';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const { siteData } = useContext(Context);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await axios.post('/api/user/forgot-password', { email });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to process request.');
    }
  };

  return (
    <div className='w-full min-h-screen bg-gray-50 flex items-center justify-center p-6'>
      <div className="absolute top-0 left-0 w-1/3 h-full bg-white -z-10" />
      <div className='w-full max-w-md bg-white p-8 shadow-xl rounded-2xl border border-gray-100'>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className='inline-block w-fit px-4 py-1 bg-pink-50 text-pink-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-6'>
            {siteData?.name || 'Account Recovery'}
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-gray-500 mb-8">Enter your email address to receive a password reset link.</p>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">✉️</div>
              <p className="font-medium">{message}</p>
              <Link href="/login" className="block mt-6 text-sm font-semibold text-gray-900 hover:text-pink-500 transition-colors">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === 'error' && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100">
                  {message}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                 
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {status === 'loading' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send Reset Link'}
              </button>
              <div className="text-center pt-4 border-t border-gray-100">
                <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
