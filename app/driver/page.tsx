'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MessageModal } from '@/components/ui/MessageModal'
import {
  Car,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Navigation,
  CheckCircle,
  AlertCircle,
  User,
  Edit,
  Plus,
  Trash2,
  Upload,
  FileText,
  CheckCircle2,
  Calendar,
  X,
  Download,
  LogOut,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Bell,
} from 'lucide-react'
import { formatCurrency, formatDate, formatTime, calculateDistance, getCurrentLocation } from '@/lib/utils'
import { api, type Ride } from '@/lib/api'
import { LiveTrackingMap } from '@/components/ui/LiveTrackingMap'
import { RouteMap } from '@/components/ui/RouteMap'
import { WaitingScreen } from '@/components/ui/WaitingScreen'
import { useRouter } from 'next/navigation'
import Confetti from 'react-confetti'

export default function DriverPage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)
  const[rideData, setRideData] = useState<Ride | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'rides' | 'profile'>('dashboard')
  const [myRidesSubTab, setMyRidesSubTab] = useState<'completed' | 'scheduled' | 'cancelled'>('scheduled')
  const [pendingRides, setPendingRides] = useState<Ride[]>([])
  const [driverRides, setDriverRides] = useState<Ride[]>([])
  const [activeRide, setActiveRide] = useState<Ride | null>(null)
  const [weeklyEarnings, setWeeklyEarnings] = useState(0)
  const [isLoadingPendingRides, setIsLoadingPendingRides] = useState(false)
  const [stats, setStats] = useState({
    totalRides: 0,
    totalEarnings: 0,
    rating: 0,
    cancelledRides: 0,
  })
  const [earningsData, setEarningsData] = useState<Array<{ date: string; earnings: number }>>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [passengerLocation, setPassengerLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [kycData, setKycData] = useState<any>(null)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [showCongrats, setShowCongrats] = useState(false)
  const [hasShownCongrats, setHasShownCongrats] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [vehicles, setVehicles] = useState<any[]>([])
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [rideToCancel, setRideToCancel] = useState<string | null>(null)
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)
  const [rideToCounter, setRideToCounter] = useState<any>(null)
  const [counterOfferAmount, setCounterOfferAmount] = useState(0)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageRideId, setMessageRideId] = useState<string | null>(null)
  const [messageOtherUserId, setMessageOtherUserId] = useState<string | null>(null)
  const [messageOtherUserName, setMessageOtherUserName] = useState<string | null>(null)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const messageSocketRef = useRef<any>(null)
  const pendingRidesPollingRef = useRef<NodeJS.Timeout | null>(null)
  const [vehicleFormData, setVehicleFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    plateNumber: '',
    type: 'sedan',
    capacity: '',
    insuranceExpiry: '',
  })
  const [vehicleFiles, setVehicleFiles] = useState({
    registrationImage: null as File | null,
    insuranceImage: null as File | null,
  })
  const [viewingDocument, setViewingDocument] = useState<{
    url: string
    title: string
    type: 'image' | 'pdf'
  } | null>(null)

  const loadNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        api.getNotifications(false),
        api.getUnreadNotificationCount(),
      ])
      setNotifications(Array.isArray(notifs) ? notifs : [])
      setUnreadNotificationCount(count || 0)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setNotifications([])
      setUnreadNotificationCount(0)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await api.markNotificationAsRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        )
        setUnreadNotificationCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }

    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link)
    }
    setShowNotifications(false)
  }

  useEffect(() => {
    // Set window dimensions for confetti
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      setIsCheckingAccess(true)
      const user = (await api.getCurrentUser()) as any
      setCurrentUser(user)
      
      // Check if user is driver
      if (user.role !== 'driver') {
        // Redirect if not driver
        if (user.role === 'passenger') {
          window.location.href = '/dashboard'
        } else if (user.role === 'admin') {
          window.location.href = '/admin'
        }
        return
      }

      // Check user status
      if (user.status === 'suspended') {
        setIsCheckingAccess(false)
        return
      }

      // Load KYC data
      let kyc: any = null
      try {
        kyc = await api.getKYC()
        setKycData(kyc)
      } catch (err) {
        kyc = null
        setKycData(null)
      }

      // Check if user just got verified (show congrats message)
      // Check if user is verified and hasn't seen congrats before (persistent across sessions)
      const isNowVerified = (user.status === 'active' || user.status === 'verified') && kyc && kyc.status === 'approved'
      const congratsKey = `has_seen_congrats_driver_${user.id}`
      const hasSeenCongratsBefore = localStorage.getItem(congratsKey)
      
      // Show congrats if user is verified and hasn't seen it before (only once ever)
      if (isNowVerified && !hasSeenCongratsBefore && !hasShownCongrats) {
        setShowCongrats(true)
        setHasShownCongrats(true)
        localStorage.setItem(congratsKey, 'true')
        // Auto-hide after 10 seconds
        setTimeout(() => {
          setShowCongrats(false)
        }, 10000)
      }

      // If status is pending, show waiting screen
      if (user.status === 'pending') {
        setIsCheckingAccess(false)
        return
      }

      // If status is verified but KYC is not approved, show waiting screen
      if (user.status === 'verified' && kyc && kyc.status !== 'approved') {
        setIsCheckingAccess(false)
        return
      }

      // User is approved, load driver data
    loadDriverData()
    loadPendingRides()
    loadDriverRides()
    loadKYCData()
    loadVehicles()
    loadNotifications()
      setIsCheckingAccess(false)
    } catch (err) {
      console.error('Failed to check access:', err)
      setIsCheckingAccess(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'profile') {
      loadKYCData()
      loadVehicles()
    }
  }, [activeTab])
  
  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (currentUser) {
      loadNotifications()
      const interval = setInterval(() => {
        loadNotifications()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

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

  useEffect(() => {
    // Get driver location when going online
    if (isOnline) {
      updateDriverLocation()
      
      // Update location every 30 seconds when online
      const locationInterval = setInterval(() => {
        updateDriverLocation()
      }, 30000)
      
      return () => clearInterval(locationInterval)
    }
  }, [isOnline])
  
  useEffect(() => {
    // Reload pending rides when driver location changes or goes online/offline
    if (isOnline) {
      loadPendingRides()
    }
  }, [driverLocation, isOnline])

  // Constant polling for new rides when on Dashboard tab and online
  useEffect(() => {
    // Only poll if:
    // 1. Driver is online
    // 2. Dashboard tab is active
    // 3. No active ride (don't show new requests when driver has active ride)
    if (isOnline && activeTab === 'dashboard' && !activeRide) {
      // Load rides immediately
      loadPendingRides()
      
      // Then poll every 5 seconds for new rides
      pendingRidesPollingRef.current = setInterval(() => {
        loadPendingRides()
      }, 5000) // Poll every 5 seconds
      
      return () => {
        if (pendingRidesPollingRef.current) {
          clearInterval(pendingRidesPollingRef.current)
          pendingRidesPollingRef.current = null
        }
      }
    } else {
      // Clear polling if conditions aren't met
      if (pendingRidesPollingRef.current) {
        clearInterval(pendingRidesPollingRef.current)
        pendingRidesPollingRef.current = null
      }
    }
  }, [isOnline, activeTab, activeRide])

  useEffect(() => {
    // Refresh active ride status every 10 seconds if driver has an active ride
    if (activeRide) {
      const interval = setInterval(() => {
        loadDriverRides() // This will update activeRide status
      }, 10000) // Check every 10 seconds

      return () => clearInterval(interval)
    }
  }, [activeRide])

  useEffect(() => {
    // Update driver location when active ride exists and driver is online
    if (activeRide && isOnline) {
      updateDriverLocation()
      
      // Update driver location every 10 seconds during active ride
      const locationInterval = setInterval(() => {
        updateDriverLocation()
      }, 10000)
      
      // Set passenger location - try to get from passenger's location, otherwise use pickup location
      const updatePassengerLocation = async () => {
        if (activeRide.passenger && (activeRide.passenger as any).id) {
          try {
            const passenger = await api.getUser((activeRide.passenger as any).id)
            if (passenger && (passenger as any).latitude && (passenger as any).longitude) {
              setPassengerLocation({
                lat: parseFloat(String((passenger as any).latitude)),
                lng: parseFloat(String((passenger as any).longitude)),
              })
              return
            }
          } catch (err) {
            console.error('Failed to get passenger location:', err)
          }
        }
        
        // Fallback to pickup location if passenger location is not available
        if ((activeRide as any).pickupLatitude && (activeRide as any).pickupLongitude) {
          setPassengerLocation({
            lat: (activeRide as any).pickupLatitude,
            lng: (activeRide as any).pickupLongitude,
          })
        }
      }
      
      updatePassengerLocation()
      
      // Update passenger location every 10 seconds
      const passengerLocationInterval = setInterval(() => {
        updatePassengerLocation()
      }, 10000)
      
      return () => {
        clearInterval(locationInterval)
        clearInterval(passengerLocationInterval)
      }
    } else {
      setPassengerLocation(null)
    }
  }, [activeRide, isOnline])

  const loadDriverData = async () => {
    try {
      const user = await api.getCurrentUser()
      setCurrentUser(user)
      setIsOnline((user as any)?.isOnline || false)
      
      // Load driver location if available
      if ((user as any)?.latitude && (user as any)?.longitude) {
        setDriverLocation({
          lat: (user as any).latitude,
          lng: (user as any).longitude,
        })
      }
      
      // Load earnings
      const earnings: any = await api.getEarnings()
      const ridesResponse = await api.getRides({ role: 'driver' })
      const completedRides = ridesResponse.rides?.filter((r: Ride) => r.status === 'completed') || []
      
      // Calculate weekly earnings (last 7 days)
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const weeklyCompletedRides = completedRides.filter((ride: Ride) => {
        const completedAt = (ride as any).completedAt ? new Date((ride as any).completedAt) : new Date(ride.createdAt)
        return completedAt >= oneWeekAgo
      })
      const weeklyTotal = weeklyCompletedRides.reduce((sum: number, ride: Ride) => {
        return sum + (ride.finalFare || ride.acceptedFare || ride.proposedFare || 0)
      }, 0)
      setWeeklyEarnings(weeklyTotal)
      
      const completedRidesCount = completedRides.length
      const cancelledRidesCount = ridesResponse.rides?.filter((r: Ride) => r.status === 'cancelled').length || 0
      
      // Calculate earnings data for chart (last 7 days)
      const earningsByDate: { [key: string]: number } = {}
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        earningsByDate[dateStr] = 0
      }
      
      completedRides.forEach((ride: Ride) => {
        const completedAt = (ride as any).completedAt ? new Date((ride as any).completedAt) : new Date(ride.createdAt)
        const dateStr = completedAt.toISOString().split('T')[0]
        if (earningsByDate.hasOwnProperty(dateStr)) {
          earningsByDate[dateStr] += (ride.finalFare || ride.acceptedFare || ride.proposedFare || 0)
        }
      })
      
      const earningsChartData = Object.entries(earningsByDate).map(([date, earnings]) => ({
        date,
        earnings
      }))
      setEarningsData(earningsChartData)
      
      setStats({
        totalRides: completedRidesCount,
        totalEarnings: earnings?.totalEarnings || 0,
        rating: (user as any)?.averageRating || 0,
        cancelledRides: cancelledRidesCount,
      })
    } catch (err) {
      console.error('Failed to load driver data:', err)
    }
  }

  const loadPendingRides = async () => {
    try {
      setIsLoadingPendingRides(true)
      const rides = await api.getPendingRides()
      const ridesArray = Array.isArray(rides) ? rides : []
      
      // If driver is online and has location, filter rides by proximity
      if (isOnline && driverLocation) {
        const MAX_DISTANCE_KM = 15 // Maximum distance in kilometers (15km radius)
        
        const nearbyRides = ridesArray
          .map((ride: any) => {
            // Check if ride has pickup location coordinates
            if (ride.pickupLatitude && ride.pickupLongitude) {
              const distance = calculateDistance(
                driverLocation.lat,
                driverLocation.lng,
                ride.pickupLatitude,
                ride.pickupLongitude
              )
              return { ...ride, distance }
            }
            // If ride doesn't have coordinates, include it but mark as unknown distance
            return { ...ride, distance: null }
          })
          .filter((ride: any) => {
            // Filter by distance (null distance rides are included)
            return ride.distance === null || ride.distance <= MAX_DISTANCE_KM
          })
          .sort((a: any, b: any) => {
            // First sort by date (newest first), then by distance (closest first)
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            if (dateA !== dateB) {
              return dateB - dateA // Newest first
            }
            // If dates are same, sort by distance
            if (a.distance === null && b.distance === null) return 0
            if (a.distance === null) return 1
            if (b.distance === null) return -1
            return a.distance - b.distance
          })
        
        setPendingRides(nearbyRides)
      } else {
        // If driver is offline or no location, show all rides sorted by date (newest first)
        const sortedRides = ridesArray.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateB - dateA // Newest first
        })
        setPendingRides(sortedRides)
      }
    } catch (err) {
      console.error('Failed to load pending rides:', err)
      setPendingRides([])
    } finally {
      setIsLoadingPendingRides(false)
    }
  }
  
  const updateDriverLocation = async () => {
    try {
      const location = await getCurrentLocation()
      setDriverLocation(location)
      
      // Update driver location in backend
      if (currentUser?.id) {
        await api.updateUser(currentUser.id, {
          latitude: location.lat,
          longitude: location.lng,
        })
      }
    } catch (err) {
      console.error('Failed to get driver location:', err)
    }
  }

  const checkUnreadMessages = async (rideId: string, otherUserId: string) => {
    try {
      const messages = await api.getMessages(otherUserId, rideId)
      if (messages && Array.isArray(messages)) {
        const unread = messages.filter(
          (msg: any) => msg.receiverId === currentUser?.id && !msg.isRead
        )
        setUnreadMessageCount(unread.length)
      }
    } catch (error) {
      console.error('Error checking unread messages:', error)
    }
  }

  const loadDriverRides = async () => {
    try {
      const response = await api.getRides({ role: 'driver' })
      const rides = response.rides || []
      setDriverRides(rides)
      
      // Calculate weekly earnings (last 7 days) from completed rides
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const completedRides = rides.filter((r: Ride) => r.status === 'completed')
      const cancelledRides = rides.filter((r: Ride) => r.status === 'cancelled')
      const weeklyCompletedRides = completedRides.filter((ride: Ride) => {
        const completedAt = (ride as any).completedAt ? new Date((ride as any).completedAt) : new Date(ride.createdAt)
        return completedAt >= oneWeekAgo
      })
      const weeklyTotal = weeklyCompletedRides.reduce((sum: number, ride: Ride) => {
        return sum + (ride.finalFare || ride.acceptedFare || ride.proposedFare || 0)
      }, 0)
      setWeeklyEarnings(weeklyTotal)
      
      // Update stats with completed and cancelled counts
      setStats(prev => ({
        ...prev,
        totalRides: completedRides.length,
        cancelledRides: cancelledRides.length,
      }))
      
      // Update earnings chart data
      const earningsByDate: { [key: string]: number } = {}
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        earningsByDate[dateStr] = 0
      }
      
      completedRides.forEach((ride: Ride) => {
        const completedAt = (ride as any).completedAt ? new Date((ride as any).completedAt) : new Date(ride.createdAt)
        const dateStr = completedAt.toISOString().split('T')[0]
        if (earningsByDate.hasOwnProperty(dateStr)) {
          earningsByDate[dateStr] += (ride.finalFare || ride.acceptedFare || ride.proposedFare || 0)
        }
      })
      
      const earningsChartData = Object.entries(earningsByDate).map(([date, earnings]) => ({
        date,
        earnings
      }))
      setEarningsData(earningsChartData)
      
      // Check for active ride (accepted, driver_assigned, driver_arrived, or in_progress)
      const activeRideFound = rides.find((ride: Ride) => 
        ride.status === 'accepted' ||
        ride.status === 'driver_assigned' || 
        ride.status === 'driver_arrived' || 
        ride.status === 'in_progress'
      )
      
      if (activeRideFound) {
        setActiveRide(activeRideFound)
        // Check for unread messages
        if (activeRideFound.passenger && typeof activeRideFound.passenger === 'object' && 'id' in activeRideFound.passenger) {
          checkUnreadMessages(activeRideFound.id, (activeRideFound.passenger as any).id)
        }
      } else {
        setActiveRide(null)
        setUnreadMessageCount(0)
      }
    } catch (err) {
      console.error('Failed to load driver rides:', err)
      setDriverRides([])
      setActiveRide(null)
    }
  }

  // Set up message socket listener for unread messages
  useEffect(() => {
    if (!activeRide || !activeRide.passenger || !currentUser) return

    const token = localStorage.getItem('token')
    if (!token) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'
    const { io } = require('socket.io-client')
    const socket = io(`${socketUrl}/messages`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      socket.emit('join_ride_room', { rideId: activeRide.id })
    })

    socket.on('new_message', (message: any) => {
      // Only count if message is for current user and not read
      if (message.receiverId === currentUser.id && !message.isRead) {
        setUnreadMessageCount((prev) => prev + 1)
      }
    })

    messageSocketRef.current = socket

    return () => {
      if (socket) {
        socket.emit('leave_ride_room', { rideId: activeRide.id })
        socket.disconnect()
      }
    }
  }, [activeRide?.id, currentUser?.id])

  // Check unread messages when active ride changes
  useEffect(() => {
    if (activeRide && activeRide.passenger && currentUser) {
      const passenger = activeRide.passenger as any
      if (passenger.id) {
        checkUnreadMessages(activeRide.id, passenger.id)
      }
    } else {
      setUnreadMessageCount(0)
    }
  }, [activeRide?.id])

  const handleToggleOnline = async () => {
    try {
      const newOnlineStatus = !isOnline
      setIsOnline(newOnlineStatus)
      // Update online status in backend (if currentUser is loaded)
      if (currentUser?.id) {
        await api.updateUser(currentUser.id, { isOnline: newOnlineStatus })
        // Reload user data
        await loadDriverData()
      }
    } catch (err) {
      console.error('Failed to update online status:', err)
      setIsOnline(!isOnline) // Revert on error
    }
  }

  const handleAcceptRide = async (rideId: string, counterOffer?: number) => {
    try {
      setIsLoading(true)
      setError('')
      await api.acceptRide(rideId, counterOffer)
      await loadPendingRides()
      await loadDriverRides()
      setShowCounterOfferModal(false)
      setRideToCounter(null)
      setCounterOfferAmount(0)
      // Stay on current tab instead of redirecting to My Rides
    } catch (err: any) {
      setError(err.message || 'Failed to accept ride')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCounterOffer = async () => {
    if (!rideToCounter || !counterOfferAmount || counterOfferAmount <= 0) {
      setError('Please enter a valid counter offer amount')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      await api.counterOfferRide(rideToCounter.id, counterOfferAmount)
      await loadPendingRides()
      await loadDriverRides()
      setShowCounterOfferModal(false)
      setRideToCounter(null)
      setCounterOfferAmount(0)
    } catch (err: any) {
      setError(err.message || 'Failed to submit counter offer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRide = async () => {
    if (!rideToCancel || !cancelReason.trim()) {
      setError('Please provide a cancellation reason (at least 5 characters)')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.cancelRide(rideToCancel, cancelReason.trim())
      await loadPendingRides()
      await loadDriverRides()
      await loadNotifications() // Refresh notifications to show cancellation notification
      setShowCancelModal(false)
      setCancelReason('')
      setRideToCancel(null)
    } catch (err: any) {
      setError(err.message || 'Failed to cancel ride. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndRide = async () => {
    if (!activeRide) return

    if (!confirm('Are you sure you want to end this ride?')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.endRide(activeRide.id)
      await loadDriverRides()
      setActiveRide(null)
    } catch (err: any) {
      setError(err.message || 'Failed to end ride. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadKYCData = async () => {
    try {
      const kyc = await api.getKYC()
      setKycData(kyc)
    } catch (err) {
      console.error('Failed to load KYC data:', err)
      setKycData(null)
    }
  }

  const loadVehicles = async () => {
    try {
      const vehiclesList = await api.getAllVehicles()
      setVehicles(Array.isArray(vehiclesList) ? vehiclesList : [])
    } catch (err) {
      console.error('Failed to load vehicles:', err)
      setVehicles([])
    }
  }

  const handleAddVehicle = () => {
    setEditingVehicle(null)
    setVehicleFormData({
      make: '',
      model: '',
      year: '',
      color: '',
      plateNumber: '',
      type: 'sedan',
      capacity: '',
      insuranceExpiry: '',
    })
    setVehicleFiles({
      registrationImage: null,
      insuranceImage: null,
    })
    setShowVehicleForm(true)
    setError('')
  }

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setVehicleFormData({
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year?.toString() || '',
      color: vehicle.color || '',
      plateNumber: vehicle.plateNumber || '',
      type: vehicle.type || 'sedan',
      capacity: vehicle.capacity?.toString() || '',
      insuranceExpiry: vehicle.insuranceExpiry 
        ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] 
        : '',
    })
    setVehicleFiles({
      registrationImage: null,
      insuranceImage: null,
    })
    setShowVehicleForm(true)
    setError('')
  }

  const handleVehicleFileChange = (field: 'registrationImage' | 'insuranceImage', file: File | null) => {
    setVehicleFiles({
      ...vehicleFiles,
      [field]: file,
    })
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      setIsLoading(true)
      await api.deleteVehicle(vehicleId)
      await loadVehicles()
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to delete vehicle')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveVehicle = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Validate required fields
      if (!vehicleFormData.make || !vehicleFormData.model || !vehicleFormData.year || !vehicleFormData.plateNumber) {
        setError('Please fill in all required fields (Make, Model, Year, License Plate)')
        setIsLoading(false)
        return
      }

      // Convert files to base64 if they exist
      let registrationImageBase64 = null
      let insuranceImageBase64 = null

      if (vehicleFiles.registrationImage) {
        registrationImageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(vehicleFiles.registrationImage!)
        })
      }

      if (vehicleFiles.insuranceImage) {
        insuranceImageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(vehicleFiles.insuranceImage!)
        })
      }
      
      // Validate year is valid
      const year = parseInt(vehicleFormData.year)
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        setError('Please enter a valid year')
        setIsLoading(false)
        return
      }

      const vehicleData: any = {
        make: vehicleFormData.make.trim(),
        model: vehicleFormData.model.trim(),
        year: year,
        color: vehicleFormData.color?.trim() || 'Not specified',
        plateNumber: vehicleFormData.plateNumber.trim(),
        type: vehicleFormData.type,
        capacity: vehicleFormData.capacity ? parseInt(vehicleFormData.capacity) : null,
        insuranceExpiry: vehicleFormData.insuranceExpiry || null,
      }

      // Only include images if they're new uploads
      // Limit base64 string size to prevent issues (max 5MB)
      if (registrationImageBase64) {
        // Remove data URL prefix to get just base64
        const base64String = registrationImageBase64.split(',')[1] || registrationImageBase64
        if (base64String.length > 5 * 1024 * 1024) { // 5MB limit
          setError('Registration document is too large. Maximum size is 5MB')
          setIsLoading(false)
          return
        }
        vehicleData.registrationImage = base64String
      }
      if (insuranceImageBase64) {
        const base64String = insuranceImageBase64.split(',')[1] || insuranceImageBase64
        if (base64String.length > 5 * 1024 * 1024) { // 5MB limit
          setError('Insurance document is too large. Maximum size is 5MB')
          setIsLoading(false)
          return
        }
        vehicleData.insuranceImage = base64String
      }

      if (editingVehicle) {
        await api.updateVehicle(editingVehicle.id, vehicleData)
      } else {
        await api.registerVehicle(vehicleData)
      }

      await loadVehicles()
      setShowVehicleForm(false)
      setEditingVehicle(null)
      setVehicleFiles({ registrationImage: null, insuranceImage: null })
      setError('')
      
      // Reset form
      setVehicleFormData({
        make: '',
        model: '',
        year: '',
        color: '',
        plateNumber: '',
        type: 'sedan',
        capacity: '',
        insuranceExpiry: '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle')
    } finally {
      setIsLoading(false)
    }
  }

  // Show waiting screen if access is restricted
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (currentUser) {
    if (currentUser.status === 'suspended') {
      return (
        <WaitingScreen
          userRole="driver"
          status="suspended"
          kycStatus={kycData?.status}
          rejectionReason={kycData?.rejectionReason}
        />
      )
    }
    if (currentUser.status === 'pending' || (currentUser.status === 'verified' && kycData && kycData.status !== 'approved')) {
      return (
        <WaitingScreen
          userRole="driver"
          status="pending"
          kycStatus={kycData?.status}
          rejectionReason={kycData?.rejectionReason}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Congratulations Message */}
        {showCongrats && (
          <>
            {windowDimensions.width > 0 && windowDimensions.height > 0 && (
              <Confetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                recycle={false}
                numberOfPieces={400}
                gravity={0.15}
                initialVelocityY={15}
                initialVelocityX={5}
                colors={['#C1F11D', '#A8D414', '#8FB810', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA500', '#9B59B6']}
                style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
              />
            )}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-lg w-full mx-4 transform transition-all animate-scaleIn border-2 border-primary-200">
                <div className="text-center">
                  {/* Animated Checkmark */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                        <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 animate-pulse">
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    Congratulations! 🎉
                  </h2>

                  {/* Message */}
                  <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                    Your driver account has been verified! You can now start accepting rides and earning money.
                  </p>

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowCongrats(false)}
                    className="w-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Driving
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Driver<span className="text-primary-600">.</span>
            </h1>
            {/* Notifications */}
            <div className="relative shrink-0" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="w-6 h-6 text-gray-700" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                                !notification.isRead ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                  !notification.isRead ? 'bg-blue-500' : 'bg-transparent'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {formatDate(notification.createdAt)}
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
                          onClick={() => {
                            router.push('/driver')
                            setShowNotifications(false)
                          }}
                          className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-semibold"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Manage your rides and earnings
          </p>
          {/* Online/Offline Status and Button */}
          <div className="flex items-center gap-3 mt-4 sm:mt-6">
            <div
              className={`flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-sm sm:text-base ${
                isOnline
                  ? 'bg-primary-100 text-gray-900'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                  isOnline ? 'bg-primary-500' : 'bg-gray-400'
                }`}
              />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <Button
              variant={isOnline ? 'outline' : 'primary'}
              onClick={handleToggleOnline}
              className="font-semibold border text-sm sm:text-base"
              disabled={isLoading}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 sm:mb-10 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-gray-100">
          <div className="flex space-x-2 min-w-max relative">
            {[
              { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: Car },
              { id: 'rides', label: 'My Rides', shortLabel: 'Rides', icon: Navigation },
              { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: DollarSign },
              { id: 'profile', label: 'Profile', shortLabel: 'Profile', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 text-sm sm:text-base px-4 sm:px-6 py-3 font-semibold transition-all duration-300 relative shrink-0 rounded-t-lg ${
                  activeTab === tab.id
                    ? 'text-gray-900 bg-primary-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`} />
                <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                <span className="sm:hidden whitespace-nowrap">{tab.shortLabel}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab - Live Search for Rides */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Active Ride Display */}
            {activeRide && (
              <Card className="shadow-xl border-2 border-[#C1F11D] bg-gradient-to-br from-white to-[#C1F11D]/5">
                <CardHeader className="pb-5 bg-gradient-to-r from-[#C1F11D]/10 to-transparent rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900">Active Ride</CardTitle>
                    {activeRide.passenger && ((activeRide as any).status === 'accepted' || (activeRide as any).status === 'driver_assigned' || (activeRide as any).status === 'driver_arrived' || (activeRide as any).status === 'in_progress') && (
                      <button
                        onClick={() => {
                          const passenger = activeRide.passenger as any
                          setMessageRideId((activeRide as any).id)
                          setMessageOtherUserId(passenger.id)
                          setMessageOtherUserName(passenger.name || passenger.email?.split('@')[0] || 'Passenger')
                          setShowMessageModal(true)
                          setUnreadMessageCount(0) // Clear unread count when opening
                        }}
                        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
                        title="Messages"
                      >
                        <MessageCircle className="w-6 h-6 text-primary-600 group-hover:text-primary-700" />
                        {unreadMessageCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse px-1.5 shadow-lg">
                            {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Ride Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-[#C1F11D] mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Pickup Location</p>
                            <p className="font-semibold text-gray-900">{activeRide.pickupLocation}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Navigation className="w-5 h-5 text-[#C1F11D] mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Destination</p>
                            <p className="font-semibold text-gray-900">{activeRide.destination}</p>
                          </div>
                        </div>
                        {activeRide.passenger && (
                          <div className="flex items-start space-x-3">
                            <User className="w-5 h-5 text-[#C1F11D] mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Passenger</p>
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold text-gray-900">
                                  {activeRide.passenger.name || activeRide.passenger.email?.split('@')[0] || 'Unknown'}
                                </p>
                                {activeRide.passenger.averageRating && (
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm text-gray-600 ml-1">
                                      {activeRide.passenger.averageRating}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Fare</p>
                          <p className="text-2xl font-bold text-[#C1F11D]">
                            {formatCurrency(activeRide.acceptedFare || activeRide.finalFare || activeRide.proposedFare)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {activeRide.status?.replace('_', ' ') || 'Active'}
                          </p>
                        </div>
                        {(activeRide as any).distance && (
                          <div>
                            <p className="text-sm text-gray-600">Distance</p>
                            <p className="font-semibold text-gray-900">
                              {(activeRide as any).distance.toFixed(1)} km
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Live Tracking Map with Driver and Passenger Locations */}
                    {(activeRide as any).pickupLatitude && (activeRide as any).pickupLongitude && 
                     (activeRide as any).destinationLatitude && (activeRide as any).destinationLongitude && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Live Tracking</h3>
                        <LiveTrackingMap
                          pickupLocation={{
                            lat: Number((activeRide as any).pickupLatitude),
                            lng: Number((activeRide as any).pickupLongitude),
                          }}
                          destinationLocation={{
                            lat: Number((activeRide as any).destinationLatitude),
                            lng: Number((activeRide as any).destinationLongitude),
                          }}
                          driverLocation={driverLocation}
                          passengerLocation={passengerLocation}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      {activeRide.passenger && ((activeRide as any).status === 'accepted' || (activeRide as any).status === 'driver_assigned' || (activeRide as any).status === 'driver_arrived' || (activeRide as any).status === 'in_progress') && (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            const passenger = activeRide.passenger as any
                            setMessageRideId((activeRide as any).id)
                            setMessageOtherUserId(passenger.id)
                            setMessageOtherUserName(passenger.name || passenger.email?.split('@')[0] || 'Passenger')
                            setShowMessageModal(true)
                          }}
                          className="flex-1 border-primary-500 text-primary-600 hover:bg-primary-50"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Message Passenger
                        </Button>
                      )}
                      {((activeRide as any).status === 'in_progress' || (activeRide as any).status === 'accepted') && (
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleEndRide}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          End Ride
                        </Button>
                      )}
                      {(activeRide as any).status !== 'completed' && (activeRide as any).status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            setRideToCancel((activeRide as any).id)
                            setShowCancelModal(true)
                          }}
                          disabled={isLoading}
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Cancel Ride
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Search for Ride Requests */}
            {!activeRide && (
              <Card className="shadow-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-5 bg-gradient-to-r from-primary-50 to-transparent rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900">Live Search for Rides</CardTitle>
                    <div className="flex items-center space-x-3">
                      {isOnline && activeTab === 'dashboard' && !activeRide && (
                        <>
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            <span className="text-sm text-gray-500">Searching...</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-500">Live</span>
                          </div>
                        </>
                      )}
                      {!isOnline && (
                        <Button variant="primary" onClick={handleToggleOnline} className="font-semibold">
                          Go Online to See Requests
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    {!isOnline ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">You're currently offline</p>
                        <p className="text-sm text-gray-500">Go online to see available ride requests from passengers</p>
                      </div>
                    ) : pendingRides.length === 0 ? (
                      <div className="text-center py-12">
                        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No ride requests available at the moment.</p>
                        <p className="text-sm text-gray-500 mt-2">New requests from passengers will appear here in real-time</p>
                      </div>
                    ) : (
                      pendingRides.map((ride) => (
                        <div
                          key={ride.id}
                          className="p-4 sm:p-6 border border-gray-200 rounded-2xl hover:border-primary-500 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-br hover:from-white hover:to-primary-50/30"
                        >
                          <div className="mb-4">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                {new Date(ride.createdAt).toLocaleString()}
                              </span>
                              {ride.passenger && (
                                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                  <span className="text-xs sm:text-sm text-gray-600 ml-1">
                                    {ride.passenger.averageRating || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-start text-sm sm:text-base text-gray-700">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600 shrink-0 mt-0.5" />
                                <span className="break-words flex-1">{ride.pickupLocation}</span>
                              </div>
                              <div className="flex justify-center py-1">
                                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                              </div>
                              <div className="flex items-start text-sm sm:text-base text-gray-700">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent-600 shrink-0 mt-0.5" />
                                <span className="break-words flex-1">{ride.destination}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              {(ride as any).distance && (
                                <span className="whitespace-nowrap">
                                  {parseFloat((ride as any).distance).toFixed(2)} miles
                                </span>
                              )}
                              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                Proposed: {formatCurrency(ride.proposedFare)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-100">
                            <Button 
                              variant="primary" 
                              className="flex-1 font-semibold border border-primary-500 text-sm sm:text-base"
                              onClick={() => handleAcceptRide(ride.id)}
                              disabled={isLoading}
                            >
                              Accept Fare
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 font-semibold text-sm sm:text-base"
                              onClick={() => {
                                setRideToCounter(ride)
                                setCounterOfferAmount(ride.proposedFare)
                                setShowCounterOfferModal(true)
                              }}
                            >
                              Counter Offer
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 font-semibold text-red-600 border-red-300 hover:bg-red-50 text-sm sm:text-base"
                              onClick={() => {
                                setRideToCancel(ride.id)
                                setShowCancelModal(true)
                              }}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* My Rides Tab */}
        {activeTab === 'rides' && (
          <Card className="shadow-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-5 bg-gradient-to-r from-primary-50 to-transparent rounded-t-xl">
              <CardTitle className="text-2xl font-bold text-gray-900">My Rides</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Sub-tabs for Scheduled, Completed, and Cancelled Rides */}
              <div className="mb-6 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-gray-100">
                <div className="flex space-x-2 min-w-max relative">
                  {[
                    { id: 'scheduled', label: 'Scheduled Rides', shortLabel: 'Scheduled', icon: Calendar },
                    { id: 'completed', label: 'Completed Rides', shortLabel: 'Completed', icon: Car },
                    { id: 'cancelled', label: 'Cancelled Rides', shortLabel: 'Cancelled', icon: X },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setMyRidesSubTab(tab.id as 'completed' | 'scheduled' | 'cancelled')}
                      className={`flex items-center space-x-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold transition-all duration-300 relative shrink-0 rounded-t-lg ${
                        myRidesSubTab === tab.id
                          ? 'text-gray-900 bg-primary-500 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${myRidesSubTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`} />
                      <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                      <span className="sm:hidden whitespace-nowrap">{tab.shortLabel}</span>
                      {myRidesSubTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Completed Rides Content */}
              {myRidesSubTab === 'completed' && (
                <div className="space-y-4">
                  {driverRides.filter(r => r.status === 'completed').length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-xl bg-gray-50">
                      <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No completed rides yet.</p>
                    </div>
                  ) : (
                    driverRides
                      .filter(r => r.status === 'completed')
                      .map((ride) => (
                        <div
                          key={ride.id}
                          className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 border border-gray-200 rounded-2xl hover:border-primary-500 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-white hover:to-primary-50/30 hover:-translate-y-0.5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <span className="text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                                {formatDate(new Date((ride as any).completedAt || ride.createdAt))}
                              </span>
                              {ride.passenger && (
                                <div className="flex items-center bg-yellow-50 px-2 sm:px-3 py-1 rounded-full">
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                  <span className="text-sm sm:text-base font-semibold text-gray-700 ml-1">
                                    {ride.passenger.averageRating || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm sm:text-base text-gray-800 font-semibold break-words">
                              <span className="block sm:inline">{ride.pickupLocation}</span>
                              <span className="hidden sm:inline"> → </span>
                              <span className="block sm:inline mt-1 sm:mt-0">{ride.destination}</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-xl sm:text-2xl font-extrabold text-primary-600 group-hover:scale-110 transition-transform inline-block">
                              {formatCurrency(ride.finalFare || ride.acceptedFare || ride.proposedFare)}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Scheduled Rides Content */}
              {myRidesSubTab === 'scheduled' && (
                <div className="space-y-4">
                  {driverRides.filter(r => r.status === 'scheduled' || (r as any).type === 'scheduled').length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-xl bg-gray-50">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No scheduled rides yet.</p>
                    </div>
                  ) : (
                    driverRides
                      .filter(r => r.status === 'scheduled' || (r as any).type === 'scheduled')
                      .map((ride) => (
                        <div
                          key={ride.id}
                          className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 border border-gray-200 rounded-2xl hover:border-primary-500 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-white hover:to-primary-50/30 hover:-translate-y-0.5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <span className="text-sm sm:text-base font-semibold text-gray-700 bg-primary-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                                {formatDate(ride.createdAt)}
                              </span>
                              {ride.passenger && (
                                <div className="flex items-center bg-yellow-50 px-2 sm:px-3 py-1 rounded-full">
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                  <span className="text-sm sm:text-base font-semibold text-gray-700 ml-1">
                                    {ride.passenger.averageRating || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm sm:text-base text-gray-800 font-semibold break-words">
                              <span className="block sm:inline">{ride.pickupLocation}</span>
                              <span className="hidden sm:inline"> → </span>
                              <span className="block sm:inline mt-1 sm:mt-0">{ride.destination}</span>
                            </div>
                            {(ride as any).scheduledTime && (
                              <div className="text-xs sm:text-sm text-gray-600 mt-2">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                Scheduled for: {formatDate((ride as any).scheduledTime)}
                              </div>
                            )}
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-xl sm:text-2xl font-extrabold text-primary-600 group-hover:scale-110 transition-transform inline-block">
                              {formatCurrency(ride.finalFare || ride.acceptedFare || ride.proposedFare)}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* Cancelled Rides Content */}
              {myRidesSubTab === 'cancelled' && (
                <div className="space-y-4">
                  {driverRides.filter(r => r.status === 'cancelled').length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-xl bg-gray-50">
                      <X className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No cancelled rides yet.</p>
                    </div>
                  ) : (
                    driverRides
                      .filter(r => r.status === 'cancelled')
                      .map((ride) => (
                        <div
                          key={ride.id}
                          className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 border border-red-200 rounded-2xl hover:border-red-400 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-white hover:to-red-50/30 hover:-translate-y-0.5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <span className="text-sm sm:text-base font-semibold text-gray-700 bg-red-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                                {formatDate((ride as any).cancelledAt || (ride as any).updatedAt || ride.createdAt)}
                              </span>
                              {(ride as any).cancellationReason && (
                                <div className="flex items-center bg-red-50 px-2 sm:px-3 py-1 rounded-full">
                                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                                  <span className="text-xs sm:text-sm font-semibold text-red-700 ml-1 break-words">
                                    {(ride as any).cancellationReason}
                                  </span>
                                </div>
                              )}
                              {ride.passenger && (
                                <div className="flex items-center bg-yellow-50 px-2 sm:px-3 py-1 rounded-full">
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                  <span className="text-sm sm:text-base font-semibold text-gray-700 ml-1">
                                    {ride.passenger.averageRating || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm sm:text-base text-gray-800 font-semibold break-words">
                              <span className="block sm:inline">{ride.pickupLocation}</span>
                              <span className="hidden sm:inline"> → </span>
                              <span className="block sm:inline mt-1 sm:mt-0">{ride.destination}</span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="text-xl sm:text-2xl font-extrabold text-red-600 group-hover:scale-110 transition-transform inline-block">
                              {formatCurrency(ride.finalFare || ride.acceptedFare || ride.proposedFare || 0)}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Overview Tab (formerly Earnings) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group shadow-lg border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-primary-50/30">
                <CardContent className="p-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-600 mb-2">Total Rides</p>
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">{stats.totalRides}</p>
                    </div>
                    <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Car className="w-7 h-7 text-gray-900" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group shadow-lg border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-primary-50/30">
                <CardContent className="p-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-600 mb-2">Total Earnings</p>
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {formatCurrency(stats.totalEarnings)}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="w-7 h-7 text-gray-900" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group shadow-lg border border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-yellow-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-600 mb-2">Rating</p>
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:text-yellow-600 transition-colors">{stats.rating}</p>
                    </div>
                    <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Star className="w-7 h-7 text-yellow-600 fill-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group shadow-lg border border-gray-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-red-50/30">
                <CardContent className="p-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-600 mb-2">Cancelled Rides</p>
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:text-red-600 transition-colors">{stats.cancelledRides}</p>
                    </div>
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <X className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-5 bg-gradient-to-r from-primary-50 to-transparent rounded-t-xl">
                <CardTitle className="text-2xl font-bold text-gray-900">Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-10 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl border border-primary-200">
                    <p className="text-base font-semibold text-gray-700 mb-2">This Week</p>
                    <p className="text-5xl font-bold text-gray-900 mb-2">{formatCurrency(weeklyEarnings)}</p>
                    {weeklyEarnings > 0 && (
                      <div className="flex items-center justify-center mt-3 text-primary-600">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        <span className="text-base font-semibold">Keep it up!</span>
                      </div>
                    )}
                  </div>
                  {/* Earnings Chart */}
                  <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
                    {earningsData.length > 0 ? (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 flex items-end justify-between gap-2">
                          {earningsData.map((data, index) => {
                            const maxEarnings = Math.max(...earningsData.map(d => d.earnings), 1)
                            const height = maxEarnings > 0 ? (data.earnings / maxEarnings) * 100 : 0
                            const date = new Date(data.date)
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                            
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center justify-end group">
                                <div className="relative w-full">
                                  <div
                                    className="w-full bg-primary-500 rounded-t-md hover:bg-primary-600 transition-all duration-300 group-hover:shadow-lg"
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                  >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                      {formatCurrency(data.earnings)}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-2 font-medium">{dayName}</p>
                                <p className="text-xs text-gray-400 mt-1">{date.getDate()}/{date.getMonth() + 1}</p>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 text-center">Last 7 days earnings</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500 font-medium">No earnings data available yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50">
              <CardHeader className="pb-5 bg-gradient-to-r from-primary-50 to-transparent rounded-t-xl">
                <CardTitle className="text-2xl font-bold text-gray-900">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="text-center py-8 text-gray-600">
                  <p className="text-sm">Earnings breakdown will be available soon.</p>
                  <p className="text-xs mt-2">Total earnings shown above.</p>
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalEarnings)}</span>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* KYC Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary-500" />
                  <span>KYC Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {kycData ? (
                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">First Name</label>
                          <p className="text-sm text-gray-900 mt-0.5">{kycData.firstName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Last Name</label>
                          <p className="text-sm text-gray-900 mt-0.5">{kycData.lastName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Date of Birth</label>
                          <p className="text-sm text-gray-900 mt-0.5">
                            {kycData.dateOfBirth ? new Date(kycData.dateOfBirth).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Nationality</label>
                          <p className="text-sm text-gray-900 mt-0.5">{kycData.nationality || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-3">
                          <label className="text-xs font-medium text-gray-500">Street Address</label>
                          <p className="text-sm text-gray-900 mt-0.5">{kycData.address || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">City</label>
                          <p className="text-sm text-gray-900 mt-0.5">{kycData.city || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">State</label>
                          <p className="text-sm text-gray-900 mt-0.5">{kycData.state || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">ZIP Code</label>
                          <p className="text-sm text-gray-900 mt-0.5">{kycData.zipCode || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Country</label>
                          <p className="text-sm text-gray-900 mt-0.5">{kycData.country || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* ID Verification */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">ID Verification</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500">ID Type</label>
                          <p className="text-sm text-gray-900 mt-0.5 capitalize">{kycData.idType || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">ID Number</label>
                          <p className="text-sm text-gray-900 mt-0.5 font-mono">{kycData.idNumber || 'N/A'}</p>
                        </div>
                      </div>
                      {(kycData.idFront || kycData.idBack) && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {kycData.idFront && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ID Front</label>
                              <button
                                onClick={() => {
                                  const imageUrl = kycData.idFront.startsWith('data:') 
                                    ? kycData.idFront 
                                    : kycData.idFront.startsWith('http')
                                    ? kycData.idFront
                                    : `data:image/jpeg;base64,${kycData.idFront}`
                                  setViewingDocument({
                                    url: imageUrl,
                                    title: 'ID Front',
                                    type: 'image'
                                  })
                                }}
                                className="w-full"
                              >
                                <img
                                  src={kycData.idFront.startsWith('data:') 
                                    ? kycData.idFront 
                                    : kycData.idFront.startsWith('http')
                                    ? kycData.idFront
                                    : `data:image/jpeg;base64,${kycData.idFront}`}
                                  alt="ID Front"
                                  className="w-full h-32 object-cover rounded-lg border border-gray-300 hover:border-primary-500 transition-colors cursor-pointer"
                                />
                              </button>
                            </div>
                          )}
                          {kycData.idBack && (
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-1.5 block">ID Back</label>
                              <button
                                onClick={() => {
                                  const imageUrl = kycData.idBack.startsWith('data:') 
                                    ? kycData.idBack 
                                    : kycData.idBack.startsWith('http')
                                    ? kycData.idBack
                                    : `data:image/jpeg;base64,${kycData.idBack}`
                                  setViewingDocument({
                                    url: imageUrl,
                                    title: 'ID Back',
                                    type: 'image'
                                  })
                                }}
                                className="w-full"
                              >
                                <img
                                  src={kycData.idBack.startsWith('data:') 
                                    ? kycData.idBack 
                                    : kycData.idBack.startsWith('http')
                                    ? kycData.idBack
                                    : `data:image/jpeg;base64,${kycData.idBack}`}
                                  alt="ID Back"
                                  className="w-full h-32 object-cover rounded-lg border border-gray-300 hover:border-primary-500 transition-colors cursor-pointer"
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Driver License (if applicable) */}
                    {kycData.licenseNumber && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Driver License</h3>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium text-gray-500">License Number</label>
                            <p className="text-sm text-gray-900 mt-0.5 font-mono">{kycData.licenseNumber}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">Expiry Date</label>
                            <p className="text-sm text-gray-900 mt-0.5">
                              {kycData.licenseExpiry ? new Date(kycData.licenseExpiry).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {(kycData.licenseFront || kycData.licenseBack) && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {kycData.licenseFront && (
                              <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">License Front</label>
                                <button
                                  onClick={() => {
                                    const imageUrl = kycData.licenseFront.startsWith('data:') 
                                      ? kycData.licenseFront 
                                      : kycData.licenseFront.startsWith('http')
                                      ? kycData.licenseFront
                                      : `data:image/jpeg;base64,${kycData.licenseFront}`
                                    setViewingDocument({
                                      url: imageUrl,
                                      title: 'License Front',
                                      type: 'image'
                                    })
                                  }}
                                  className="w-full"
                                >
                                  <img
                                    src={kycData.licenseFront.startsWith('data:') 
                                      ? kycData.licenseFront 
                                      : kycData.licenseFront.startsWith('http')
                                      ? kycData.licenseFront
                                      : `data:image/jpeg;base64,${kycData.licenseFront}`}
                                    alt="License Front"
                                    className="w-full h-32 object-cover rounded-lg border border-gray-300 hover:border-primary-500 transition-colors cursor-pointer"
                                  />
                                </button>
                              </div>
                            )}
                            {kycData.licenseBack && (
                              <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">License Back</label>
                                <button
                                  onClick={() => {
                                    const imageUrl = kycData.licenseBack.startsWith('data:') 
                                      ? kycData.licenseBack 
                                      : kycData.licenseBack.startsWith('http')
                                      ? kycData.licenseBack
                                      : `data:image/jpeg;base64,${kycData.licenseBack}`
                                    setViewingDocument({
                                      url: imageUrl,
                                      title: 'License Back',
                                      type: 'image'
                                    })
                                  }}
                                  className="w-full"
                                >
                                  <img
                                    src={kycData.licenseBack.startsWith('data:') 
                                      ? kycData.licenseBack 
                                      : kycData.licenseBack.startsWith('http')
                                      ? kycData.licenseBack
                                      : `data:image/jpeg;base64,${kycData.licenseBack}`}
                                    alt="License Back"
                                    className="w-full h-32 object-cover rounded-lg border border-gray-300 hover:border-primary-500 transition-colors cursor-pointer"
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500">Verification Status</label>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          kycData.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : kycData.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {kycData.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No KYC information available. Please complete your KYC verification.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicles Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="w-5 h-5 text-primary-500" />
                    <span>My Vehicles</span>
                  </CardTitle>
                  <Button onClick={handleAddVehicle} className="bg-primary-500 hover:bg-primary-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Vehicle Form - Inline */}
                {showVehicleForm && (
                  <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowVehicleForm(false)
                          setEditingVehicle(null)
                          setError('')
                          setVehicleFiles({ registrationImage: null, insuranceImage: null })
                          setVehicleFormData({
                            make: '',
                            model: '',
                            year: '',
                            color: '',
                            plateNumber: '',
                            type: 'sedan',
                            capacity: '',
                            insuranceExpiry: '',
                          })
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-gray-900">Vehicle Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Vehicle Make"
                          name="make"
                          placeholder="e.g., Toyota"
                          icon={<Car className="w-5 h-5" />}
                          value={vehicleFormData.make}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, make: e.target.value })}
                          required
                        />
                        <Input
                          label="Vehicle Model"
                          name="model"
                          placeholder="e.g., Camry"
                          icon={<Car className="w-5 h-5" />}
                          value={vehicleFormData.model}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                          required
                        />
                        <Input
                          label="Year"
                          name="year"
                          type="number"
                          placeholder="e.g., 2020"
                          value={vehicleFormData.year}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, year: e.target.value })}
                          required
                        />
                        <Input
                          label="License Plate"
                          name="plateNumber"
                          placeholder="License plate number"
                          icon={<FileText className="w-5 h-5" />}
                          value={vehicleFormData.plateNumber}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, plateNumber: e.target.value })}
                          required
                        />
                      </div>

                      {/* Vehicle Registration Document */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Vehicle Registration Document
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            id="vehicleRegistration"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVehicleFileChange('registrationImage', e.target.files?.[0] || null)}
                          />
                          <label htmlFor="vehicleRegistration" className="cursor-pointer">
                            {vehicleFiles.registrationImage || (editingVehicle?.registrationImage) ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                                <p className="text-sm font-medium text-gray-900">
                                  {vehicleFiles.registrationImage?.name || 'Registration document uploaded'}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm font-medium text-gray-700">Upload Registration</p>
                                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Insurance Information */}
                      <div className="mt-6">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Insurance Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="Insurance Expiry"
                            type="date"
                            name="insuranceExpiry"
                            icon={<Calendar className="w-5 h-5" />}
                            value={vehicleFormData.insuranceExpiry}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, insuranceExpiry: e.target.value })}
                          />
                          <div className="md:col-span-2"></div>
                        </div>
                      </div>

                      {/* Insurance Document */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Insurance Document
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            id="insuranceDocument"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVehicleFileChange('insuranceImage', e.target.files?.[0] || null)}
                          />
                          <label htmlFor="insuranceDocument" className="cursor-pointer">
                            {vehicleFiles.insuranceImage || (editingVehicle?.insuranceImage) ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                                <p className="text-sm font-medium text-gray-900">
                                  {vehicleFiles.insuranceImage?.name || 'Insurance document uploaded'}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm font-medium text-gray-700">Upload Insurance Document</p>
                                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="mt-6">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Additional Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Color"
                            name="color"
                            value={vehicleFormData.color}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, color: e.target.value })}
                          />
                          <div>
                            <label className="block text-base font-medium text-gray-700 mb-1">
                              Vehicle Type
                            </label>
                            <select
                              value={vehicleFormData.type}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVehicleFormData({ ...vehicleFormData, type: e.target.value })}
                              className="w-full px-4 py-3 rounded-lg border-[0.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              required
                            >
                              <option value="sedan">Sedan</option>
                              <option value="suv">SUV</option>
                              <option value="van">Van</option>
                              <option value="motorcycle">Motorcycle</option>
                            </select>
                          </div>
                          <Input
                            label="Capacity (seats)"
                            name="capacity"
                            type="number"
                            value={vehicleFormData.capacity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, capacity: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-4 mt-6">
                        <Button
                          onClick={handleSaveVehicle}
                          className="bg-primary-500 hover:bg-primary-600"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowVehicleForm(false)
                            setEditingVehicle(null)
                            setError('')
                            setVehicleFiles({ registrationImage: null, insuranceImage: null })
                            setVehicleFormData({
                              make: '',
                              model: '',
                              year: '',
                              color: '',
                              plateNumber: '',
                              type: 'sedan',
                              capacity: '',
                              insuranceExpiry: '',
                            })
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-500">{vehicle.year}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {vehicle.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-gray-900 capitalize">{vehicle.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Color:</span>
                            <span className="text-gray-900">{vehicle.color || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Plate Number:</span>
                            <span className="text-gray-900 font-mono">{vehicle.plateNumber}</span>
                          </div>
                          {vehicle.capacity && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Capacity:</span>
                              <span className="text-gray-900">{vehicle.capacity} seats</span>
                            </div>
                          )}
                          {vehicle.insuranceExpiry && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Insurance Expiry:</span>
                              <span className="text-gray-900">
                                {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        {(vehicle.registrationImage || vehicle.insuranceImage) && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-500 mb-2">Documents:</p>
                            <div className="flex space-x-2">
                              {vehicle.registrationImage && (
                                <button
                                  onClick={() => {
                                    const imageUrl = vehicle.registrationImage.startsWith('data:') 
                                      ? vehicle.registrationImage 
                                      : vehicle.registrationImage.startsWith('http')
                                      ? vehicle.registrationImage
                                      : `data:image/jpeg;base64,${vehicle.registrationImage}`
                                    const isPdf = imageUrl.includes('pdf') || vehicle.registrationImage.includes('pdf')
                                    setViewingDocument({
                                      url: imageUrl,
                                      title: 'Vehicle Registration Document',
                                      type: isPdf ? 'pdf' : 'image'
                                    })
                                  }}
                                  className="text-xs text-primary-500 hover:text-primary-600 flex items-center cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Registration
                                </button>
                              )}
                              {vehicle.insuranceImage && (
                                <button
                                  onClick={() => {
                                    const imageUrl = vehicle.insuranceImage.startsWith('data:') 
                                      ? vehicle.insuranceImage 
                                      : vehicle.insuranceImage.startsWith('http')
                                      ? vehicle.insuranceImage
                                      : `data:image/jpeg;base64,${vehicle.insuranceImage}`
                                    const isPdf = imageUrl.includes('pdf') || vehicle.insuranceImage.includes('pdf')
                                    setViewingDocument({
                                      url: imageUrl,
                                      title: 'Insurance Document',
                                      type: isPdf ? 'pdf' : 'image'
                                    })
                                  }}
                                  className="text-xs text-primary-500 hover:text-primary-600 flex items-center cursor-pointer"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Insurance
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex space-x-2 mt-4">
                          <Button
                            onClick={() => handleEditVehicle(vehicle)}
                            variant="outline"
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No vehicles registered yet.</p>
                    <Button onClick={handleAddVehicle} className="bg-primary-500 hover:bg-primary-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Vehicle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Old Vehicle Modal - Removed */}
        {false && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowVehicleForm(false)
                      setEditingVehicle(null)
                      setError('')
                      setVehicleFiles({ registrationImage: null, insuranceImage: null })
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Vehicle Make"
                      name="make"
                      placeholder="e.g., Toyota"
                      icon={<Car className="w-5 h-5" />}
                      value={vehicleFormData.make}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, make: e.target.value })}
                      required
                    />
                    <Input
                      label="Vehicle Model"
                      name="model"
                      placeholder="e.g., Camry"
                      icon={<Car className="w-5 h-5" />}
                      value={vehicleFormData.model}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                      required
                    />
                    <Input
                      label="Year"
                      name="year"
                      type="number"
                      placeholder="e.g., 2020"
                      value={vehicleFormData.year}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, year: e.target.value })}
                      required
                    />
                    <Input
                      label="License Plate"
                      name="plateNumber"
                      placeholder="License plate number"
                      icon={<FileText className="w-5 h-5" />}
                      value={vehicleFormData.plateNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, plateNumber: e.target.value })}
                      required
                    />
                  </div>

                  {/* Vehicle Registration Document */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Vehicle Registration Document
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        id="vehicleRegistration"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVehicleFileChange('registrationImage', e.target.files?.[0] || null)}
                      />
                      <label htmlFor="vehicleRegistration" className="cursor-pointer">
                        {vehicleFiles.registrationImage || (editingVehicle?.registrationImage) ? (
                          <div className="space-y-2">
                            <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                            <p className="text-sm font-medium text-gray-900">
                              {vehicleFiles.registrationImage?.name || 'Registration document uploaded'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <p className="text-sm font-medium text-gray-700">Upload Registration</p>
                            <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div className="mt-6">
                    <h4 className="text-base font-semibold text-gray-900 mb-4">Insurance Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Insurance Expiry"
                        type="date"
                        name="insuranceExpiry"
                        icon={<Calendar className="w-5 h-5" />}
                        value={vehicleFormData.insuranceExpiry}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, insuranceExpiry: e.target.value })}
                      />
                      <div className="md:col-span-2"></div>
                    </div>
                  </div>

                  {/* Insurance Document */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Insurance Document
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        id="insuranceDocument"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVehicleFileChange('insuranceImage', e.target.files?.[0] || null)}
                      />
                      <label htmlFor="insuranceDocument" className="cursor-pointer">
                        {vehicleFiles.insuranceImage || (editingVehicle?.insuranceImage) ? (
                          <div className="space-y-2">
                            <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                            <p className="text-sm font-medium text-gray-900">
                              {vehicleFiles.insuranceImage?.name || 'Insurance document uploaded'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <p className="text-sm font-medium text-gray-700">Upload Insurance Document</p>
                            <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="mt-6">
                    <h4 className="text-base font-semibold text-gray-900 mb-4">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Color"
                        name="color"
                        value={vehicleFormData.color}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, color: e.target.value })}
                      />
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">
                          Vehicle Type
                        </label>
                        <select
                          value={vehicleFormData.type}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVehicleFormData({ ...vehicleFormData, type: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-[0.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          required
                        >
                          <option value="sedan">Sedan</option>
                          <option value="suv">SUV</option>
                          <option value="van">Van</option>
                          <option value="motorcycle">Motorcycle</option>
                        </select>
                      </div>
                      <Input
                        label="Capacity (seats)"
                        name="capacity"
                        type="number"
                        value={vehicleFormData.capacity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVehicleFormData({ ...vehicleFormData, capacity: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <Button
                    onClick={handleSaveVehicle}
                    className="flex-1 bg-primary-500 hover:bg-primary-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowVehicleForm(false)
                      setEditingVehicle(null)
                      setError('')
                      setVehicleFiles({ registrationImage: null, insuranceImage: null })
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {viewingDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setViewingDocument(null)}>
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{viewingDocument.title}</h3>
                <div className="flex items-center space-x-2">
                  <a
                    href={viewingDocument.url}
                    download
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setViewingDocument(null)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center">
                {viewingDocument.type === 'pdf' ? (
                  <iframe
                    src={viewingDocument.url}
                    className="w-full h-full min-h-[600px] border-0 rounded-lg"
                    title={viewingDocument.title}
                  />
                ) : (
                  <img
                    src={viewingDocument.url}
                    alt={viewingDocument.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {viewingDocument && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" 
            onClick={() => setViewingDocument(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{viewingDocument.title}</h3>
                <div className="flex items-center space-x-2">
                  <a
                    href={viewingDocument.url}
                    download
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setViewingDocument(null)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center">
                {viewingDocument.type === 'pdf' ? (
                  <iframe
                    src={viewingDocument.url}
                    className="w-full h-full min-h-[600px] border-0 rounded-lg"
                    title={viewingDocument.title}
                  />
                ) : (
                  <img
                    src={viewingDocument.url}
                    alt={viewingDocument.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                )}
              </div>
            </div>
          </div>
        )}

      {/* Counter Offer Modal */}
      <Modal
        isOpen={showCounterOfferModal}
        onClose={() => {
          setShowCounterOfferModal(false)
          setRideToCounter(null)
          setCounterOfferAmount(0)
        }}
        title="Counter Offer"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            The passenger proposed: <strong>{formatCurrency(rideToCounter?.proposedFare || 0)}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Counter Offer ($)
            </label>
            <Input
              type="number"
              value={counterOfferAmount}
              onChange={(e) => setCounterOfferAmount(parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
              placeholder="Enter your counter offer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter an amount you're willing to accept for this ride
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCounterOfferModal(false)
                setRideToCounter(null)
                setCounterOfferAmount(0)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCounterOffer}
              disabled={!counterOfferAmount || counterOfferAmount <= 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Submitting...' : 'Submit Counter Offer'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Ride Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false)
          setCancelReason('')
          setRideToCancel(null)
        }}
        title="Cancel Ride"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for cancelling this ride. This information helps us improve our service.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation (minimum 5 characters)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              minLength={5}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 5 characters required
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false)
                setCancelReason('')
                setRideToCancel(null)
              }}
              className="flex-1"
            >
              Keep Ride
            </Button>
            <Button
              variant="primary"
              onClick={handleCancelRide}
              disabled={!cancelReason.trim() || cancelReason.trim().length < 5 || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Ride'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Message Modal */}
      {showMessageModal && messageRideId && messageOtherUserId && messageOtherUserName && currentUser && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false)
            setMessageRideId(null)
            setMessageOtherUserId(null)
            setMessageOtherUserName(null)
          }}
          rideId={messageRideId}
          otherUserId={messageOtherUserId}
          otherUserName={messageOtherUserName}
          currentUserId={currentUser.id}
        />
      )}
      </div>
    </div>
  )
}

