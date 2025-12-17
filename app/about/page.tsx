'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Car, Users, Heart, Globe } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">About Alatoul<span className="text-primary-500">.</span></h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600">
            Transportation, Available All the Time
          </p>
        </div>

        {/* Mission Statement */}
        {/* <Card className="mb-12 shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              Alatoul is an innovative ride-hailing and mobility platform designed to operate &quot;all the time&quot; — 
              offering fast, flexible, and affordable transportation similar to InDrive, but enhanced with 
              greater transparency, safety, and user control.
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              The app connects riders and drivers in real time, allowing passengers to propose their own 
              fare while drivers negotiate, accept, or counter-offer, creating a fair and dynamic pricing 
              system that benefits both sides.
            </p>
          </CardContent>
        </Card> */}

        {/* What We Offer */}
        <div className="mb-12">
          {/* <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">What We Offer</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Car className="w-7 h-7 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Riders</h3>
                <ul className="space-y-3 text-base text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Propose your own fare
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Instant or scheduled rides
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Long-distance travel options
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Real-time tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Safe and verified drivers
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <Users className="w-7 h-7 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Drivers</h3>
                <ul className="space-y-3 text-base text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Flexible earnings
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Route autonomy
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Optimized matching
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Reduced idle time
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                    Fair pricing system
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values */}
        {/* <Card className="mb-12 shadow-lg border border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/50">
          <CardContent className="p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-500 transition-colors">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Trust</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Building a trusted community through transparency and safety
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-500 transition-colors">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Globe className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Accessibility</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Transportation available anytime, anywhere for everyone
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-500 transition-colors">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Car className="w-8 h-8 text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Innovation</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Continuously improving with user feedback and technology
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* CTA */}
        {/* <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Join Us Today</h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8">
            Whether you need a ride or want to drive, Alatoul makes transportation simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/ride">
              <Button variant="primary" size="lg" className="font-semibold border border-primary-500">
                Book a Ride
              </Button>
            </Link>
            <Link href="/driver">
              <Button variant="secondary" size="lg" className="font-semibold border">
                Become a Driver
              </Button>
            </Link>
          </div>
        </div> */}
      </div>
    </div>
  )
}

