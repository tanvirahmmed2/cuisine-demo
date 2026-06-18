'use client'
import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MdSave } from 'react-icons/md'
import { Context } from '@/components/context/Context'

const AdminSettings = () => {
    const { siteData, setSiteData, siteLoading } = useContext(Context);
    const [saving, setSaving] = useState(false);
    const [website, setWebsite] = useState(siteData || {
        name: '',
        tagline: '',
        email: '',
        phone: '',
        address: '',
        hero_title: '',
        hero_subtitle: '',
        sociallink: '',
        theme_color: '#000000',
        tenant_status: 'active',
        subscription_status: null,
        current_period_end: null,
        package_name: null,
    })

    // Initialize local state when siteData loads
    useEffect(() => {
        if (!siteLoading && siteData) {
            setWebsite(siteData)
        }
    }, [siteLoading, siteData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setWebsite(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await axios.post('/api/website', website, { withCredentials: true })
            if (res.data.success) {
                toast.success('Settings updated successfully')
                setSiteData(res.data.payload)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update settings')
        } finally {
            setSaving(false)
        }
    }

    if (siteLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your website and subscription details.</p>
                </div>
                {website.package_name && (
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold uppercase tracking-wider">
                        {website.package_name} Plan
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Subscription & Validity */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-800">Subscription Status</h2>
                        <div className={`px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${website.subscription_status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {website.subscription_status || 'Inactive'}
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Account State</label>
                            <p className="text-lg font-semibold text-gray-900 capitalize">{website.tenant_status}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Renewal / Expiry</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {website.package_name === 'Lifetime' || website.package_name?.toLowerCase().includes('lifetime')
                                    ? 'Never Expires'
                                    : website.current_period_end
                                        ? new Date(website.current_period_end).toLocaleDateString()
                                        : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Brand & Business */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800">Business Details</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
                            <input name="name" value={website.name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                            <input name="tagline" value={website.tagline || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                            <input type="email" name="email" value={website.email || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                            <input name="phone" value={website.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                    </div>
                </div>

                {/* Location & SEO */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800">Location & Content</h2>
                    </div>
                    <div className="p-6 flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                            <input name="address" value={website.address || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                                <input name="hero_title" value={website.hero_title || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                                <textarea name="hero_subtitle" value={website.hero_subtitle || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social & Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">Social Links</h2>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Social URL</label>
                            <input name="sociallink" value={website.sociallink || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">Appearance</h2>
                        </div>
                        <div className="p-6 flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                                <p className="text-xs text-gray-500">{website.theme_color || '#000000'}</p>
                            </div>
                            <input type="color" name="theme_color" value={website.theme_color || '#000000'} onChange={handleChange} className="w-10 h-10 p-0 border-0 rounded cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-10">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-sm"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <MdSave size={18} />
                        )}
                        <span>Save Settings</span>
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AdminSettings