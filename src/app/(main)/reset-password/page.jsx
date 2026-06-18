'use client';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useContext, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Context } from '@/components/context/Context';
import Link from 'next/link';

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { siteData } = useContext(Context);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setStatus('loading');
    try {
      const response = await axios.post('/api/user/reset-password', { token, password });
      setStatus('success');
      setMessage(response.data.message);
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to reset password.');
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
          
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Password Reset!</h2>
              <p className="text-gray-500">{message}</p>
              <p className="text-sm text-gray-400 mt-4">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">Set New Password</h2>
              <p className="text-gray-500 mb-8">Enter your new password below.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {status === 'error' && (
                  <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100">
                    {message}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                   
                    required
                    disabled={!token}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                   
                    required
                    disabled={!token}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'loading' || !token}
                  className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-70 flex justify-center items-center mt-2"
                >
                  {status === 'loading' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Reset Password'}
                </button>
                
                <div className="text-center pt-4 border-t border-gray-100">
                  <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
export default ResetPasswordPage;
