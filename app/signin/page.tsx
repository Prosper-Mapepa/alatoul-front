'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Car, Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api.login({ email, password })
      
      if (response.token) {
        // Clear session storage to allow congrats message to show for verified users
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('has_seen_congrats')
          sessionStorage.removeItem('has_seen_congrats_driver')
        }
        
        // Redirect based on user role
        if (response.user.role === 'admin') {
          router.push('/admin')
        } else if (response.user.role === 'driver') {
          router.push('/driver')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.')
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
            Sign In
          </h1>
          <p className="text-base text-gray-600">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Sign In Form */}
        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <Input
                label="Email Address"
                type="email"
                placeholder=""
                // icon={<Mail className="w-5 h-5" />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="py-3 text-base mb-2"
                required
                disabled={isLoading}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 ">
                  Password
                </label>
                <div className="relative">
                  {/* <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" /> */}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder=""
                    className="w-full pl-4 pr-12 py-2.5 rounded-lg border-[0.5px] border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    required
                    disabled={isLoading}
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary-500 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium  text-primary-600 hover:text-primary-700"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-semibold border-2 border-primary-500 mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

