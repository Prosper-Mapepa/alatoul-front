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
      <Card className="max-w-lg w-full border border-primary-200 shadow-lg">
        <CardContent className="p-8 sm:p-10 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <CheckCircle className="w-10 h-10 text-primary-600 animate-pulse" />
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full animate-ping opacity-75"></div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Verifying Your Account
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your {userRole === 'driver' ? 'driver' : 'passenger'} account is being verified automatically...
          </p>
          
          <div className="bg-primary-50/50 border border-primary-200 rounded-lg p-5 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700 mb-3">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Verification in progress</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-600">
              This process completes automatically in a few seconds
            </p>
          </div>

          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
