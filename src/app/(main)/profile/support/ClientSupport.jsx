'use client'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import TiptapEditor from '@/components/forms/TiptapEditor'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdClose } from 'react-icons/md'

const ClientSupport = ({ initialTickets }) => {
  const [tickets, setTickets] = useState(initialTickets)
  const [activeTicket, setActiveTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // New Ticket State
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newInitialMsg, setNewInitialMsg] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (activeTicket) {
      fetchMessages(activeTicket.id)
    }
  }, [activeTicket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async (ticketId) => {
    setLoadingMessages(true)
    try {
      const res = await axios.get(`/api/support/message?ticket_id=${ticketId}`)
      if (res.data.success) {
        setMessages(res.data.payload)
      }
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage || newMessage === '<p></p>') return
    setSending(true)
    try {
      const res = await axios.post('/api/support/message', {
        ticket_id: activeTicket.id,
        message: newMessage
      })
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.payload])
        setNewMessage('')
        setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, updated_at: new Date().toISOString() } : t))
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newSubject || !newInitialMsg || newInitialMsg === '<p></p>') return
    setCreating(true)
    try {
      const res = await axios.post('/api/support/ticket', {
        subject: newSubject,
        initial_message: newInitialMsg
      })
      if (res.data.success) {
        setTickets([res.data.payload, ...tickets])
        setShowNewTicket(false)
        setActiveTicket(res.data.payload)
        setNewSubject('')
        setNewInitialMsg('')
        toast.success("Support ticket created")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className='w-full max-w-6xl mx-auto h-[70vh] flex bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative'>
      
      {/* Sidebar: Ticket List */}
      <div className='w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50'>
        <div className='p-6 border-b border-slate-100 bg-white flex justify-between items-center'>
          <h2 className='text-lg font-bold text-slate-800 tracking-tight'>Your Tickets</h2>
          <button 
            onClick={() => setShowNewTicket(true)}
            className='p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-500 hover:text-white transition-colors'
          >
            <MdAdd size={20} />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto p-4 space-y-2'>
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => setActiveTicket(ticket)}
              className={`p-4 rounded-2xl cursor-pointer transition-all ${activeTicket?.id === ticket.id ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white border border-slate-100 hover:border-pink-500'}`}
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className={`font-semibold truncate ${activeTicket?.id === ticket.id ? 'text-white' : 'text-slate-800'}`}>{ticket.subject}</h3>
              </div>
              <div className='flex justify-between items-center'>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${activeTicket?.id === ticket.id ? 'bg-white/20 text-white' : ticket.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {ticket.status}
                </span>
                <p className={`text-[10px] ${activeTicket?.id === ticket.id ? 'text-white/80' : 'text-slate-400'}`}>
                  {new Date(ticket.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className='p-8 text-center text-slate-400 text-sm'>
              You have no active support tickets. Click the + button to create one.
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className='flex-1 flex flex-col bg-white relative'>
        {activeTicket ? (
          <>
            <div className='p-6 border-b border-slate-100 bg-white shadow-sm z-10'>
              <h2 className='text-xl font-bold text-slate-800 tracking-tight'>{activeTicket.subject}</h2>
              <p className='text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1'>Ticket #{activeTicket.id}</p>
            </div>

            <div className='flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50'>
              {loadingMessages ? (
                <div className='flex justify-center items-center h-full'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500'></div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.sender_type === 'user';
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id || idx} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-3xl p-5 shadow-sm ${isUser ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>
                        <div 
                          className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-slate'}`}
                          dangerouslySetInnerHTML={{ __html: msg.message }}
                        />
                      </div>
                      <span className='text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2 px-2'>
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {isUser ? 'You' : 'Support'}
                      </span>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className='p-6 bg-white border-t border-slate-100 flex flex-col gap-4'>
              <TiptapEditor
                  content={newMessage}
                  onChange={setNewMessage}
                 
              />
              <div className='flex justify-end'>
                <button 
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage || newMessage === '<p></p>'}
                  className='bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-pink-500/20 disabled:opacity-50'
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-400'>
            <div className='w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner'>
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <p className='font-black text-2xl text-slate-800 tracking-tight'>Support Chat</p>
            <p className='text-sm mt-2 text-slate-500'>Select a ticket from the sidebar or create a new one.</p>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewTicket && (
          <div className='absolute inset-0 z-50 flex items-center justify-center p-6'>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewTicket(false)}
              className='absolute inset-0 bg-white/60 backdrop-blur-sm'
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className='bg-white w-full max-w-lg p-8 rounded-[32px] shadow-2xl border border-slate-100 relative'
            >
              <button 
                onClick={() => setShowNewTicket(false)}
                className='absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors'
              >
                <MdClose size={24} />
              </button>
              
              <div className='mb-6'>
                <h3 className='text-2xl font-black text-slate-800 tracking-tight'>Create Ticket</h3>
                <p className='text-slate-500 text-sm mt-1'>How can we help you today?</p>
              </div>

              <form onSubmit={handleCreateTicket} className='flex flex-col gap-6'>
                <div className='flex flex-col gap-2'>
                  <label className='text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1'>Subject</label>
                  <input 
                    type="text" 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    required
                    className='w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-pink-500 transition-all text-sm' 
                    
                  />
                </div>
                
                <div className='flex flex-col gap-2'>
                  <label className='text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1'>Message</label>
                  <div className='border border-slate-100 rounded-2xl overflow-hidden'>
                    <TiptapEditor
                      content={newInitialMsg}
                      onChange={setNewInitialMsg}
                     
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={creating || !newSubject || !newInitialMsg || newInitialMsg === '<p></p>'}
                  className='w-full py-4 bg-pink-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 mt-2'
                >
                  {creating ? 'Creating...' : 'Submit Ticket'}
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default ClientSupport
