'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Shield,
  UserCheck,
  MapPin,
  MessageCircle,
  AlertCircle,
  Phone,
  Share2,
  Star,
  Clock,
  Lock,
} from 'lucide-react'

export default function SafetyPage() {
  const safetyFeatures = [
    {
      icon: UserCheck,
      title: 'Verified Drivers',
      description:
        'All drivers undergo comprehensive background checks, vehicle inspections, and identity verification before joining our platform.',
    },
    {
      icon: MapPin,
      title: 'Real-Time Tracking',
      description:
        'Track your ride in real-time and share your trip status with trusted contacts for added peace of mind.',
    },
    {
      icon: AlertCircle,
      title: 'Emergency Assistance',
      description:
        'Quick access to emergency services with one-tap emergency button and 24/7 support team ready to help.',
    },
    {
      icon: MessageCircle,
      title: 'In-App Communication',
      description:
        'Secure in-app messaging allows you to communicate with your driver without sharing personal phone numbers.',
    },
    {
      icon: Star,
      title: 'Community Ratings',
      description:
        'Rate and review every trip to help build a trusted community and ensure quality service for everyone.',
    },
    {
      icon: Lock,
      title: 'Data Privacy',
      description:
        'Your personal information is encrypted and protected. We never share your data without your consent.',
    },
  ]

  const safetyTips = [
    {
      title: 'Verify Driver Details',
      description: 'Always confirm the driver name, vehicle model, and license plate before getting in.',
    },
    {
      title: 'Share Your Trip',
      description: 'Share your trip details with friends or family so they know where you are.',
    },
    {
      title: 'Stay Alert',
      description: 'Be aware of your surroundings and trust your instincts if something feels off.',
    },
    {
      title: 'Contact Support',
      description: 'Report any concerns immediately through the app or call our 24/7 support line.',
    },
  ]

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12">
          {/* <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div> */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">
            Your Safety is Our Priority
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl">
            We've built multiple layers of safety features to ensure you have a secure and
            comfortable ride every time.
          </p>
        </div>

        {/* Safety Features */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Safety Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="shadow-lg border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <feature.icon className="w-7 h-7 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mb-12">
          <Card className="shadow-lg border border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100/50">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary-50 to-transparent rounded-t-xl">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-primary-600" />
                Safety Tips for Riders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {safetyTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-500 transition-colors">
                    <div className="w-10 h-10 bg-primary-500 text-gray-900 rounded-full flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">{tip.title}</h4>
                      <p className="text-base text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <Card className="shadow-lg border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Help</h3>
              <p className="text-gray-700 mb-6 text-base">
                If you're in an emergency situation, tap the emergency button in the app or call
                emergency services immediately.
              </p>
              <div className="space-y-3">
                <Button variant="primary" className="w-full bg-red-600 hover:bg-red-700 font-semibold border border-red-600">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Emergency Services
                </Button>
                <Button variant="outline" className="w-full border border-red-300 text-red-700 hover:bg-red-50 font-semibold">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Alatoul Support
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Share2 className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Share Your Trip</h3>
              <p className="text-gray-700 mb-6 text-base">
                Let trusted contacts know where you are by sharing your trip details in real-time.
              </p>
              <div className="space-y-3">
                <Button variant="primary" className="w-full font-semibold border border-primary-500">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Trip Now
                </Button>
                <Button variant="outline" className="w-full font-semibold border">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Set Up Trusted Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reporting Section */}
        <Card className="shadow-lg border border-gray-200 bg-white">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary-50 to-transparent rounded-t-xl">
            <CardTitle className="text-2xl font-bold text-gray-900">Report a Safety Concern</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-700 mb-6 text-base">
              Your feedback helps us maintain the highest safety standards. If you experience any
              safety concerns or incidents, please report them immediately.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full font-semibold border-2">
                Report Driver
              </Button>
              <Button variant="outline" className="w-full font-semibold border-2">
                Report Incident
              </Button>
              <Button variant="primary" className="w-full font-semibold border-2 border-primary-500">
                Contact Support Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

