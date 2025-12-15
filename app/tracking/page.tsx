'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Shield,
  Share2,
  Clock,
  Car,
  User,
  Star,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function TrackingPage() {
  const [tripStatus, setTripStatus] = useState<'waiting' | 'arriving' | 'in-progress' | 'completed'>(
    'in-progress'
  )
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const tripData = {
    pickup: '123 Main Street, Downtown',
    destination: '456 Business Avenue, Financial District',
    driver: {
      name: 'John D.',
      rating: 4.9,
      vehicle: 'Toyota Camry 2023',
      license: 'ABC-1234',
      phone: '+1 (555) 123-4567',
    },
    fare: 28,
    distance: '12.5 miles',
    estimatedTime: '25 minutes',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Map Section */}
      <div className="h-[60vh] bg-gradient-to-br from-primary-500 to-accent-500 relative">
        {/* Map placeholder */}
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Live Trip Tracking</p>
            <p className="text-sm mt-2">Map integration would go here</p>
          </div>
        </div>

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trip Status</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {tripStatus.replace('-', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTime(timeElapsed)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trip Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trip Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Pickup</p>
                      <p className="font-semibold text-gray-900">{tripData.pickup}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-gray-400" />
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-5 h-5 text-accent-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Destination</p>
                      <p className="font-semibold text-gray-900">{tripData.destination}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Driver</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{tripData.driver.name}</h4>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-600 ml-1">{tripData.driver.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tripData.driver.vehicle}</p>
                    <p className="text-xs text-gray-500">License: {tripData.driver.license}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Distance</p>
                    <p className="text-lg font-semibold text-gray-900">{tripData.distance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Est. Time</p>
                    <p className="text-lg font-semibold text-gray-900">{tripData.estimatedTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fare</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(tripData.fare)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary-600" />
                  Safety Features
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Emergency Help
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Trip
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full" disabled>
                    Trip in Progress
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Receipt
                  </Button>
                  <Button variant="ghost" className="w-full text-red-600">
                    Cancel Trip
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Trip Progress</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Driver Assigned', completed: true },
                    { label: 'Driver Arriving', completed: tripStatus !== 'waiting' },
                    { label: 'Trip Started', completed: tripStatus === 'in-progress' },
                    { label: 'Trip Completed', completed: tripStatus === 'completed' },
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          step.completed
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <span
                        className={`text-sm ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

