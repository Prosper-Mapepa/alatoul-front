'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WaitingScreenProps {
  userRole: 'passenger' | 'driver'
  status: 'pending' | 'suspended'
  kycStatus?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  userRole,
  status,
  kycStatus,
  rejectionReason,
}) => {
  const router = useRouter()

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      router.push('/signin')
    }
  }

  if (status === 'suspended') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-2xl w-full border-2 border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Suspended</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your account has been suspended. Please contact support for more information.
            </p>
            <Button variant="primary" onClick={handleLogout} className="mt-4">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (kycStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-2xl w-full border-2 border-yellow-200">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verification Rejected</h1>
            <p className="text-lg text-gray-600 mb-4">
              Your {userRole === 'driver' ? 'driver' : 'passenger'} verification has been rejected.
            </p>
            {rejectionReason && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <p className="font-semibold text-gray-900 mb-2">Reason:</p>
                <p className="text-gray-700">{rejectionReason}</p>
              </div>
            )}
            <p className="text-gray-600 mb-6">
              Please review your information and resubmit your verification documents.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => router.push('/kyc')}>
                Update Information
              </Button>
              <Button variant="primary" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full border-2 border-primary-200">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Clock className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {userRole === 'driver' ? 'Driver' : 'Passenger'} Verification Pending
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your account is being reviewed by our team. You'll be able to access your dashboard once your verification is approved.
          </p>
          
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 text-primary-600 mr-2" />
              What happens next?
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>Our team is reviewing your {userRole === 'driver' ? 'driver' : 'passenger'} application and documents</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>This process typically takes 24-48 hours</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>You'll receive an email notification once your account is approved</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>You can check back here anytime to see your status</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
              <span>Status: {kycStatus === 'pending' ? 'Under Review' : 'Pending Approval'}</span>
            </div>
          </div>

          <Button variant="primary" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
