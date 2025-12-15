'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, Search, User, LogOut, Check, AlertCircle, CheckCircle, XCircle, Shield, DollarSign, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

export const AdminHeader: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCurrentUser()
    loadNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Close notifications when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser()
      setCurrentUser(user)
    } catch (err) {
      console.error('Failed to load current user:', err)
    }
  }

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const [notifs, count] = await Promise.all([
        api.getNotifications(false),
        api.getUnreadNotificationCount(),
      ])
      setNotifications(Array.isArray(notifs) ? notifs : [])
      setUnreadCount(count || 0)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      // Set empty array on error
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await api.markNotificationAsRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }

    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link)
      setShowNotifications(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'kyc_approved':
      case 'driver_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'kyc_rejected':
      case 'ride_cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'safety_report':
        return <Shield className="w-5 h-5 text-orange-600" />
      case 'payment_received':
        return <DollarSign className="w-5 h-5 text-blue-600" />
      case 'system_alert':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // Determine which page to search based on current path
    const query = searchQuery.trim()
    
    if (pathname?.includes('/admin/users') || pathname?.includes('/admin/passengers') || pathname?.includes('/admin/drivers')) {
      // If on a user-related page, search will be handled by the page's local search
      // Just update URL with query param
      const currentPath = pathname.split('?')[0]
      router.push(`${currentPath}?search=${encodeURIComponent(query)}`)
    } else if (pathname?.includes('/admin/rides')) {
      router.push(`/admin/rides?search=${encodeURIComponent(query)}`)
    } else {
      // Default: go to users page with search
      router.push(`/admin/users?search=${encodeURIComponent(query)}`)
    }
  }

  const handleLogout = async () => {
    try {
      api.setToken(null)
      router.push('/signin')
    } catch (err) {
      console.error('Logout error:', err)
      router.push('/signin')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-lg">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, drivers, rides..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </form>

          {/* Right Side */}
          <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) {
                    loadNotifications()
                  }
                }}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Notifications"
              >
              <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 border border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {loadingNotifications ? (
                      <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <p
                                    className={`text-sm font-medium ${
                                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                    }`}
                                  >
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="ml-2 flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {formatDate(new Date(notification.createdAt))}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <button
                        onClick={() => router.push('/admin')}
                        className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View all notifications
            </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-gray-900" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {currentUser?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {currentUser?.role === 'admin' ? 'Super Admin' : currentUser?.role || 'Admin'}
                  </p>
              </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

