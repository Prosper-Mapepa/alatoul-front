'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Car, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Users, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'passenger' as 'passenger' | 'driver' | '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!")
      return
    }

    if (!acceptedTerms) {
      setError("You must agree to the terms and conditions.")
      return
    }

    if (!formData.accountType) {
      setError("Please select an account type (Passenger or Driver).")
      return
    }

    setIsLoading(true)

    try {
      const response = await api.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: formData.accountType as 'passenger' | 'driver',
      })

      if (response.token) {
        // Redirect to KYC page with account type
        router.push(`/kyc?type=${formData.accountType}`)
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            Register 
          </h1>
          <p className="text-base text-gray-600">
            Join Alatoul and start your journey
          </p>
        </div>

        {/* Register Form */}
        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Account Type Selection - Tab Style */}
              <div>
                {/* <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to register as:
                </label> */}
                <div className="flex space-x-1 border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'passenger' })}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 font-semibold transition-all duration-300 border-b-3 relative ${
                      formData.accountType === 'passenger'
                        ? 'border-primary-500 text-gray-900 bg-primary-500 rounded-t-xl'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-xl'
                    }`}
                  >
                    <Users className={`w-5 h-5 ${formData.accountType === 'passenger' ? 'text-gray-900' : 'text-gray-500'}`} />
                    <span>Passenger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'driver' })}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 font-semibold transition-all duration-300 border-b-3 relative ${
                      formData.accountType === 'driver'
                        ? 'border-primary-500 text-gray-900 bg-primary-500 rounded-t-xl'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-xl'
                    }`}
                  >
                    <Car className={`w-5 h-5 ${formData.accountType === 'driver' ? 'text-gray-900' : 'text-gray-500'}`} />
                    <span>Driver</span>
                  </button>
                </div>
              </div>

              <Input
                label="Full Name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                icon={<User className="w-5 h-5" />}
                value={formData.name}
                onChange={handleInputChange}
                className="py-2.5 text-base"
                required
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                icon={<Mail className="w-5 h-5" />}
                value={formData.email}
                onChange={handleInputChange}
                className="py-2.5 text-base"
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                icon={<Phone className="w-5 h-5" />}
                value={formData.phone}
                onChange={handleInputChange}
                className="py-2.5 text-base"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a password"
                    className="w-full pl-10 pr-12 py-2.5 rounded-lg border-[0.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {/* <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p> */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-12 py-2.5 rounded-lg border-[0.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 accent-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                />
                <label className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-semibold border-2 border-primary-500 mt-2"
                disabled={!acceptedTerms || !formData.accountType || isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

