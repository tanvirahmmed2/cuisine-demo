'use client'
import BanUser from '@/components/buttons/BanUser'
import DeleteUser from '@/components/buttons/DeleteUser'
import UpdateUser from '@/components/buttons/UpdateUser'
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const People = () => {
  const [staffs, setStaffs] = useState([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('manager')
  const [loading, setLoading] = useState(false)

  const fetchStaffs = async () => {
    try {
      const res = await axios.get('/api/user/all?role=management', { withCredentials: true })
      setStaffs(res.data.payload)
    } catch (error) {
      setStaffs([])
    }
  }

  useEffect(() => {
    fetchStaffs()
  }, [])

  const handlePromote = async (e) => {
    e.preventDefault()
    if (!email) return toast.error("Please enter an email")
    setLoading(true)
    try {
      const res = await axios.put('/api/user/management', { email, role }, { withCredentials: true })
      toast.success(res.data.message)
      setEmail('')
      fetchStaffs()
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to promote user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-5xl mx-auto flex flex-col gap-8'>
      <div className='w-full'>
        <h1 className='text-2xl font-semibold text-gray-900 tracking-tight'>People & Access</h1>
        <p className='text-gray-500 text-sm'>Manage staff accounts and promote users.</p>
      </div>

      <div className='w-full bg-white p-6 rounded-xl border border-gray-100 flex flex-col gap-4'>
        <h2 className='text-lg font-semibold text-gray-800'>Promote User</h2>
        <form onSubmit={handlePromote} className='flex flex-col md:flex-row gap-3'>
          <input 
            type="email" 
            
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-pink-500 transition-all text-sm'
          />
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className='px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-pink-500 transition-all text-sm'
          >
            <option value="manager">Manager</option>
            <option value="sales">Sales</option>
            <option value="admin">Admin</option>
            <option value="user">User (Demote)</option>
          </select>
          <button 
            type="submit" 
            disabled={loading}
            className='px-6 py-2.5 bg-pink-500 text-white rounded-xl font-semibold text-sm hover:bg-pink-600 transition-colors disabled:opacity-50'
          >
            {loading ? 'Processing...' : 'Promote'}
          </button>
        </form>
      </div>

      <div className='w-full flex flex-col gap-4'>
        <h2 className='text-lg font-semibold text-gray-800'>Management Team</h2>
        <div className='w-full flex flex-col border border-gray-100 rounded-xl overflow-hidden'>
          <div className='w-full grid grid-cols-4 bg-gray-50/50 p-4 font-semibold text-[10px] uppercase text-gray-400 tracking-widest border-b border-gray-100'>
            <p>Member</p>
            <p>Email</p>
            <p>Access Level</p>
            <p className='text-right'>Management</p>
          </div>
          {
            staffs && staffs.map((staff) => (
              <div key={staff.id} className='w-full grid grid-cols-4 p-4 items-center bg-white hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0'>
                <p className='font-semibold text-gray-800 text-sm'>{staff.name}</p>
                <p className='text-gray-500 text-xs'>{staff.email}</p>
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                    staff.role === 'admin' ? 'bg-pink-50 text-pink-600' :
                    staff.role === 'manager' ? 'bg-amber-50 text-amber-600' :
                    staff.role === 'sales' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {staff.role}
                  </span>
                </div>
                <div className='flex flex-row items-center justify-end gap-2'>
                  <BanUser id={staff.id} isBanned={staff.is_banned}/>
                  <DeleteUser id={staff.id}/>                  
                </div>
              </div>
            ))
          }
          {staffs.length === 0 && (
            <div className='p-12 text-center text-gray-400 text-sm font-medium'>No team members found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default People
