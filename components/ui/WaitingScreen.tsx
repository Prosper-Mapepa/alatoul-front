'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Clock, CheckCircle, AlertCircle, LogOut, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

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
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Poll for verification status
    let pollCount = 0
    const maxPolls = 20 // Poll for up to 60 seconds
    
    const checkVerification = async () => {
      try {
        const user = (await api.getCurrentUser()) as any
        let kyc: any = null
        try {
          kyc = await api.getKYC()
        } catch (err) {
          // KYC might not exist yet
        }
        
        // Check if user is verified
        if (user.status === 'active' || 
            (user.status === 'verified' && kyc && kyc.status === 'approved')) {
          setIsVerified(true)
          setIsChecking(false)
          return true
        }
        return false
      } catch (err) {
        console.error('Failed to check verification:', err)
        return false
      }
    }
    
    // Initial check
    checkVerification().then((verified) => {
      if (!verified) {
        setIsChecking(false)
        // Start polling
        const pollInterval = setInterval(async () => {
          pollCount++
          const verified = await checkVerification()
          if (verified || pollCount >= maxPolls) {
            clearInterval(pollInterval)
          }
        }, 3000)
      }
    })
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      router.push('/signin')
    }
  }

  const handleGoToDashboard = () => {
    if (userRole === 'driver') {
      router.push('/driver')
    } else {
      router.push('/dashboard')
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

  // Show verified state
  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
        <Card className="max-w-md w-full border-2 border-primary-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Verification Complete!
            </h1>
            
            <p className="text-sm text-gray-600 mb-6">
              Your {userRole === 'driver' ? 'driver' : 'passenger'} account has been verified successfully.
            </p>

            <Button 
              variant="primary" 
              onClick={handleGoToDashboard} 
              className="w-full mb-3"
            >
              Go to My Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button variant="outline" onClick={handleLogout} className="w-full text-sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <Card className="max-w-md w-full border border-primary-200 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
            {isChecking ? (
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            ) : (
              <Clock className="w-8 h-8 text-primary-600 animate-pulse" />
            )}
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Verifying Your Account
          </h1>
          
          <p className="text-sm text-gray-600 mb-4">
            Your {userRole === 'driver' ? 'driver' : 'passenger'} account is being verified automatically...
          </p>
          
          <div className="bg-primary-50/50 border border-primary-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-700 mb-2">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Verification in progress</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-primary-500 h-1.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>

          <Button variant="outline" onClick={handleLogout} className="w-full text-sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
