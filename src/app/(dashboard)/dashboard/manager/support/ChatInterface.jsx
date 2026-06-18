'use client'
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import TiptapEditor from '@/components/forms/TiptapEditor'
import { motion } from 'framer-motion'

const ChatInterface = ({ initialTickets }) => {
  const [tickets, setTickets] = useState(initialTickets)
  const [activeTicket, setActiveTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

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
        // Update ticket's status if needed, or update the list locally
        setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, updated_at: new Date().toISOString() } : t))
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='w-full h-[calc(100vh-120px)] flex bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
      {/* Sidebar: Ticket List */}
      <div className='w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50'>
        <div className='p-4 border-b border-slate-100 bg-white'>
          <h2 className='text-lg font-bold text-slate-800'>Active Tickets</h2>
        </div>
        <div className='flex-1 overflow-y-auto'>
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => setActiveTicket(ticket)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${activeTicket?.id === ticket.id ? 'bg-pink-50 border-l-4 border-l-pink-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
            >
              <div className='flex justify-between items-start mb-1'>
                <h3 className='font-semibold text-slate-800 truncate'>{ticket.subject}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  {ticket.status}
                </span>
              </div>
              <p className='text-xs text-slate-500 truncate'>{ticket.user_name || 'Guest'} • {ticket.user_email || 'No email'}</p>
              <p className='text-[10px] text-slate-400 mt-2'>{new Date(ticket.updated_at).toLocaleString()}</p>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className='p-8 text-center text-slate-400 text-sm'>
              No active tickets found.
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className='flex-1 flex flex-col bg-white relative'>
        {activeTicket ? (
          <>
            <div className='p-4 border-b border-slate-100 bg-white shadow-sm z-10 flex justify-between items-center'>
              <div>
                <h2 className='text-lg font-bold text-slate-800'>{activeTicket.subject}</h2>
                <p className='text-xs text-slate-500'>Ticket #{activeTicket.id} • {activeTicket.user_name}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${activeTicket.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                {activeTicket.status}
              </span>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50'>
              {loadingMessages ? (
                <div className='flex justify-center items-center h-full'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500'></div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isManager = msg.sender_type === 'manager';
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id || idx} 
                      className={`flex flex-col ${isManager ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isManager ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none'}`}>
                        <div 
                          className={`prose prose-sm max-w-none ${isManager ? 'prose-invert' : 'prose-slate'}`}
                          dangerouslySetInnerHTML={{ __html: msg.message }}
                        />
                      </div>
                      <span className='text-[10px] text-slate-400 mt-1 px-1 font-medium'>
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {isManager ? 'You' : 'Customer'}
                      </span>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className='p-4 bg-white border-t border-slate-100 flex flex-col gap-3'>
              <TiptapEditor
                  content={newMessage}
                  onChange={setNewMessage}
                 
              />
              <div className='flex justify-end'>
                <button 
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage || newMessage === '<p></p>'}
                  className='bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-pink-500/20 disabled:opacity-50 flex items-center gap-2'
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center text-slate-400'>
            <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <p className='font-medium text-lg'>Select a ticket</p>
            <p className='text-sm mt-1'>Choose a ticket from the left sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface
