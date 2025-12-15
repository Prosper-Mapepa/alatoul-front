'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Car, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Sending reset email to...', email)
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Back to Home Button */}
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          {/* Logo and Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
                <Car className="w-7 h-7 text-gray-900" />
              </div>
            </Link>
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-base text-gray-600">
              We've sent a password reset link to
            </p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {email}
            </p>
          </div>

          {/* Success Message Card */}
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-4 text-center">
                <p className="text-base text-gray-700">
                  Please check your email and click on the reset link to create a new password.
                </p>
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="font-semibold text-primary-600 hover:text-primary-700"
                  >
                    try again
                  </button>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Sign In */}
          <div className="text-center">
            <Link
              href="/signin"
              className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
              <Car className="w-7 h-7 text-gray-900" />
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Forgot Password
          </h1>
          <p className="text-base text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Reset Form */}
        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="w-5 h-5" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-3 text-base mb-2"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-semibold border-2 border-primary-500 mt-2"
                disabled={isLoading || !email}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Sign In */}
        <div className="text-center">
          <Link
            href="/signin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

