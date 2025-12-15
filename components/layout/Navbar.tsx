'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MapPin, Menu, X, User, Car, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    checkAuthStatus()
  }, [pathname])

  const checkAuthStatus = async () => {
    try {
      const user = await api.getCurrentUser()
      setCurrentUser(user)
      setIsLoggedIn(!!user)
    } catch (err) {
      setIsLoggedIn(false)
      setCurrentUser(null)
    }
  }

  const handleLogout = async () => {
    try {
      api.setToken(null)
      setIsLoggedIn(false)
      setCurrentUser(null)
      router.push('/')
    } catch (err) {
      console.error('Logout error:', err)
      router.push('/')
    }
  }

  const isHomePage = pathname === '/'

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isHomePage 
          ? "bg-black/10 backdrop-blur-md border-b border-white/20 shadow-lg" 
          : "bg-white/95 backdrop-blur-sm border-b-[0.5px] border-gray-200 shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-xl transition-all duration-300",
              isHomePage 
                ? "bg-primary-500/95 backdrop-blur-sm group-hover:bg-primary-500 border-2 border-white/20" 
                : "bg-primary-500"
            )}>
              <Car className={cn(
                "w-7 h-7 transition-colors",
                isHomePage ? "text-black" : "text-gray-900"
              )} style={isHomePage ? { filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' } : {}} />
            </div>
            <span className={cn(
              "text-2xl font-extrabold transition-colors",
              isHomePage 
                ? "text-white" 
                : "text-gray-900"
            )} style={isHomePage ? { 
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)'
            } : {}}>
              Alatoul
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10 relative h-full">
            <Link
              href="/"
              className={cn(
                "text-base font-semibold transition-all relative group h-full flex items-center",
                isHomePage
                  ? pathname === '/' 
                    ? "text-white" 
                    : "text-white/95 hover:text-white"
                  : pathname === '/' 
                    ? "text-gray-900" 
                    : "text-gray-700 hover:text-gray-900"
              )}
              style={isHomePage ? { 
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              } : {}}
            >
              Home
              <span className={cn(
                "absolute bottom-0 left-0 right-0 h-[2px] transition-all",
                isHomePage ? "bg-white" : "bg-primary-500",
                pathname === '/' ? "w-full" : "w-0 group-hover:w-full"
              )}></span>
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-base font-semibold transition-all relative group h-full flex items-center",
                isHomePage
                  ? "text-white/95 hover:text-white"
                  : (pathname === '/about' 
                    ? "text-gray-900" 
                    : "text-gray-700 hover:text-gray-900")
              )}
              style={isHomePage ? { 
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              } : {}}
            >
              About
              <span className={cn(
                "absolute -bottom-[1px] left-0 h-[2px] transition-all",
                isHomePage ? "bg-white" : "bg-primary-500",
                (!isHomePage && pathname === '/about') ? "w-full" : "w-0 group-hover:w-full"
              )}></span>
            </Link>
            <Link
              href="/safety"
              className={cn(
                "text-base font-semibold transition-all relative group h-full flex items-center",
                isHomePage
                  ? "text-white/95 hover:text-white"
                  : (pathname === '/safety' 
                    ? "text-gray-900" 
                    : "text-gray-700 hover:text-gray-900")
              )}
              style={isHomePage ? { 
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              } : {}}
            >
              Safety
              <span className={cn(
                "absolute -bottom-[1px] left-0 h-[2px] transition-all",
                isHomePage ? "bg-white" : "bg-primary-500",
                (!isHomePage && pathname === '/safety') ? "w-full" : "w-0 group-hover:w-full"
              )}></span>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-5">
            {isLoggedIn ? (
              <>
                <Link 
                  href={currentUser?.role === 'driver' ? '/driver' : currentUser?.role === 'admin' ? '/admin' : '/dashboard'}
                  className={cn(
                    "flex items-center space-x-2 text-base font-semibold transition-all",
                    isHomePage
                      ? "text-white/95 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  )}
                  style={isHomePage ? { 
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  } : {}}
                >
                  <User className="w-5 h-5" style={isHomePage ? { filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' } : {}} />
                  <span>{currentUser?.name || 'Dashboard'}</span>
                </Link>
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={handleLogout}
                  className={cn(
                    "font-semibold transition-all",
                    isHomePage 
                      ? "bg-white/25 backdrop-blur-sm border-white/40 text-white hover:bg-white/35 shadow-lg border-2" 
                      : ""
                  )}
                  style={isHomePage ? { 
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  } : {}}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/signin" 
                  className={cn(
                    "flex items-center space-x-2 text-base font-semibold transition-all",
                    isHomePage
                      ? "text-white/95 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  )}
                  style={isHomePage ? { 
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  } : {}}
                >
                  <span>Sign In</span>
                </Link>
                <Link href="/register">
                  <Button 
                    variant="primary" 
                    size="md" 
                    className={cn(
                      "font-semibold transition-all shadow-lg hover:shadow-xl",
                      isHomePage
                        ? "bg-primary-500 hover:bg-primary-600 text-black border-2 border-primary-400"
                        : "border-[0.5px] border-primary-500"
                    )}
                    style={isHomePage ? { 
                      filter: 'drop-shadow(0 2px 8px rgba(193, 241, 29, 0.3))'
                    } : {}}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={cn(
              "lg:hidden p-2 rounded-lg transition-all",
              isHomePage
                ? "text-white hover:bg-white/20 backdrop-blur-sm"
                : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'lg:hidden transition-all duration-300',
          isHomePage
            ? 'border-t border-white/20 bg-white/10 backdrop-blur-md'
            : 'border-t-[0.5px] border-gray-200 bg-white',
          isOpen ? 'max-h-96 opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden pointer-events-none'
        )}
      >
        <div className="px-4 py-6 space-y-3 flex flex-col">
          <Link
            href="/"
            className={cn(
              "block text-base font-medium py-2 transition-colors",
              pathname === '/' 
                ? "text-gray-900 font-semibold" 
                : "text-gray-700 hover:text-gray-900"
            )}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/ride"
            className={cn(
              "block text-base font-medium py-2 transition-colors",
              pathname === '/ride' 
                ? "text-gray-900 font-semibold" 
                : "text-gray-700 hover:text-gray-900"
            )}
            onClick={() => setIsOpen(false)}
          >
            Book Ride
          </Link>
          <Link
            href="/driver"
            className={cn(
              "block text-base font-medium py-2 transition-colors",
              pathname === '/driver' 
                ? "text-gray-900 font-semibold" 
                : "text-gray-700 hover:text-gray-900"
            )}
            onClick={() => setIsOpen(false)}
          >
            Drive
          </Link>
          <Link
            href="/safety"
            className={cn(
              "block text-base font-medium py-2 transition-colors",
              pathname === '/safety' 
                ? "text-gray-900 font-semibold" 
                : "text-gray-700 hover:text-gray-900"
            )}
            onClick={() => setIsOpen(false)}
          >
            Safety
          </Link>
          <Link
            href="/about"
            className={cn(
              "block text-base font-medium py-2 transition-colors",
              pathname === '/about' 
                ? "text-gray-900 font-semibold" 
                : "text-gray-700 hover:text-gray-900"
            )}
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <div className="pt-4 space-y-3 border-t-[0.5px] border-gray-200">
            {isLoggedIn ? (
              <>
                <Link 
                  href={currentUser?.role === 'driver' ? '/driver' : currentUser?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-2 text-base font-medium text-gray-700 hover:text-gray-900 py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>{currentUser?.name || 'Dashboard'}</span>
                </Link>
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full font-semibold"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/signin" 
                  className="flex items-center space-x-2 text-base font-medium text-gray-700 hover:text-gray-900 py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
                <Link href="/register" className="block" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="md" className="w-full font-semibold border-[0.5px] border-primary-500">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

