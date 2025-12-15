'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AddressAutocompleteProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onPlaceSelected?: (place: any) => void
  className?: string
  required?: boolean
}

declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  label,
  placeholder = 'Enter address',
  value,
  onChange,
  onPlaceSelected,
  className,
  required,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
      if (existingScript) {
        // Don't remove as it might be used by other components
      }
    }
  }, [])

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: [] }, // Allow all countries, can restrict if needed
        fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components'],
        types: ['geocode'], // Include addresses and other geocoding results
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        
        if (place.formatted_address) {
          onChange(place.formatted_address)
          
          if (onPlaceSelected) {
            onPlaceSelected(place)
          }
        }
      })

      autocompleteRef.current = autocomplete
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error)
    }

    return () => {
      autocompleteRef.current = null
    }
  }, [isLoaded, onChange, onPlaceSelected])

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-base font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-[0.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
            className
          )}
          required={required}
        />
      </div>
    </div>
  )
}

