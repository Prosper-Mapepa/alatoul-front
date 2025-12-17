'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Car,
  Clock,
  Shield,
  DollarSign,
  MapPin,
  MessageCircle,
  Star,
  TrendingUp,
  Calendar,
  Route,
  CheckCircle2,
  ArrowRight,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react'

const rotatingPhrases = [
  'Alatoul.',
  'Ride Immediately.',
  'All the Time.',
  // 'Available All the Time.',
  // 'Easy & Reliable.'
]

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  useEffect(() => {
    // Reset when phrase changes
    setDisplayedText('')
    setCharIndex(0)
    setIsDeleting(false)
  }, [currentIndex])

  useEffect(() => {
    const currentPhrase = rotatingPhrases[currentIndex]
    
    if (currentPhrase.length === 0) return

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        if (charIndex < currentPhrase.length) {
          setDisplayedText(currentPhrase.substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => {
            setIsDeleting(true)
          }, 2500)
        }
      } else {
        // Deleting backward
        if (charIndex > 0) {
          setDisplayedText(currentPhrase.substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % rotatingPhrases.length)
        }
      }
    }, isDeleting ? 40 : 80) // Typing speed

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, currentIndex])

  // Handle audio playback
  useEffect(() => {
    if (audioRef) {
      // Audio is muted by default, so we don't autoplay
      // Listen to play/pause and muted events
      const handlePlay = () => setIsMusicPlaying(true)
      const handlePause = () => setIsMusicPlaying(false)
      const handleVolumeChange = () => {
        setIsMusicPlaying(!audioRef.muted && !audioRef.paused)
      }
      
      audioRef.addEventListener('play', handlePlay)
      audioRef.addEventListener('pause', handlePause)
      audioRef.addEventListener('volumechange', handleVolumeChange)
      
      // Set initial state based on muted status
      setIsMusicPlaying(!audioRef.muted && !audioRef.paused)
      
      return () => {
        audioRef.removeEventListener('play', handlePlay)
        audioRef.removeEventListener('pause', handlePause)
        audioRef.removeEventListener('volumechange', handleVolumeChange)
      }
    }
  }, [audioRef])

  const toggleMusic = () => {
    if (audioRef) {
      if (isMusicPlaying) {
        // Mute and pause
        audioRef.muted = true
        audioRef.pause()
      } else {
        // Unmute and play
        audioRef.muted = false
        audioRef.play().catch((error) => {
          console.log('Error playing audio:', error)
        })
      }
    }
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Clean Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-white" style={{ overflow: 'visible', marginTop: '-80px', paddingTop: '80px' }}>
        {/* Background Image */}
        <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src="/assets/c.jpg"
              alt="Banner background"
              fill
              className="object-cover"
              priority
              quality={90}
              unoptimized={true}
            />
          </div>
          
          {/* Background Music */}
          <audio
            ref={(el) => setAudioRef(el)}
            src="/assets/audio.mp3"
            loop
            muted
            preload="auto"
            className="hidden"
          />
        </div>
        
        {/* Subtle green filter overlay for theme consistency - very light for clarity */}
        <div 
          className="absolute top-0 left-0 w-full h-full z-[1]"
          style={{
            background: 'linear-gradient(to bottom, rgba(193, 241, 29, 0.05) 0%, rgba(168, 212, 20, 0.04) 50%, rgba(193, 241, 29, 0.06) 100%)',
            mixBlendMode: 'soft-light',
          }}
        ></div>
        
        {/* Dark overlay for better text readability - lighter for clarity */}
        <div 
          className="absolute top-0 left-0 w-full h-full z-[1]"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.35) 100%)',
          }}
        ></div>
        
        {/* Very subtle green accent for depth */}
        <div 
          className="absolute top-0 left-0 w-full h-full z-[1]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(193, 241, 29, 0.03) 0%, transparent 70%)',
          }}
        ></div>
        
        {/* Music Control Button */}
        <button
          onClick={toggleMusic}
          className="absolute top-24 right-4 sm:right-6 md:right-8 z-50 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl group"
          aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
        >
          {isMusicPlaying ? (
            <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-primary-400 transition-colors" />
          ) : (
            <VolumeX className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-primary-400 transition-colors" />
          )}
        </button>
        
        {/* Content Section - Top Left of Banner on Desktop, Bottom on Mobile */}
        <div className="absolute top-24 sm:top-28 left-4 sm:left-6 lg:left-8 z-10 max-w-2xl">
          <div className="text-left">
            {/* Animated Text */}
            {/* <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-12 mt-12 leading-tight animate-slide-up whitespace-nowrap">
              <span 
                className="rotating-text inline-block"
                style={{
                  fontWeight: 900,
                  fontSize: 'inherit',
                  lineHeight: 'inherit',
                  letterSpacing: '0.02em',
                  color: 'white',
                  textShadow: '0 0 20px rgba(193, 241, 29, 0.35), 0 0 40px rgba(193, 241, 29, 0.2)',
                  filter: 'drop-shadow(0 0 20px rgba(193, 241, 29, 0.3))',
                  textRendering: 'optimizeLegibility',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                }}
              >
                {displayedText}
              </span>
              <Car 
                className={`inline-block ml-2 ${isDeleting ? 'car-animate-back' : 'car-animate'}`}
                style={{
                  width: '1em',
                  height: '1em',
                  color: '#C1F11D',
                  opacity: 0.95,
                  filter: 'drop-shadow(0 0 15px rgba(193, 241, 29, 0.5)) drop-shadow(0 0 30px rgba(193, 241, 29, 0.3))',
                }}
              />
            </h1> */}
            
            {/* Description */}
            <p className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-8 sm:mb-12 font-semibold leading-tight" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)' }}>
              <span className="block">Transportation</span>
              <span className="block text-primary-300">available all the time.</span>
              <span className="block mt-4 text-xl sm:text-xl md:text-2xl font-normal opacity-95">Propose your fare. Choose your driver. Go.</span>
            </p>
            
            {/* Buttons - Hidden on mobile, shown at bottom */}
            <div className="hidden sm:flex flex-row gap-4 justify-start items-start">
              <Link href="/register">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="group w-auto px-8 py-5 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Book a Ride Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/signin">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group w-auto px-11 py-5 text-lg font-semibold border-2 border-white/60 text-white hover:bg-white/10 hover:border-primary-500 transition-all duration-300"
                >
                  Become a Driver
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Buttons - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-md">
          <div className="flex flex-row gap-3 max-w-md mx-auto">
            <Link href="/register" className="flex-1">
              <Button 
                variant="primary" 
                size="lg" 
                className="group w-full px-4 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Book a Ride Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/signin" className="flex-1">
              <Button 
                variant="outline" 
                size="lg" 
                className="group w-full px-4 py-4 text-base font-semibold border-2 border-white/80 text-white hover:bg-white/20 hover:border-primary-500 transition-all duration-300 bg-white/10"
              >
                Become a Driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-100/30 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 text-gray-900 font-bold text-sm mb-8 border border-primary-200/50 shadow-lg backdrop-blur-sm">
              ✨ Why Choose Alatoul?
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
              Experience the{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 animate-gradient">
                  Future of Mobility
                </span>
                <span className="absolute bottom-2 left-0 right-0 h-4 bg-primary-200/40 blur-xl -z-0"></span>
              </span>
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Revolutionary features designed to empower both riders and drivers with
              transparency, flexibility, and control
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden shadow-2xl border border-gray-100 hover:border-primary-300/50 transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm hover:shadow-primary-500/20"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 100}ms forwards`,
                  opacity: 0
                }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-400/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:via-primary-400/5 group-hover:to-primary-600/5 transition-all duration-500 pointer-events-none"></div>
                
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10"></div>
                
                <CardContent className="p-8 relative z-10">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-primary-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <feature.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    {/* Icon Glow */}
                    <div className="absolute top-0 left-0 w-16 h-16 bg-primary-400/30 rounded-2xl blur-xl group-hover:blur-2xl group-hover:bg-primary-500/50 transition-all duration-500 -z-10"></div>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Bottom Accent Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary-200/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary-300/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-transparent via-primary-100/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 text-gray-900 font-bold text-sm mb-8 border border-primary-200/50 shadow-lg backdrop-blur-sm">
              🚀 Simple Process
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
              How It{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 animate-gradient">
                  Works
                </span>
                <span className="absolute bottom-2 left-0 right-0 h-4 bg-primary-200/40 blur-xl -z-0"></span>
              </span>
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Get started in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 relative">
            {/* Animated Connection Line */}
            <div className="hidden md:block absolute top-20 left-[15%] right-[15%] h-1">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500 to-transparent rounded-full animate-pulse" style={{ width: '60%', left: '20%' }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400 to-transparent rounded-full" style={{ 
                  width: '60%', 
                  left: '20%',
                  animation: 'shimmer 3s ease-in-out infinite'
                }}></div>
              </div>
            </div>
            
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative text-center group"
                style={{
                  animation: `fadeInUp 0.8s ease-out ${index * 200}ms forwards`,
                  opacity: 0
                }}
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-100 group-hover:border-primary-300/50 shadow-lg group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 -z-10"></div>
                
                {/* Step Number Circle */}
                <div className="relative inline-flex items-center justify-center mb-8">
                  {/* Outer Glow Rings */}
                  <div className="absolute inset-0 bg-primary-400/30 rounded-full blur-2xl group-hover:bg-primary-500/40 transition-all duration-500 scale-150 group-hover:scale-175"></div>
                  <div className="absolute inset-0 bg-primary-300/20 rounded-full blur-xl group-hover:bg-primary-400/30 transition-all duration-500 scale-125 group-hover:scale-150"></div>
                  
                  {/* Main Circle */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-primary-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                    <span className="relative text-4xl sm:text-5xl font-black text-white drop-shadow-lg z-10">
                      {index + 1}
                    </span>
                    
                    {/* Inner Glow */}
                    <div className="absolute inset-2 bg-primary-400/50 rounded-full blur-md group-hover:blur-xl transition-all duration-500"></div>
                  </div>
                  
                  {/* Pulse Animation */}
                  <div className="absolute inset-0 border-4 border-primary-400/40 rounded-full animate-ping" style={{ animationDelay: `${index * 0.5}s` }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 px-4 pb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 group-hover:text-primary-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-sm mx-auto group-hover:text-gray-700 transition-colors duration-300">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
     
    </div>
  )
}

const features = [
  {
    icon: DollarSign,
    title: 'Fair Pricing',
    description:
      'Propose your own fare and negotiate with drivers for transparent, fair pricing that works for everyone.',
  },
  {
    icon: Clock,
    title: 'Available 24/7',
    description:
      'Get a ride anytime, anywhere. Our platform operates around the clock to serve your transportation needs.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description:
      'Verified drivers, real-time tracking, and integrated safety features ensure your peace of mind.',
  },
  {
    icon: MessageCircle,
    title: 'In-App Chat',
    description:
      'Communicate directly with your driver through secure in-app messaging for better coordination.',
  },
  {
    icon: MapPin,
    title: 'Live Tracking',
    description:
      'Track your ride in real-time and share your trip status with friends and family for added safety.',
  },
  {
    icon: Star,
    title: 'Community Ratings',
    description:
      'Rate your experience and help build a trusted community of riders and drivers.',
  },
  {
    icon: Calendar,
    title: 'Schedule Rides',
    description:
      'Book rides in advance for upcoming trips, commutes, or special occasions.',
  },
  {
    icon: Route,
    title: 'Long Distance',
    description:
      'Plan city-to-city trips with verified drivers for comfortable long-distance travel.',
  },
  {
    icon: TrendingUp,
    title: 'Flexible Earnings',
    description:
      'Drivers enjoy route autonomy, optimized matching, and maximize income with reduced idle time.',
  },
]

const steps = [
  {
    title: 'Set Your Destination',
    description: 'Enter where you want to go and propose your fare or let drivers bid.',
  },
  {
    title: 'Choose Your Driver',
    description: 'Review driver profiles, ratings, and negotiate the best price for your trip.',
  },
  {
    title: 'Ride & Pay',
    description: 'Enjoy your ride with live tracking and easy in-app payment upon arrival.',
  },
]

