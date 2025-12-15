'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Car,
  Navigation,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  FileText,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Passengers', href: '/admin/passengers', icon: Users },
  { label: 'Drivers', href: '/admin/drivers', icon: Car },
  { label: 'Rides', href: '/admin/rides', icon: Navigation },
  { label: 'Payments', href: '/admin/payments', icon: DollarSign },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Safety', href: '/admin/safety', icon: Shield },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">Alatoul</span>
            <p className="text-xs text-gray-600">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300',
                isActive
                  ? 'bg-primary-500 text-gray-900 font-semibold shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
              window.location.href = '/signin'
            }
          }}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

