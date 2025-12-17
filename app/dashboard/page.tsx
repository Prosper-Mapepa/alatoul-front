'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'
import { RouteMap } from '@/components/ui/RouteMap'
import { Modal } from '@/components/ui/Modal'
import { LiveTrackingMap } from '@/components/ui/LiveTrackingMap'
import { MessageModal } from '@/components/ui/MessageModal'
import {
  MapPin,
  Clock,
  Star,
  Car,
  Calendar,
  DollarSign,
  Navigation,
  User,
  History,
  Users,
  ArrowRight,
  Phone,
  MessageCircle,
  Eye,
  LogOut,
  CheckCircle,
  X,
  Sparkles,
  Bell,
  AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate, formatTime, calculateDistance, getCurrentLocation } from '@/lib/utils'
import { api, type Ride } from '@/lib/api'
import { WaitingScreen } from '@/components/ui/WaitingScreen'
import Confetti from 'react-confetti'

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'book-ride' | 'schedule-ride' | 'trips' | 'profile'>('book-ride')
  const [myTripsSubTab, setMyTripsSubTab] = useState<'completed' | 'scheduled' | 'cancelled'>('scheduled')
  
  // Book Ride Form State
  const [bookPickup, setBookPickup] = useState('')
  const [bookDestination, setBookDestination] = useState('')
  const [bookPickupPlace, setBookPickupPlace] = useState<any>(null)
  const [bookDestinationPlace, setBookDestinationPlace] = useState<any>(null)
  const [bookFare, setBookFare] = useState(15)
  const [calculatedFare, setCalculatedFare] = useState<{
    baseFare: number
    finalFare: number
    platformFee: number
    driverEarning: number
  } | null>(null)
  const [showProposedFareInput, setShowProposedFareInput] = useState(false)
  const [bookPassengers, setBookPassengers] = useState(1)
  const [rideDistance, setRideDistance] = useState<number | null>(null)
  const [rideDuration, setRideDuration] = useState<number | null>(null)
  const [calculatingFare, setCalculatingFare] = useState(false)
  
  // Schedule Ride Form State
  const [schedulePickup, setSchedulePickup] = useState('')
  const [scheduleDestination, setScheduleDestination] = useState('')
  const [schedulePickupPlace, setSchedulePickupPlace] = useState<any>(null)
  const [scheduleDestinationPlace, setScheduleDestinationPlace] = useState<any>(null)
  const [scheduleFare, setScheduleFare] = useState(15)
  const [schedulePassengers, setSchedulePassengers] = useState(1)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rides, setRides] = useState<Ride[]>([])
  const [userStats, setUserStats] = useState({
    totalRides: 0,
    totalSpent: 0,
    averageRating: 0,
    cancelledRides: 0,
  })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([])
  const [acceptedDrivers, setAcceptedDrivers] = useState<any[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)
  const [requestedRideId, setRequestedRideId] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)
  const [viewingDriverProfile, setViewingDriverProfile] = useState<any>(null)
  const [confirmedRide, setConfirmedRide] = useState<Ride | null>(null)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [passengerLocation, setPassengerLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [kycData, setKycData] = useState<any>(null)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [showCongrats, setShowCongrats] = useState(false)
  const [hasShownCongrats, setHasShownCongrats] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [rideToCancel, setRideToCancel] = useState<string | null>(null)
  const [negotiatingWithDriver, setNegotiatingWithDriver] = useState<any>(null)
  const [counterOfferAmount, setCounterOfferAmount] = useState(0)
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageRideId, setMessageRideId] = useState<string | null>(null)
  const [messageOtherUserId, setMessageOtherUserId] = useState<string | null>(null)
  const [messageOtherUserName, setMessageOtherUserName] = useState<string | null>(null)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messageSocketRef = useRef<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)

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
    // Load user data and check access
    checkAccess()
  }, [])

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

  const checkAccess = async () => {
    try {
      setIsCheckingAccess(true)
      const user = (await api.getCurrentUser()) as any
      setCurrentUser(user)
      
      // Check if user is passenger
      if (user.role !== 'passenger') {
        // Redirect if not passenger
        if (user.role === 'driver') {
          window.location.href = '/driver'
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
        // KYC might not exist yet
        kyc = null
        setKycData(null)
      }

      // Check if user just got verified (show congrats message)
      // Check if user is verified and hasn't seen congrats before (persistent across sessions)
      const isNowVerified = (user.status === 'active' || user.status === 'verified') && kyc && kyc.status === 'approved'
      const congratsKey = `has_seen_congrats_passenger_${user.id}`
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

      // If status is active, user is verified - proceed to dashboard
      if (user.status === 'active') {
        // User is approved, load dashboard data
        loadUserData()
        loadRides()
        loadNotifications()
        setIsCheckingAccess(false)
        return
      }

      // If status is pending or verified but KYC not approved, show waiting screen and poll for updates
      if (user.status === 'pending' || (user.status === 'verified' && kyc && kyc.status !== 'approved')) {
        setIsCheckingAccess(false)
        // Poll for verification status updates every 3 seconds
        const pollInterval = setInterval(async () => {
          try {
            const updatedUser = (await api.getCurrentUser()) as any
            let updatedKyc: any = null
            try {
              updatedKyc = await api.getKYC()
            } catch (err) {
              // KYC might not exist yet
            }
            
            // If user is now active or verified with approved KYC, reload
            if (updatedUser.status === 'active' || 
                (updatedUser.status === 'verified' && updatedKyc && updatedKyc.status === 'approved')) {
              clearInterval(pollInterval)
              window.location.reload()
            }
          } catch (err) {
            console.error('Failed to poll verification status:', err)
          }
        }, 3000)
        
        // Clear polling after 60 seconds to prevent infinite polling
        setTimeout(() => {
          clearInterval(pollInterval)
        }, 60000)
        
        return
      }

      // User is approved, load dashboard data
      loadUserData()
      loadRides()
      loadNotifications()
      setIsCheckingAccess(false)
    } catch (err) {
      console.error('Failed to check access:', err)
      setIsCheckingAccess(false)
    }
  }

  const loadUserData = async () => {
    try {
      const user = await api.getCurrentUser()
      setCurrentUser(user)
      
      // Update profile form with user data
      setProfileFormData({
        name: (user as any)?.name || '',
        email: (user as any)?.email || '',
        phone: (user as any)?.phone || '',
      })
      
      // Calculate stats from rides (called after rides are loaded)
      if (rides.length > 0) {
        const completedRides = rides.filter(r => r.status === 'completed')
        const cancelledRides = rides.filter(r => r.status === 'cancelled')
        const totalSpent = completedRides.reduce((sum, ride) => 
          sum + (parseFloat(String(ride.finalFare || ride.acceptedFare || ride.proposedFare || 0))), 0
        )
        
        setUserStats({
          totalRides: completedRides.length, // Only count completed rides
          totalSpent,
          averageRating: (user as any)?.averageRating || 0,
          cancelledRides: cancelledRides.length,
        })
      }
    } catch (err) {
      console.error('Failed to load user data:', err)
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return
    
    setIsSavingProfile(true)
    setError('')
    setProfileUpdateSuccess(false)

    try {
      await api.updateUser(currentUser.id, {
        name: profileFormData.name,
        phone: profileFormData.phone,
        // Note: Email updates typically require additional verification, so we might skip it
        // email: profileFormData.email,
      })
      
      // Reload user data to reflect changes
      await loadUserData()
      setProfileUpdateSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setProfileUpdateSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const loadRides = async () => {
    try {
      const response = await api.getRides({ role: 'passenger' })
      if (response && response.rides) {
        setRides(response.rides)
        // Update stats after loading rides
        const completedRides = response.rides.filter((r: Ride) => r.status === 'completed')
        const cancelledRides = response.rides.filter((r: Ride) => r.status === 'cancelled')
        const totalSpent = completedRides.reduce((sum: number, ride: Ride) => 
          sum + (parseFloat(String(ride.finalFare || ride.acceptedFare || ride.proposedFare || 0))), 0
        )
        
        // Get user for average rating
        try {
          const user = await api.getCurrentUser()
          setUserStats(prev => ({
            totalRides: completedRides.length, // Only count completed rides
            totalSpent,
            averageRating: (user as any)?.averageRating || 0,
            cancelledRides: cancelledRides.length,
          }))
        } catch (err) {
          setUserStats(prev => ({
            totalRides: completedRides.length,
            totalSpent,
            averageRating: prev.averageRating,
            cancelledRides: cancelledRides.length,
          }))
        }
        
        // Check for active ride and restore tracking if needed
        const activeRide = response.rides.find((ride: Ride) => 
          ride.status === 'accepted' || 
          ride.status === 'driver_assigned' || 
          ride.status === 'driver_arrived' || 
          ride.status === 'in_progress'
        )
        
        if (activeRide && activeRide.driver && typeof activeRide.driver === 'object' && 'id' in activeRide.driver) {
          const driverId = (activeRide.driver as any).id
          setConfirmedRide(activeRide)
          setSelectedDriverId(driverId)
          
          // Check for unread messages
          checkUnreadMessages(activeRide.id, driverId)
          
          // Set pickup and destination places from ride coordinates for map display
          const activeRideAny = activeRide as any
          if (activeRideAny.pickupLatitude && activeRideAny.pickupLongitude) {
            setBookPickupPlace({
              geometry: {
                location: {
                  lat: () => Number(activeRideAny.pickupLatitude),
                  lng: () => Number(activeRideAny.pickupLongitude),
                }
              }
            })
          }
          
          if (activeRideAny.destinationLatitude && activeRideAny.destinationLongitude) {
            setBookDestinationPlace({
              geometry: {
                location: {
                  lat: () => Number(activeRideAny.destinationLatitude),
                  lng: () => Number(activeRideAny.destinationLongitude),
                }
              }
            })
          }
          
          // Start tracking driver location
          startDriverTracking(driverId)
          
          // Check for unread messages
          if (activeRide.driver && typeof activeRide.driver === 'object' && 'id' in activeRide.driver) {
            checkUnreadMessages(activeRide.id, (activeRide.driver as any).id)
          }
        }
      } else {
        setRides([])
      }
    } catch (err: any) {
      console.error('Failed to load rides:', err)
      // Set empty array on error to prevent UI issues
      setRides([])
      // Only show error if it's not a 401/403 (auth errors)
      if (err?.message && !err.message.includes('401') && !err.message.includes('403')) {
        setError('Failed to load rides. Please try again.')
      }
    }
  }

  // Calculate fare when both pickup and destination are set
  useEffect(() => {
    const calculateFareFromLocations = async () => {
      if (
        bookPickupPlace?.geometry?.location &&
        bookDestinationPlace?.geometry?.location
      ) {
        try {
          setCalculatingFare(true)
          const pickupLat = bookPickupPlace.geometry.location.lat()
          const pickupLng = bookPickupPlace.geometry.location.lng()
          const destLat = bookDestinationPlace.geometry.location.lat()
          const destLng = bookDestinationPlace.geometry.location.lng()

          // Calculate distance in miles (convert from km)
          const distanceKm = calculateDistance(pickupLat, pickupLng, destLat, destLng)
          const distanceMiles = distanceKm * 0.621371 // Convert km to miles
          setRideDistance(distanceMiles)

          // Estimate duration (rough estimate: 30 mph average)
          const estimatedDurationMinutes = (distanceMiles / 30) * 60
          setRideDuration(Math.round(estimatedDurationMinutes))

          // Calculate fare using API
          const fareData = await api.calculateFare(distanceMiles, estimatedDurationMinutes) as {
            baseFare: number
            finalFare: number
            platformFee: number
            driverEarning: number
          }
          setCalculatedFare(fareData)
          
          // Set initial proposed fare to calculated fare
          setBookFare(fareData.finalFare)
          setShowProposedFareInput(false)
        } catch (err) {
          console.error('Failed to calculate fare:', err)
        } finally {
          setCalculatingFare(false)
        }
      } else {
        setCalculatedFare(null)
        setRideDistance(null)
        setRideDuration(null)
      }
    }

    calculateFareFromLocations()
  }, [bookPickupPlace, bookDestinationPlace])

  const loadAvailableDrivers = async () => {
    setLoadingDrivers(true)
    try {
      // Get online drivers
      const drivers: any = await api.getUsers({
        role: 'driver',
      })
      
      // Filter to get only online drivers
      const driversArray = Array.isArray(drivers) 
        ? drivers 
        : ((drivers as any)?.users || (drivers as any)?.data || [])
      const onlineDrivers = driversArray.filter((driver: any) => driver.isOnline === true)
      
      // If we have pickup location, filter drivers by proximity and calculate fare for each
      if (bookPickupPlace?.geometry?.location && calculatedFare) {
        const pickupLat = bookPickupPlace.geometry.location.lat()
        const pickupLng = bookPickupPlace.geometry.location.lng()
        const MAX_DISTANCE_KM = 10 // Maximum distance in kilometers (10km radius)
        
        const nearbyDrivers = onlineDrivers
          .map((driver: any) => {
            // Check if driver has location data
            if (driver.latitude && driver.longitude) {
              const distance = calculateDistance(
                pickupLat,
                pickupLng,
                driver.latitude,
                driver.longitude
              )
              return { ...driver, distance, calculatedFare }
            }
            // If driver doesn't have location, include them but mark as unknown distance
            return { ...driver, distance: null, calculatedFare }
          })
          .filter((driver: any) => {
            // Filter by distance (null distance drivers are included)
            return driver.distance === null || driver.distance <= MAX_DISTANCE_KM
          })
          .sort((a: any, b: any) => {
            // Sort by distance (closest first)
            if (a.distance === null && b.distance === null) return 0
            if (a.distance === null) return 1
            if (b.distance === null) return -1
            return a.distance - b.distance
          })
        
        setAvailableDrivers(nearbyDrivers)
      } else {
        setAvailableDrivers(onlineDrivers || [])
      }
    } catch (err: any) {
      console.error('Failed to load available drivers:', err)
      setAvailableDrivers([])
    } finally {
      setLoadingDrivers(false)
    }
  }

  // Real-time polling for driver acceptances
  const startPollingForAcceptances = (rideId: string) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    setIsPolling(true)
    
    // Initial check
    checkRideAcceptances(rideId)
    loadAvailableDrivers()
    
    // Start polling every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        await checkRideAcceptances(rideId)
        await loadAvailableDrivers()
        
        // Stop polling if ride is confirmed or cancelled
        const ride = await api.getRide(rideId)
        if (ride && typeof ride === 'object') {
          const status = (ride as any).status
          if (status === 'driver_assigned' || status === 'cancelled' || status === 'in_progress' || status === 'completed') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            setIsPolling(false)
          }
        }
      } catch (err) {
        console.error('Error polling for acceptances:', err)
      }
    }, 3000) // Poll every 3 seconds
    
    // Stop polling after 10 minutes
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      setIsPolling(false)
    }, 600000)
  }
  
  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
        trackingIntervalRef.current = null
      }
    }
  }, [])

  const checkRideAcceptances = async (rideId: string) => {
    try {
      // Get the ride details to check if any driver has accepted
      const ride: any = await api.getRide(rideId)
      
      if (ride && ride.status === 'accepted' && ride.driver) {
        // A driver has accepted this ride
        const fareValue = ride.acceptedFare || ride.proposedFare
        const acceptedDriver = {
          ...ride.driver,
          rideId: ride.id,
          acceptedFare: typeof fareValue === 'number' ? fareValue : parseFloat(String(fareValue || 0)),
          acceptedAt: ride.updatedAt || ride.createdAt,
        }
        
        // Check if this driver is already in the list
        setAcceptedDrivers((prev) => {
          const exists = prev.some((d: any) => d.id === acceptedDriver.id)
          if (!exists) {
            return [acceptedDriver]
          }
          return prev
        })
      } else if (ride && ride.status === 'driver_assigned') {
        // Driver has been confirmed, stop polling
        setIsPolling(false)
      } else {
        // No driver has accepted yet
        setAcceptedDrivers([])
      }
      
      // Also refresh available drivers list to show current online drivers
      await loadAvailableDrivers()
    } catch (err) {
      console.error('Error checking ride acceptances:', err)
    }
  }

  const handleSelectDriver = async (driverId: string, rideId: string, acceptedFare: number | string | undefined) => {
    setIsLoading(true)
    setError('')
    
    try {
      // Ensure acceptedFare is a valid number
      const fareValue = typeof acceptedFare === 'number' 
        ? acceptedFare 
        : (typeof acceptedFare === 'string' ? parseFloat(acceptedFare) : 0)
      
      if (isNaN(fareValue) || fareValue <= 0) {
        setError('Invalid fare amount. Please try again.')
        setIsLoading(false)
        return
      }
      
      // Confirm the selected driver by updating the ride
      await api.updateRide(rideId, {
        status: 'driver_assigned',
        driverId: driverId,
        acceptedFare: fareValue,
      })
      
      setSelectedDriverId(driverId)
      
      // Get the confirmed ride with driver details
      const updatedRide = await api.getRide(rideId)
      
      // Store confirmed ride for tracking
      if (updatedRide && typeof updatedRide === 'object') {
        setConfirmedRide(updatedRide as Ride)
        
        // Start tracking driver location
        startDriverTracking(driverId)
      }
      
      // Clear accepted drivers list and stop polling
      setAcceptedDrivers([])
      setIsPolling(false)
      
      // Reload rides
      await loadRides()
      
      // Show success message
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to confirm driver. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndRide = async () => {
    if (!confirmedRide) return

    if (!confirm('Are you sure you want to end this ride?')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.endRide(confirmedRide.id)
      
      // Reload rides to get updated status
      await loadRides()
      
      // Clear tracking
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
        trackingIntervalRef.current = null
      }
    } catch (err: any) {
      setError(err.message || 'Failed to end ride. Please try again.')
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
      
      // Refresh notifications to show cancellation notification
      await loadNotifications()
      
      // Clear all ride-related states
      setConfirmedRide(null)
      setSelectedDriverId(null)
      setRequestedRideId(null)
      setAcceptedDrivers([])
      setDriverLocation(null)
      setPassengerLocation(null)
      
      // Reset booking form
      setBookPickup('')
      setBookDestination('')
      setBookPickupPlace(null)
      setBookDestinationPlace(null)
      setBookFare(15) // Reset to default
      setBookPassengers(1)
      
      // Reset fare calculation
      setCalculatedFare(null)
      setRideDistance(null)
      setRideDuration(null)
      setShowProposedFareInput(false)
      
      // Close modal and clear cancel state
      setShowCancelModal(false)
      setCancelReason('')
      setRideToCancel(null)

      // Stop polling and tracking
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
        trackingIntervalRef.current = null
      }
      setIsPolling(false)

      // Reload rides
      await loadRides()
      
      // Clear available drivers
      setAvailableDrivers([])
    } catch (err: any) {
      setError(err.message || 'Failed to cancel ride. Please try again.')
    } finally {
      setIsLoading(false)
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

  // Set up message socket listener for unread messages
  useEffect(() => {
    if (!confirmedRide || !confirmedRide.driver || !currentUser) return

    const token = localStorage.getItem('token')
    if (!token) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'
    const { io } = require('socket.io-client')
    const socket = io(`${socketUrl}/messages`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      socket.emit('join_ride_room', { rideId: confirmedRide.id })
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
        socket.emit('leave_ride_room', { rideId: confirmedRide.id })
        socket.disconnect()
      }
    }
  }, [confirmedRide?.id, currentUser?.id])

  // Check unread messages when confirmed ride changes
  useEffect(() => {
    if (confirmedRide && confirmedRide.driver && currentUser) {
      const driver = confirmedRide.driver as any
      if (driver.id) {
        checkUnreadMessages(confirmedRide.id, driver.id)
      }
    }
  }, [confirmedRide?.id])

  const startDriverTracking = (driverId: string) => {
    // Clear any existing tracking
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current)
      trackingIntervalRef.current = null
    }
    
    // Get initial passenger location
    getCurrentLocation()
      .then((location) => {
        setPassengerLocation(location)
      })
      .catch((err) => {
        console.error('Error getting passenger location:', err)
      })
    
    // Start tracking both driver and passenger locations every 5 seconds
    trackingIntervalRef.current = setInterval(async () => {
      try {
        // Track driver location
        const driver = await api.getUser(driverId)
        if (driver && (driver as any).latitude && (driver as any).longitude) {
          setDriverLocation({
            lat: parseFloat(String((driver as any).latitude)),
            lng: parseFloat(String((driver as any).longitude)),
          })
        }
        
        // Track passenger location
        try {
          const location = await getCurrentLocation()
          setPassengerLocation(location)
        } catch (err) {
          console.error('Error getting passenger location:', err)
        }
      } catch (err) {
        console.error('Error tracking driver location:', err)
      }
    }, 5000) // Update every 5 seconds
  }

  const handleBookRide = async () => {
    if (!bookPickup || !bookDestination) {
      setError('Please fill in pickup and destination locations')
      return
    }

    if (!calculatedFare) {
      setError('Please wait for fare calculation to complete')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const rideData: any = {
        pickupLocation: bookPickup,
        destination: bookDestination,
        proposedFare: bookFare,
        type: 'now',
        passengers: bookPassengers,
      }

      // Only include location data if available
      if (bookPickupPlace?.geometry?.location) {
        rideData.pickupLatitude = bookPickupPlace.geometry.location.lat()
        rideData.pickupLongitude = bookPickupPlace.geometry.location.lng()
      }

      if (bookDestinationPlace?.geometry?.location) {
        rideData.destinationLatitude = bookDestinationPlace.geometry.location.lat()
        rideData.destinationLongitude = bookDestinationPlace.geometry.location.lng()
      }

      const rideResponse = await api.createRide(rideData)

      // Store ride ID for reference
      let rideId = null
      if (rideResponse && typeof rideResponse === 'object' && 'id' in rideResponse) {
        rideId = rideResponse.id as string
        setRequestedRideId(rideId)
      } else if (typeof rideResponse === 'object' && rideResponse) {
        // Try to get ID from response
        rideId = (rideResponse as any).id || (rideResponse as any).ride?.id
        if (rideId) setRequestedRideId(rideId)
      }

      // Reload rides (for trips tab later)
      await loadRides()
      
      // Load available drivers after ride is created
      await loadAvailableDrivers()
      
      // Start real-time polling for driver acceptances
      if (rideId) {
        startPollingForAcceptances(rideId)
      }
      
      // Explicitly ensure we stay on book-ride tab to show available drivers
      setActiveTab('book-ride')
    } catch (err: any) {
      setError(err.message || 'Failed to book ride. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleScheduleRide = async () => {
    if (!schedulePickup || !scheduleDestination || !scheduleDate || !scheduleTime) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.createRide({
        pickupLocation: schedulePickup,
        destination: scheduleDestination,
        proposedFare: scheduleFare,
        type: 'scheduled',
        passengers: schedulePassengers,
        scheduledDate: scheduleDate,
        scheduledTime: scheduleTime,
        pickupLatitude: schedulePickupPlace?.geometry?.location?.lat(),
        pickupLongitude: schedulePickupPlace?.geometry?.location?.lng(),
        destinationLatitude: scheduleDestinationPlace?.geometry?.location?.lat(),
        destinationLongitude: scheduleDestinationPlace?.geometry?.location?.lng(),
      })

      // Reset form
      setSchedulePickup('')
      setScheduleDestination('')
      setSchedulePickupPlace(null)
      setScheduleDestinationPlace(null)
      setScheduleFare(15)
      setSchedulePassengers(1)
      setScheduleDate('')
      setScheduleTime('')
      
      // Reload rides and switch to trips tab
      await loadRides()
      await loadUserData()
      setActiveTab('trips')
    } catch (err: any) {
      setError(err.message || 'Failed to schedule ride. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate real data from rides
  const upcomingTrips = rides.filter(
    ride => ride.type === 'scheduled' && (ride.status === 'pending' || ride.status === 'accepted')
  ).map(ride => ({
    id: ride.id,
    date: ride.scheduledDate ? new Date(ride.scheduledDate) : new Date(ride.createdAt),
    pickup: ride.pickupLocation,
    destination: ride.destination,
    fare: ride.acceptedFare || ride.proposedFare,
    driver: ride.driver ? { 
      name: ride.driver.name || 'Driver', 
      rating: ride.driver.averageRating || 0,
      avatar: ride.driver.avatar 
    } : null,
    status: ride.status,
  }))

  const recentTrips = rides
    .filter(ride => ride.status === 'completed')
    .slice(0, 10)
    .map(ride => ({
      id: ride.id,
      date: new Date(ride.createdAt),
      pickup: ride.pickupLocation,
      destination: ride.destination,
      fare: ride.finalFare || ride.acceptedFare || ride.proposedFare,
      driver: ride.driver ? { 
        name: ride.driver.name || 'Driver', 
        rating: ride.driver.averageRating || 0,
        avatar: ride.driver.avatar 
      } : null,
      status: ride.status,
    }))

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
          userRole="passenger"
          status="suspended"
          kycStatus={kycData?.status}
          rejectionReason={kycData?.rejectionReason}
        />
      )
    }
    // Show waiting screen if pending or verified but KYC not approved
    // Note: active status means verified, so we don't show waiting screen for active users
    if (currentUser.status === 'pending' || 
        (currentUser.status === 'verified' && kycData && kycData.status !== 'approved')) {
      return (
        <WaitingScreen
          userRole="passenger"
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
                    Your account has been verified! You can now book rides and enjoy all the features of Alatoul.
                  </p>

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowCongrats(false)}
                    className="w-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Get Started
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
              Passenger<span className="text-primary-600">.</span>
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
                        onClick={() => {
                          router.push('/dashboard')
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
            Manage your rides and profile
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 sm:mb-10 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-gray-100">
          <div className="flex space-x-2 min-w-max relative">
            {[
              { id: 'book-ride', label: 'Book a Ride', shortLabel: 'Book', icon: Navigation },
              { id: 'schedule-ride', label: 'Schedule Ride', shortLabel: 'Schedule', icon: Calendar },
              { id: 'trips', label: 'My Trips', shortLabel: 'Trips', icon: History },
              { id: 'profile', label: 'My Profile', shortLabel: 'Profile', icon: User },
              { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: Car },
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group shadow-lg border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-primary-50/30">
                <CardContent className="p-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-600 mb-2">Total Rides</p>
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">{userStats.totalRides}</p>
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
                      <p className="text-base font-semibold text-gray-600 mb-2">Total Spent</p>
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {formatCurrency(userStats.totalSpent)}
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
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:text-yellow-600 transition-colors">
                        {typeof userStats.averageRating === 'number' ? userStats.averageRating.toFixed(1) : '0.0'}
                      </p>
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
                      <p className="text-3xl font-extrabold text-gray-900 group-hover:text-red-600 transition-colors">{userStats.cancelledRides}</p>
                    </div>
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <X className="w-7 h-7 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Book Ride Tab */}
        {activeTab === 'book-ride' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Booking Card */}
              <div className="lg:col-span-1">
                <Card className="border border-gray-200 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Book a Ride Now</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Set your destination and propose your fare</p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <AddressAutocomplete
                        label="Pickup Location"
                        placeholder="Enter pickup address"
                        value={bookPickup}
                        onChange={setBookPickup}
                        onPlaceSelected={(place) => setBookPickupPlace(place)}
                        required
                      />
                    </div>
                    
                    <div>
                      <AddressAutocomplete
                        label="Destination"
                        placeholder="Where are you going?"
                        value={bookDestination}
                        onChange={setBookDestination}
                        onPlaceSelected={(place) => setBookDestinationPlace(place)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Passengers
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setBookPassengers(Math.max(1, bookPassengers - 1))}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-primary-500 transition-all font-semibold text-gray-700"
                          >
                            -
                          </button>
                          <span className="text-lg font-bold w-12 text-center text-gray-900">{bookPassengers}</span>
                          <button
                            type="button"
                            onClick={() => setBookPassengers(Math.min(8, bookPassengers + 1))}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-primary-500 transition-all font-semibold text-gray-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      {/* Calculated Fare Display */}
                      {calculatedFare && (
                        <div className="col-span-2">
                          <div className="p-5 bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100/50 border-2 border-primary-200 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-base font-bold text-gray-900">
                                Calculated Fare
                              </p>
                              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">$</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-primary-200/50">
                                <p className="text-xs font-medium text-primary-700 mb-1">Base Fare</p>
                                <p className="text-xl font-bold text-gray-900">
                                  ${calculatedFare.baseFare.toFixed(2)}
                                </p>
                              </div>
                              <div className="bg-primary-500/10 backdrop-blur-sm rounded-lg p-3 border-2 border-primary-400">
                                <p className="text-xs font-medium text-primary-800 mb-1">Final Fare</p>
                                <p className="text-xl font-bold text-primary-700">
                                  ${calculatedFare.finalFare.toFixed(2)}
                                </p>
                              </div>
                              {rideDistance && (
                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-primary-200/50">
                                  <p className="text-xs font-medium text-primary-700 mb-1">Distance</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {rideDistance.toFixed(2)} miles
                                  </p>
                                </div>
                              )}
                              {rideDuration && (
                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-primary-200/50">
                                  <p className="text-xs font-medium text-primary-700 mb-1">Est. Duration</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {Math.round(rideDuration)} min
                                  </p>
                                </div>
                              )}
                            </div>
                            {!showProposedFareInput && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowProposedFareInput(true)}
                                className="w-full border-2 border-primary-400 text-primary-700 font-semibold hover:bg-primary-50 hover:border-primary-500 transition-all"
                              >
                                Propose Different Fare
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Proposed Fare Input (shown after clicking "Propose Different Fare") */}
                      {showProposedFareInput && calculatedFare && (
                        <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Your Proposed Fare
                        </label>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                          <Input
                            type="number"
                            value={bookFare}
                            onChange={(e) => setBookFare(Number(e.target.value))}
                                className="text-base font-bold pl-8 border-2 border-primary-300 focus:border-primary-500 focus:ring-primary-200"
                                min={0}
                                step="0.01"
                          />
                        </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setBookFare(calculatedFare.finalFare)
                                setShowProposedFareInput(false)
                              }}
                              className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                            >
                              Reset
                            </Button>
                      </div>
                          <div className="mt-2 flex items-center justify-between px-2">
                            <p className="text-xs text-gray-500">
                              Calculated fare: <span className="font-semibold text-primary-600">${calculatedFare.finalFare.toFixed(2)}</span>
                            </p>
                            {bookFare < calculatedFare.finalFare && (
                              <p className="text-xs text-amber-600 font-medium">
                                Your proposal is ${(calculatedFare.finalFare - bookFare).toFixed(2)} lower
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {calculatingFare && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Calculating fare...</p>
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="w-full font-semibold border border-primary-500"
                      onClick={handleBookRide}
                      disabled={!bookPickup || !bookDestination || isLoading || !calculatedFare || calculatingFare}
                      isLoading={isLoading}
                    >
                      {isLoading ? 'Requesting Ride...' : 'Request Ride & See Offers'}
                      {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Accepted Drivers, Available Drivers, Map below */}
              <div className="lg:col-span-2 space-y-6">
                {/* Accepted Drivers - Show immediately after ride request, hide after driver is selected */}
                {requestedRideId && !confirmedRide && (
                  <Card className="border border-[#C1F11D] shadow-lg bg-[#C1F11D]/5">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-900">Drivers Who Accepted</CardTitle>
                        {isPolling && (
                          <div className="flex items-center space-x-2 text-sm  font-semibold">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C1F11D]"></div>
                            <span>Live search...</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {acceptedDrivers.length > 0 ? (
                        <div className="space-y-4">
                          {acceptedDrivers.map((driver: any) => (
                            <div
                              key={driver.id}
                              className="p-4 sm:p-5 border border-[#C1F11D] rounded-xl bg-white shadow-md"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#C1F11D] to-[#A8D919] rounded-full flex items-center justify-center shadow-md shrink-0">
                                    <Car className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                                      {driver.name || driver.email?.split('@')[0] || 'Driver'}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                      <p className="text-xs sm:text-sm text-gray-600">
                                        {typeof driver.averageRating === 'number' ? driver.averageRating.toFixed(1) : 'New'}
                                        {driver.totalRides && (
                                          <span className="hidden sm:inline"> • {driver.totalRides}+ rides</span>
                                        )}
                                        {typeof driver.distance === 'number' && !isNaN(driver.distance) && (
                                          <span> • {driver.distance.toFixed(1)} km away</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-4 pt-4 border-t border-gray-100">
                                <span className="text-sm sm:text-base font-semibold text-gray-700">
                                  {driver.hasCountered ? 'Counter Offer:' : 'Accepted Fare:'}
                                </span>
                                <div className="text-left sm:text-right">
                                  <span className="text-lg sm:text-xl font-bold text-green-800">
                                    {formatCurrency(driver.acceptedFare || driver.proposedFare)}
                                  </span>
                                  {driver.hasCountered && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Your proposed: {formatCurrency(bookFare)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-4">
                                {driver.hasCountered ? (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="md" 
                                      className="flex-1 font-semibold border border-red-300 text-red-600 hover:bg-red-50 text-sm sm:text-base"
                                      onClick={() => {
                                        setRideToCancel(driver.rideId || requestedRideId || '')
                                        setShowCancelModal(true)
                                      }}
                                    >
                                      <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                      Decline
                                    </Button>
                                    <Button 
                                      variant="primary" 
                                      size="md" 
                                      className="flex-1 font-semibold bg-[#C1F11D] hover:bg-[#A8D919] text-gray-900 border-2 border-[#C1F11D] text-sm sm:text-base"
                                      onClick={() => handleSelectDriver(driver.id, driver.rideId || requestedRideId || '', driver.acceptedFare || driver.proposedFare)}
                                      disabled={isLoading || selectedDriverId === driver.id}
                                    >
                                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                      Accept Counter
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="md" 
                                      className="flex-1 font-semibold border border-gray-300 text-sm sm:text-base"
                                      onClick={() => setViewingDriverProfile(driver)}
                                    >
                                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                      View Profile
                                    </Button>
                                    <Button 
                                      variant="primary" 
                                      size="md" 
                                      className="flex-1 font-semibold bg-[#C1F11D] hover:bg-[#A8D919] text-gray-900 border-2 border-[#C1F11D] text-sm sm:text-base"
                                      onClick={() => handleSelectDriver(driver.id, driver.rideId || requestedRideId || '', driver.acceptedFare || driver.proposedFare)}
                                      disabled={isLoading || selectedDriverId === driver.id}
                                    >
                                      {selectedDriverId === driver.id ? 'Confirmed ✓' : 'Select This Driver'}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="relative mb-6">
                            {/* <Car className="w-16 h-16 text-gray-300" /> */}
                            {isPolling && (
                              <div className="absolute -top-2 -right-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C1F11D]"></div>
                              </div>
                            )}
                          </div>
                          <p className="text-lg font-semibold text-gray-700 mb-2">
                            {isPolling ? 'Searching for drivers...' : 'Waiting for drivers to accept'}
                          </p>
                          <p className="text-sm text-gray-600 text-center max-w-md">
                            {isPolling 
                              ? "We're searching for nearby drivers. Accepted offers will appear here in real-time."
                              : "Drivers who accept your ride request will appear here. Please wait..."}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Live Tracking - Show after driver is selected */}
                {confirmedRide && selectedDriverId && bookPickupPlace && bookDestinationPlace && (
                  <Card className="border-2 border-[#C1F11D] shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-900">Ride in Progress</CardTitle>
                        {confirmedRide.driver && (confirmedRide.status === 'accepted' || confirmedRide.status === 'driver_assigned' || confirmedRide.status === 'driver_arrived' || confirmedRide.status === 'in_progress') && (
                          <button
                            onClick={() => {
                              const driver = confirmedRide.driver as any
                              setMessageRideId(confirmedRide.id)
                              setMessageOtherUserId(driver.id)
                              setMessageOtherUserName(driver.name || 'Driver')
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
                    <CardContent className="space-y-6">
                      {/* Ride Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-start space-x-3 mb-4">
                            <MapPin className="w-5 h-5 text-[#C1F11D] mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Pickup</p>
                              <p className="font-semibold text-gray-900">{confirmedRide.pickupLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Navigation className="w-5 h-5 text-[#C1F11D] mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Destination</p>
                              <p className="font-semibold text-gray-900">{confirmedRide.destination}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">Fare</p>
                            <p className="text-2xl font-bold text-[#C1F11D]">
                              {formatCurrency(confirmedRide.acceptedFare || confirmedRide.proposedFare)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Driver</p>
                            <p className="font-semibold text-gray-900">
                              {(confirmedRide.driver as any)?.name || 'Loading...'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Live Tracking Map */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Live Tracking</h3>
                        <LiveTrackingMap
                          pickupLocation={{
                            lat: bookPickupPlace.geometry.location.lat(),
                            lng: bookPickupPlace.geometry.location.lng(),
                          }}
                          destinationLocation={{
                            lat: bookDestinationPlace.geometry.location.lat(),
                            lng: bookDestinationPlace.geometry.location.lng(),
                          }}
                          driverLocation={driverLocation}
                          passengerLocation={passengerLocation}
                          className="w-full"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        {confirmedRide.driver && (confirmedRide.status === 'accepted' || confirmedRide.status === 'driver_assigned' || confirmedRide.status === 'driver_arrived' || confirmedRide.status === 'in_progress') && (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              const driver = confirmedRide.driver as any
                              setMessageRideId(confirmedRide.id)
                              setMessageOtherUserId(driver.id)
                              setMessageOtherUserName(driver.name || 'Driver')
                              setShowMessageModal(true)
                            }}
                            className="flex-1 border-primary-500 text-primary-600 hover:bg-primary-50"
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Message Driver
                          </Button>
                        )}
                        {(confirmedRide.status === 'in_progress' || confirmedRide.status === 'accepted') && (
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
                        {confirmedRide.status !== 'completed' && confirmedRide.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                              setRideToCancel(confirmedRide.id)
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
                    </CardContent>
                  </Card>
                )}

                {/* Map - Show when both locations are selected */}
                {!confirmedRide && bookPickupPlace && bookDestinationPlace && (
                  <Card className="border border-gray-200 shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900">Route Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RouteMap
                        pickupPlace={bookPickupPlace}
                        destinationPlace={bookDestinationPlace}
                        className="w-full"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Ride Tab */}
        {activeTab === 'schedule-ride' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Booking Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Schedule a Ride</CardTitle>
                  <p className="text-base text-gray-600 mt-1">Plan your trip in advance</p>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div>
                    <AddressAutocomplete
                      label="Pickup Location"
                      placeholder="Enter pickup address"
                      value={schedulePickup}
                      onChange={setSchedulePickup}
                      onPlaceSelected={(place) => setSchedulePickupPlace(place)}
                      required
                    />
                  </div>
                  
                  <div>
                    <AddressAutocomplete
                      label="Destination"
                      placeholder="Where are you going?"
                      value={scheduleDestination}
                      onChange={setScheduleDestination}
                      onPlaceSelected={(place) => setScheduleDestinationPlace(place)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    <Input
                      label="Time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-3">
                      Number of Passengers
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setSchedulePassengers(Math.max(1, schedulePassengers - 1))}
                        className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-primary-500 transition-all font-semibold text-gray-700"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold w-16 text-center text-gray-900">{schedulePassengers}</span>
                      <button
                        onClick={() => setSchedulePassengers(Math.min(8, schedulePassengers + 1))}
                        className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-primary-500 transition-all font-semibold text-gray-700"
                      >
                        +
                      </button>
                      <Users className="w-6 h-6 text-primary-500 ml-4" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-base font-semibold text-gray-900 mb-3">
                      Your Proposed Fare
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={scheduleFare}
                          onChange={(e) => setScheduleFare(Number(e.target.value))}
                          className="text-2xl font-bold"
                        />
                      </div>
                      <span className="text-xl font-bold text-gray-700">USD</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Drivers can accept, reject, or counter your offer
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Estimated Distance</span>
                      <span className="text-sm font-bold text-gray-900">~12.5 miles</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Estimated Time</span>
                      <span className="text-sm font-bold text-gray-900">~25 minutes</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-primary-200">
                      <span className="text-sm font-semibold text-gray-700">Suggested Fare Range</span>
                      <span className="text-sm font-bold text-primary-600">$12 - $18</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full font-semibold border border-primary-500"
                    onClick={handleScheduleRide}
                    disabled={!schedulePickup || !scheduleDestination || !scheduleDate || !scheduleTime}
                  >
                    Schedule Ride
                    <Calendar className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Available Drivers */}
            <div className="space-y-6">
              <Card className="border border-gray-200 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">Available Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center py-8">
                      After you schedule a ride, available drivers will appear here with their counter offers.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Features */}
              <Card className="bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-5">Safety Features</h3>
                  <ul className="space-y-3 text-base text-gray-700">
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-primary-500 rounded-full mr-3"></span>
                      Verified drivers
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-primary-500 rounded-full mr-3"></span>
                      Real-time tracking
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-primary-500 rounded-full mr-3"></span>
                      In-app emergency button
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-primary-500 rounded-full mr-3"></span>
                      Trip sharing
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === 'trips' && (
          <Card className="border border-gray-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">My Trips</CardTitle>
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
                      onClick={() => setMyTripsSubTab(tab.id as 'completed' | 'scheduled' | 'cancelled')}
                      className={`flex items-center space-x-2 px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold transition-all duration-300 relative shrink-0 rounded-t-lg ${
                        myTripsSubTab === tab.id
                          ? 'text-gray-900 bg-primary-500 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${myTripsSubTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`} />
                      <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
                      <span className="sm:hidden whitespace-nowrap">{tab.shortLabel}</span>
                      {myTripsSubTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Completed Rides Content */}
              {myTripsSubTab === 'completed' && (
                <div className="space-y-4">
                  {rides.filter(r => r.status === 'completed').length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-xl bg-gray-50">
                      <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No completed rides yet.</p>
                      <Button 
                        variant="primary" 
                        onClick={() => setActiveTab('book-ride')}
                        className="mt-4 font-semibold border border-primary-500"
                      >
                        Book Your First Ride
                      </Button>
                    </div>
                  ) : (
                    rides
                      .filter(r => r.status === 'completed')
                      .sort((a, b) => new Date((a as any).completedAt || a.createdAt).getTime() - new Date((b as any).completedAt || b.createdAt).getTime())
                      .reverse() // Show newest first
                      .map((ride) => (
                        <div
                          key={ride.id}
                          className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 border border-gray-200 rounded-2xl hover:border-primary-500 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-white hover:to-primary-50/30 hover:-translate-y-0.5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <span className="text-sm sm:text-base font-semibold text-gray-700 bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                                {formatDate((ride as any).completedAt || ride.createdAt)}
                              </span>
                              {ride.driver && (
                                <div className="flex items-center bg-yellow-50 px-2 sm:px-3 py-1 rounded-full">
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                  <span className="text-sm sm:text-base font-semibold text-gray-700 ml-1">
                                    {(ride.driver as any).averageRating || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm sm:text-base text-gray-800 font-semibold break-words">
                              <span className="block sm:inline">{ride.pickupLocation}</span>
                              <span className="hidden sm:inline"> → </span>
                              <span className="block sm:inline mt-1 sm:mt-0">{ride.destination}</span>
                            </div>
                            {ride.driver && (
                              <div className="text-xs sm:text-sm text-gray-600 mt-2">
                                Driver: {(ride.driver as any).name || 'Unknown'}
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

              {/* Scheduled Rides Content */}
              {myTripsSubTab === 'scheduled' && (
                <div className="space-y-4">
                  {rides.filter(r => r.type === 'scheduled' || (r.status === 'pending' && (r as any).scheduledDate)).length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-xl bg-gray-50">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No scheduled rides yet.</p>
                      <Button 
                        variant="primary" 
                        onClick={() => setActiveTab('schedule-ride')}
                        className="mt-4 font-semibold border border-primary-500"
                      >
                        Schedule a Ride
                      </Button>
                    </div>
                  ) : (
                    rides
                      .filter(r => r.type === 'scheduled' || (r.status === 'pending' && (r as any).scheduledDate))
                      .sort((a, b) => {
                        const dateA = (a as any).scheduledDate ? new Date((a as any).scheduledDate).getTime() : new Date(a.createdAt).getTime()
                        const dateB = (b as any).scheduledDate ? new Date((b as any).scheduledDate).getTime() : new Date(b.createdAt).getTime()
                        return dateB - dateA // Show newest first
                      })
                      .map((ride) => (
                        <div
                          key={ride.id}
                          className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 border border-primary-200 rounded-2xl hover:border-primary-400 hover:shadow-xl transition-all duration-300 bg-white hover:bg-gradient-to-r hover:from-white hover:to-primary-50/30 hover:-translate-y-0.5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              {(ride as any).scheduledDate && (
                                <span className="text-sm sm:text-base font-semibold text-gray-700 bg-primary-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                                  {formatDate((ride as any).scheduledDate)} at {formatTime((ride as any).scheduledDate)}
                                </span>
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

              {/* Cancelled Rides Content */}
              {myTripsSubTab === 'cancelled' && (
                <div className="space-y-4">
                  {rides.filter(r => r.status === 'cancelled').length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-xl bg-gray-50">
                      <X className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No cancelled rides yet.</p>
                    </div>
                  ) : (
                    rides
                      .filter(r => r.status === 'cancelled')
                      .sort((a, b) => new Date((a as any).cancelledAt || (a as any).updatedAt || a.createdAt).getTime() - new Date((b as any).cancelledAt || (b as any).updatedAt || b.createdAt).getTime())
                      .reverse() // Show newest first
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                {profileUpdateSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    Profile updated successfully!
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    type="text"
                    value={profileFormData.name}
                    onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                    className="w-full"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={profileFormData.email}
                    disabled
                    className="w-full bg-gray-50"
                    placeholder="Email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if you need to update your email.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={profileFormData.phone}
                    onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                    className="w-full"
                    placeholder="Enter your phone number"
                  />
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || !profileFormData.name.trim()}
                  isLoading={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Driver Profile Modal */}
      {viewingDriverProfile && (
        <Modal
          isOpen={!!viewingDriverProfile}
          onClose={() => setViewingDriverProfile(null)}
          title="Driver Profile"
          size="lg"
        >
          <div className="space-y-6">
            {/* Driver Info */}
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C1F11D] to-[#A8D919] rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-900" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {viewingDriverProfile.name || viewingDriverProfile.email?.split('@')[0] || 'Driver'}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {typeof viewingDriverProfile.averageRating === 'number' 
                      ? viewingDriverProfile.averageRating.toFixed(1) 
                      : 'New'}
                    {viewingDriverProfile.totalRides ? ` • ${viewingDriverProfile.totalRides}+ rides` : ''}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-base text-gray-900">
                  {viewingDriverProfile.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-base text-gray-900">
                  {viewingDriverProfile.email || 'Not provided'}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#C1F11D]">
                  {viewingDriverProfile.totalRides || 0}
                </p>
                <p className="text-sm text-gray-600">Total Rides</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#C1F11D]">
                  {typeof viewingDriverProfile.averageRating === 'number' 
                    ? viewingDriverProfile.averageRating.toFixed(1) 
                    : '0.0'}
                </p>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#C1F11D]">
                  {viewingDriverProfile.distance && typeof viewingDriverProfile.distance === 'number' 
                    ? `${viewingDriverProfile.distance.toFixed(1)} km` 
                    : '—'}
                </p>
                <p className="text-sm text-gray-600">Distance</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

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
  )
}
