'use client'

import React, { useEffect, useRef, useState } from 'react'

interface RouteMapProps {
  pickupPlace: any | null
  destinationPlace: any | null
  className?: string
}

declare global {
  interface Window {
    google: any
  }
}

export const RouteMap: React.FC<RouteMapProps> = ({
  pickupPlace,
  destinationPlace,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places,directions`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
    }
    script.onerror = () => {
      setError('Failed to load Google Maps')
    }
    document.head.appendChild(script)

    return () => {
      // Don't remove script as it might be used by other components
    }
  }, [])

  // Initialize map and directions
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !pickupPlace || !destinationPlace) {
      return
    }

    // Reset error state when we have valid inputs
    setError(null)

    try {
      // Handle both Google Places API format and plain coordinates format
      let pickupLocation: any
      let destinationLocation: any

      // Check if it's Google Places API format (has geometry.location)
      if (pickupPlace.geometry?.location) {
        pickupLocation = pickupPlace.geometry.location
      } 
      // Check if it's plain coordinates format (has lat/lng directly)
      else if (pickupPlace.lat !== undefined && pickupPlace.lng !== undefined) {
        const lat = typeof pickupPlace.lat === 'function' ? pickupPlace.lat() : Number(pickupPlace.lat)
        const lng = typeof pickupPlace.lng === 'function' ? pickupPlace.lng() : Number(pickupPlace.lng)
        
        // Validate coordinates are valid numbers
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          setError('Invalid pickup location coordinates')
          return
        }
        
        pickupLocation = new window.google.maps.LatLng(lat, lng)
      } else {
        setError('Invalid pickup location data')
        return
      }

      // Same for destination
      if (destinationPlace.geometry?.location) {
        destinationLocation = destinationPlace.geometry.location
      } 
      else if (destinationPlace.lat !== undefined && destinationPlace.lng !== undefined) {
        const lat = typeof destinationPlace.lat === 'function' ? destinationPlace.lat() : Number(destinationPlace.lat)
        const lng = typeof destinationPlace.lng === 'function' ? destinationPlace.lng() : Number(destinationPlace.lng)
        
        // Validate coordinates are valid numbers
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          setError('Invalid destination location coordinates')
          return
        }
        
        destinationLocation = new window.google.maps.LatLng(lat, lng)
      } else {
        setError('Invalid destination location data')
        return
      }

      // Initialize map
      if (!mapInstanceRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 12,
          center: pickupLocation,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        })
        mapInstanceRef.current = map
      }

      // Initialize directions service and renderer
      if (!directionsServiceRef.current) {
        directionsServiceRef.current = new window.google.maps.DirectionsService()
      }

      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#C1F11D',
            strokeWeight: 5,
          },
        })
      }

      // Add markers
      new window.google.maps.Marker({
        position: pickupLocation,
        map: mapInstanceRef.current,
        title: 'Pickup Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#C1F11D',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        label: {
          text: 'A',
          color: '#000000',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      })

      new window.google.maps.Marker({
        position: destinationLocation,
        map: mapInstanceRef.current,
        title: 'Destination',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#C1F11D',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        label: {
          text: 'B',
          color: '#000000',
          fontSize: '12px',
          fontWeight: 'bold',
        },
      })

      // Calculate route
      directionsServiceRef.current.route(
        {
          origin: pickupLocation,
          destination: destinationLocation,
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
            setError('Failed to calculate route')
          }
        }
      )
    } catch (error) {
      console.error('Error initializing map:', error)
      setError('Failed to initialize map')
    }
  }, [isLoaded, pickupPlace, destinationPlace])

  if (!pickupPlace || !destinationPlace) {
    return null
  }

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-lg overflow-hidden border border-gray-200 ${className}`}
      style={{ minHeight: '400px', width: '100%' }}
    />
  )
}

