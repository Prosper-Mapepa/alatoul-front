'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Car,
  Users,
  Navigation,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function RidePage() {
  const [rideType, setRideType] = useState<'now' | 'schedule'>('now')
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [proposedFare, setProposedFare] = useState(15)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [passengers, setPassengers] = useState(1)

  const handleRequestRide = () => {
    // Handle ride request logic
    console.log('Requesting ride...')
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">Book Your Ride</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600">Set your destination and propose your fare</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setRideType('now')}
                    className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      rideType === 'now'
                        ? 'bg-primary-500 text-gray-900 shadow-md shadow-primary-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Clock className="w-5 h-5 inline mr-2" />
                    Ride Now
                  </button>
                  <button
                    onClick={() => setRideType('schedule')}
                    className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      rideType === 'schedule'
                        ? 'bg-primary-500 text-gray-900 shadow-md shadow-primary-500/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Schedule
                  </button>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Where to?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div>
                  <Input
                    label="Pickup Location"
                    placeholder="Enter pickup address"
                    icon={<MapPin className="w-5 h-5" />}
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Destination"
                    placeholder="Where are you going?"
                    icon={<Navigation className="w-5 h-5" />}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                {rideType === 'schedule' && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Input
                      label="Date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <Input
                      label="Time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Number of Passengers
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-primary-500 transition-all font-semibold text-gray-700"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold w-16 text-center text-gray-900">{passengers}</span>
                    <button
                      onClick={() => setPassengers(Math.min(8, passengers + 1))}
                      className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-primary-500 transition-all font-semibold text-gray-700"
                    >
                      +
                    </button>
                    <Users className="w-6 h-6 text-primary-500 ml-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fare Proposal Card */}
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-primary-500" />
                  Propose Your Fare
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Your Proposed Fare
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={proposedFare}
                        onChange={(e) => setProposedFare(Number(e.target.value))}
                        className="text-3xl font-bold"
                      />
                    </div>
                    <span className="text-2xl font-bold text-gray-700">USD</span>
                  </div>
                  <p className="text-base text-gray-600 mt-3">
                    Drivers can accept, reject, or counter your offer
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border-2 border-primary-200 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-semibold text-gray-700">Estimated Distance</span>
                    <span className="text-base font-bold text-gray-900">~12.5 miles</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-semibold text-gray-700">Estimated Time</span>
                    <span className="text-base font-bold text-gray-900">~25 minutes</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-primary-200">
                    <span className="text-base font-semibold text-gray-700">Suggested Fare Range</span>
                    <span className="text-base font-bold text-primary-600">$12 - $18</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleRequestRide}
                  disabled={!pickup || !destination}
                >
                  Request Ride & See Offers
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Driver Offers */}
          <div className="space-y-6">
            <Card className="shadow-lg border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">Available Drivers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((driver) => (
                    <div
                      key={driver}
                      className="p-5 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all duration-300 cursor-pointer bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                            <Car className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">Driver {driver}</h4>
                            <p className="text-base text-gray-600">4.8 ⭐ • 250+ rides</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-100">
                        <span className="text-base font-semibold text-gray-700">Counter Offer:</span>
                        <span className="text-xl font-bold text-primary-500 green-text">
                          {formatCurrency(proposedFare + driver * 2)}
                        </span>
                      </div>
                      <Button variant="primary" size="md" className="w-full mt-4 font-semibold border-2 border-primary-500">
                        Accept Offer
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Features */}
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100/50 border-2 border-primary-200 shadow-lg">
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
      </div>
    </div>
  )
}

