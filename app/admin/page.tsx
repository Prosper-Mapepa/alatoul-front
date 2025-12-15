'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Users,
  Car,
  Navigation,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Star,
} from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { api } from '@/lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDrivers: 0,
    totalRides: 0,
    revenue: 0,
    pendingReports: 0,
    avgRating: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch data with individual error handling to prevent one failure from breaking everything
      let usersData: any = []
      let driversData: any = []
      let ridesData: any = []
      let userStats: any = null
      let rideStats: any = null

      try {
        usersData = await api.getAllUsers({ limit: 1000 }) as any
      } catch (err: any) {
        console.error('Failed to load users:', err)
        // Continue with empty array
      }

      try {
        driversData = await api.getAllUsers({ role: 'driver', limit: 1000 }) as any
      } catch (err: any) {
        console.error('Failed to load drivers:', err)
        // Continue with empty array
      }

      try {
        ridesData = await api.getAllRides({ limit: 1000 }) as any
      } catch (err: any) {
        console.error('Failed to load rides:', err)
        // Continue with empty array
      }

      try {
        userStats = await api.getUserStatistics()
      } catch (err: any) {
        console.error('Failed to load user statistics:', err)
        // Continue with null
      }

      try {
        rideStats = await api.getRideStatistics()
      } catch (err: any) {
        console.error('Failed to load ride statistics:', err)
        // Continue with null
      }

      // Process users
      const users = Array.isArray(usersData) ? usersData : (usersData?.users || usersData?.data || [])
      const drivers = Array.isArray(driversData) ? driversData : (driversData?.users || driversData?.data || [])
      const activeDrivers = drivers.filter((d: any) => d.isOnline === true && d.status === 'active').length

      // Process rides
      const rides = Array.isArray(ridesData) ? ridesData : (ridesData?.rides || ridesData?.data || [])
      const completedRides = rides.filter((r: any) => r.status === 'completed')
      const revenue = completedRides.reduce((sum: number, ride: any) => {
        const fare = parseFloat(String(ride.finalFare || ride.acceptedFare || ride.proposedFare || 0))
        return sum + fare
      }, 0)

      // Calculate average rating
      const allUsersWithRating = [...users, ...drivers].filter((u: any) => u.averageRating > 0)
      const avgRating = allUsersWithRating.length > 0
        ? allUsersWithRating.reduce((sum: number, u: any) => sum + parseFloat(String(u.averageRating || 0)), 0) / allUsersWithRating.length
        : 0

      // Get recent activities from recent rides
      const recentRides = rides
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((ride: any) => ({
          type: 'ride',
          title: `Ride ${ride.status === 'completed' ? 'completed' : ride.status}`,
          description: `${ride.passenger?.name || 'Passenger'} ${ride.status === 'completed' ? 'completed' : 'requested'} a ride from ${ride.pickupLocation} to ${ride.destination}`,
          time: getTimeAgo(new Date(ride.createdAt)),
          status: ride.status === 'completed' ? 'success' : ride.status === 'cancelled' ? 'warning' : 'pending',
        }))

      setStats({
        totalUsers: users.length,
        activeDrivers,
        totalRides: rides.length,
        revenue,
        pendingReports: 0, // TODO: Implement reports system
        avgRating,
      })

      setRecentActivities(recentRides)

      // Show warning if some data failed to load
      if ((!usersData || usersData.length === 0) && (!driversData || driversData.length === 0) && (!ridesData || ridesData.length === 0)) {
        setError('Unable to load dashboard data. Please check your connection and try again.')
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const dashboardStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+0%', // TODO: Calculate from historical data
      trend: 'up' as const,
      icon: Users,
      color: 'primary',
    },
    {
      title: 'Active Drivers',
      value: stats.activeDrivers.toLocaleString(),
      change: '+0%', // TODO: Calculate from historical data
      trend: 'up' as const,
      icon: Car,
      color: 'accent',
    },
    {
      title: 'Total Rides',
      value: stats.totalRides.toLocaleString(),
      change: '+0%', // TODO: Calculate from historical data
      trend: 'up' as const,
      icon: Navigation,
      color: 'primary',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue),
      change: '+0%', // TODO: Calculate from historical data
      trend: 'up' as const,
      icon: DollarSign,
      color: 'accent',
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports.toString(),
      change: '0%',
      trend: 'down' as const,
      icon: AlertCircle,
      color: 'primary',
    },
    {
      title: 'Avg Rating',
      value: stats.avgRating.toFixed(1),
      change: '+0.0',
      trend: 'up' as const,
      icon: Star,
      color: 'accent',
    },
  ]
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard Overview</h1>
          <p className="text-lg text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard Overview</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard Overview</h1>
        <p className="text-lg text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="border border-gray-200 hover:border-primary-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary-500 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-gray-900" />
                </div>
                <div
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    stat.trend === 'up'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activities</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:border-primary-500 hover:bg-gray-50 transition-all duration-300 bg-white"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.status === 'success'
                        ? 'bg-green-50'
                        : activity.status === 'warning'
                        ? 'bg-yellow-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    {activity.type === 'ride' && (
                      <Navigation
                        className={`w-5 h-5 ${
                          activity.status === 'success' ? 'text-green-600' : 'text-blue-600'
                        }`}
                      />
                    )}
                    {activity.type === 'driver' && (
                      <Car className="w-5 h-5 text-blue-600" />
                    )}
                    {activity.type === 'user' && (
                      <Users className="w-5 h-5 text-green-600" />
                    )}
                    {activity.type === 'safety' && (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <a href="/admin/users" className="p-5 border border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 text-center group">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-primary-500 transition-colors" />
                <p className="text-sm font-medium text-gray-700">Manage Users</p>
              </a>
              <a href="/admin/drivers" className="p-5 border border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 text-center group">
                <Car className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-primary-500 transition-colors" />
                <p className="text-sm font-medium text-gray-700">Manage Drivers</p>
              </a>
              <a href="/admin/rides" className="p-5 border border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 text-center group">
                <Navigation className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-primary-500 transition-colors" />
                <p className="text-sm font-medium text-gray-700">View Rides</p>
              </a>
              <a href="/admin/safety" className="p-5 border border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 text-center group">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-primary-500 transition-colors" />
                <p className="text-sm font-medium text-gray-700">Safety Reports</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">Ride Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
              <p className="text-gray-500 text-sm">Chart: Ride trends over time</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-900">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
              <p className="text-gray-500 text-sm">Chart: Revenue breakdown by category</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

