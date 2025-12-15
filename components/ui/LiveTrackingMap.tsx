'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Car, MapPin, Navigation } from 'lucide-react'

interface LiveTrackingMapProps {
  pickupLocation: { lat: number; lng: number }
  destinationLocation: { lat: number; lng: number }
  driverLocation?: { lat: number; lng: number } | null
  passengerLocation?: { lat: number; lng: number } | null
  className?: string
}

declare global {
  interface Window {
    google: any
  }
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  pickupLocation,
  destinationLocation,
  driverLocation,
  passengerLocation,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const driverMarkerRef = useRef<any>(null)
  const passengerMarkerRef = useRef<any>(null)
  const pickupMarkerRef = useRef<any>(null)
  const destinationMarkerRef = useRef<any>(null)
  const pulseCircleRef = useRef<any>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setIsLoading(false)
      setError('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.')
      return
    }
    
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      setIsLoading(false)
      setError(null)
      return
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setIsLoaded(true)
        setIsLoading(false)
        setError(null)
      })
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
      setIsLoading(false)
      setError(null)
    }
    script.onerror = () => {
      setIsLoading(false)
      setError('Failed to load Google Maps. Please check your API key and ensure Maps JavaScript API is enabled.')
    }
    document.head.appendChild(script)
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      if (isLoaded && !mapRef.current) {
        console.error('Map ref is null')
      }
      return
    }

    // Reset error
    setError(null)

    // Validate coordinates
    if (!pickupLocation || !destinationLocation) {
      setError('Missing location data')
      console.error('Missing location data:', { pickupLocation, destinationLocation })
      return
    }

    const pickupLat = typeof (pickupLocation as any).lat === 'function' ? (pickupLocation as any).lat() : Number((pickupLocation as any).lat)
    const pickupLng = typeof (pickupLocation as any).lng === 'function' ? (pickupLocation as any).lng() : Number((pickupLocation as any).lng)
    const destLat = typeof (destinationLocation as any).lat === 'function' ? (destinationLocation as any).lat() : Number((destinationLocation as any).lat)
    const destLng = typeof (destinationLocation as any).lng === 'function' ? (destinationLocation as any).lng() : Number((destinationLocation as any).lng)

    if (isNaN(pickupLat) || isNaN(pickupLng) || isNaN(destLat) || isNaN(destLng)) {
      const errorMsg = `Invalid location coordinates: pickup(${pickupLat}, ${pickupLng}), dest(${destLat}, ${destLng})`
      setError(errorMsg)
      console.error(errorMsg, { pickupLocation, destinationLocation })
      return
    }

    try {
      // Initialize map centered on pickup (always recreate to ensure it displays)
      const mapCenter = { lat: pickupLat, lng: pickupLng }
      
      // Clear existing map if coordinates changed
      if (mapInstanceRef.current) {
        // Update center if map exists
        mapInstanceRef.current.setCenter(mapCenter)
      } else {
        // Create new map instance
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: mapCenter,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        })
        mapInstanceRef.current = map
        
        // Trigger resize after a short delay to ensure container is visible
        setTimeout(() => {
          if (window.google && window.google.maps && mapInstanceRef.current) {
            window.google.maps.event.trigger(mapInstanceRef.current, 'resize')
            mapInstanceRef.current.setCenter(mapCenter)
          }
        }, 300)
      }

      // Initialize directions service
      if (!directionsServiceRef.current) {
        directionsServiceRef.current = new window.google.maps.DirectionsService()
      }

      // Initialize directions renderer - suppress default markers so our custom ones show
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          suppressMarkers: true, // Suppress default markers so custom ones are more visible
          polylineOptions: {
            strokeColor: '#C1F11D',
            strokeWeight: 5,
            zIndex: 1,
          },
        })
      }

      // Remove existing markers before creating new ones
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setMap(null)
      }
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null)
      }

      // Add pickup marker
      pickupMarkerRef.current = new window.google.maps.Marker({
        position: { lat: pickupLat, lng: pickupLng },
        map: mapInstanceRef.current,
        title: 'Pickup Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#C1F11D',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        label: {
          text: 'A',
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      })

      // Add destination marker
      destinationMarkerRef.current = new window.google.maps.Marker({
        position: { lat: destLat, lng: destLng },
        map: mapInstanceRef.current,
        title: 'Destination',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#C1F11D',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        label: {
          text: 'B',
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      })

      // Calculate route
      directionsServiceRef.current.route(
        {
          origin: { lat: pickupLat, lng: pickupLng },
          destination: { lat: destLat, lng: destLng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK' && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result)
            
            // Fit map to show entire route
            if (result.routes && result.routes[0] && result.routes[0].bounds) {
              mapInstanceRef.current.fitBounds(result.routes[0].bounds)
            }
          } else {
            console.error('Directions request failed:', status)
            setError(`Failed to calculate route: ${status}`)
          }
        }
      )
    } catch (error: any) {
      console.error('Error initializing map:', error)
      setError(error.message || 'Failed to initialize map')
    }
  }, [isLoaded, pickupLocation, destinationLocation])

  // Update driver location marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return
    
    // If no driver location, hide the marker but don't remove it
    if (!driverLocation) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setMap(null)
      }
      if (pulseCircleRef.current) {
        clearInterval(pulseCircleRef.current.interval)
        if (pulseCircleRef.current.circles) {
          pulseCircleRef.current.circles.forEach((circle: any) => {
            circle.setMap(null)
          })
        }
        pulseCircleRef.current = null
      }
      return
    }

    try {
      // Validate driver location coordinates first
      const driverLat = typeof (driverLocation as any).lat === 'function' ? (driverLocation as any).lat() : Number((driverLocation as any).lat)
      const driverLng = typeof (driverLocation as any).lng === 'function' ? (driverLocation as any).lng() : Number((driverLocation as any).lng)
      
      if (isNaN(driverLat) || isNaN(driverLng) || driverLat === 0 || driverLng === 0) {
        console.error('Invalid driver location coordinates:', driverLocation)
        return
      }
      
      const driverPos = new window.google.maps.LatLng(driverLat, driverLng)
      
      // Remove existing pulse circles if any (we'll recreate them)
      if (pulseCircleRef.current) {
        clearInterval(pulseCircleRef.current.interval)
        if (pulseCircleRef.current.circles) {
          pulseCircleRef.current.circles.forEach((circle: any) => {
            circle.setMap(null)
          })
        } else if (pulseCircleRef.current.circle) {
          // Backward compatibility
          pulseCircleRef.current.circle.setMap(null)
        }
        pulseCircleRef.current = null
      }
      
      // Add/update driver/vehicle marker - Large, bright, and visible
      if (!driverMarkerRef.current) {
        // Create new marker if it doesn't exist
        driverMarkerRef.current = new window.google.maps.Marker({
          position: driverPos,
          map: mapInstanceRef.current,
          title: 'Vehicle Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 28,
            fillColor: '#C1F11D',
            fillOpacity: 1,
            strokeWeight: 0,
          },
          optimized: false,
          zIndex: 1000,
          label: {
            text: '🚗',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#000000',
          },
        })
      } else {
        // Update existing marker position - ALWAYS keep it visible
        driverMarkerRef.current.setPosition(driverPos)
        driverMarkerRef.current.setMap(mapInstanceRef.current) // Ensure it's always on the map
      }
      
      // Add wave-like pulsing circle effect - smooth alert-style animation
      const pulseCircles: any[] = []
      
      // Create multiple expanding circles for wave/ripple effect
      const numCircles = 4
      for (let i = 0; i < numCircles; i++) {
        const circle = new window.google.maps.Circle({
          strokeColor: '#C1F11D',
          strokeOpacity: 0,
          strokeWeight: 2,
          fillColor: '#C1F11D',
          fillOpacity: 0,
          map: mapInstanceRef.current,
          center: driverPos,
          radius: 50,
          zIndex: 998 - i,
        })
        pulseCircles.push(circle)
      }
      
      // Animate the pulse circles - wave/ripple effect like an alert
      let pulsePhase = 0
      const pulseInterval = setInterval(() => {
        pulsePhase += 0.08
        
        pulseCircles.forEach((circle, index) => {
          // Each circle expands outward like a wave
          const delay = (index / numCircles) * Math.PI * 2 // Staggered start
          const phase = (pulsePhase + delay) % (Math.PI * 2)
          
          // Wave expands from center outward
          const minRadius = 50
          const maxRadius = 200
          const radiusProgress = (Math.sin(phase) + 1) / 2 // 0 to 1
          const currentRadius = minRadius + (maxRadius - minRadius) * radiusProgress
          
          circle.setRadius(currentRadius)
          
          // Opacity fades as wave expands outward
          const opacity = Math.sin(phase) * 0.6
          const fillOpacity = Math.max(0, opacity * 0.15)
          const strokeOpacity = Math.max(0, opacity * 0.8)
          
          circle.setOptions({
            strokeOpacity: strokeOpacity,
            fillOpacity: fillOpacity,
          })
        })
      }, 50) // Smooth wave animation
      
      // Store for cleanup
      pulseCircleRef.current = { circles: pulseCircles, interval: pulseInterval }

      // Update map bounds to include all locations
      if (mapInstanceRef.current) {
        const bounds = new window.google.maps.LatLngBounds()
        
        // Convert coordinates to LatLng objects
        const pickupLat = typeof (pickupLocation as any).lat === 'function' ? (pickupLocation as any).lat() : Number((pickupLocation as any).lat)
        const pickupLng = typeof (pickupLocation as any).lng === 'function' ? (pickupLocation as any).lng() : Number((pickupLocation as any).lng)
        const destLat = typeof (destinationLocation as any).lat === 'function' ? (destinationLocation as any).lat() : Number((destinationLocation as any).lat)
        const destLng = typeof (destinationLocation as any).lng === 'function' ? (destinationLocation as any).lng() : Number((destinationLocation as any).lng)
        
        bounds.extend(new window.google.maps.LatLng(pickupLat, pickupLng))
        bounds.extend(new window.google.maps.LatLng(destLat, destLng))
        bounds.extend(driverPos)
        
        if (passengerLocation) {
          const passLat = typeof (passengerLocation as any).lat === 'function' ? (passengerLocation as any).lat() : Number((passengerLocation as any).lat)
          const passLng = typeof (passengerLocation as any).lng === 'function' ? (passengerLocation as any).lng() : Number((passengerLocation as any).lng)
          if (!isNaN(passLat) && !isNaN(passLng)) {
            bounds.extend(new window.google.maps.LatLng(passLat, passLng))
          }
        }
        
        mapInstanceRef.current.fitBounds(bounds, { padding: 80 })
      }
    } catch (error) {
      console.error('Error updating driver location:', error)
      setError('Failed to update vehicle location on map')
    }
  }, [isLoaded, driverLocation, passengerLocation, pickupLocation, destinationLocation])

  // Update passenger location marker
  useEffect(() => {
    if (!isLoaded || !passengerLocation || !mapInstanceRef.current) return

    try {
      // Remove existing passenger marker
      if (passengerMarkerRef.current) {
        passengerMarkerRef.current.setMap(null)
      }

      // Add/update passenger marker
      passengerMarkerRef.current = new window.google.maps.Marker({
        position: passengerLocation,
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#FF6B6B',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 4,
        },
        animation: window.google.maps.Animation.DROP,
        label: {
          text: '👤',
          fontSize: '18px',
          fontWeight: 'bold',
        },
      })

      // Update map bounds to include both passenger and driver if driver is available
      if (mapInstanceRef.current) {
        const bounds = new window.google.maps.LatLngBounds()
        
        // Convert coordinates to LatLng objects
        const pickupLat = typeof (pickupLocation as any).lat === 'function' ? (pickupLocation as any).lat() : Number((pickupLocation as any).lat)
        const pickupLng = typeof (pickupLocation as any).lng === 'function' ? (pickupLocation as any).lng() : Number((pickupLocation as any).lng)
        const destLat = typeof (destinationLocation as any).lat === 'function' ? (destinationLocation as any).lat() : Number((destinationLocation as any).lat)
        const destLng = typeof (destinationLocation as any).lng === 'function' ? (destinationLocation as any).lng() : Number((destinationLocation as any).lng)
        
        bounds.extend(new window.google.maps.LatLng(pickupLat, pickupLng))
        bounds.extend(new window.google.maps.LatLng(destLat, destLng))
        bounds.extend(passengerLocation)
        
        if (driverLocation) {
          bounds.extend(driverLocation)
        }
        
        mapInstanceRef.current.fitBounds(bounds, { padding: 80 })
      }
    } catch (error) {
      console.error('Error updating passenger location:', error)
    }
  }, [isLoaded, passengerLocation, driverLocation, pickupLocation, destinationLocation])

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '500px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C1F11D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '500px' }}>
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold mb-2">Map Error</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-[#C1F11D] border-2 border-black flex items-center justify-center">
              <span className="text-xs">🚗</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">Vehicle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-[#FF6B6B] border-2 border-white flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">You</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#C1F11D] border-2 border-white">
              <span className="text-xs text-black font-bold ml-1.5">A</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">Pickup</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-[#C1F11D] border-2 border-white">
              <span className="text-xs text-black font-bold ml-1.5">B</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">Destination</span>
          </div>
        </div>
      </div>
      
      <div
        ref={mapRef}
        className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
        style={{ minHeight: '500px', height: '500px', width: '100%', position: 'relative' }}
      />
    </div>
  )
}
