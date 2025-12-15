'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, Filter, MapPin, Navigation, Clock, DollarSign, User, Car, Trash2, Eye } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { api } from '@/lib/api'

export default function RidesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
  >('all')
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRides()
  }, [filterStatus])

  const loadRides = async () => {
    try {
      setLoading(true)
      setError('')
      const params: any = { limit: 1000 }
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }
      const response: any = await api.getAllRides(params)
      const ridesList = Array.isArray(response) ? response : (response?.rides || response?.data || [])
      setRides(ridesList)
    } catch (err: any) {
      console.error('Failed to load rides:', err)
      setError(err.message || 'Failed to load rides')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRide = async (rideId: string) => {
    if (!confirm('Are you sure you want to delete this ride?')) return
    try {
      await api.deleteRide(rideId)
      await loadRides()
    } catch (err: any) {
      setError(err.message || 'Failed to delete ride')
    }
  }

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.passenger?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || ride.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in_progress':
      case 'driver_assigned':
      case 'driver_arrived':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
      case 'accepted':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const completedCount = rides.filter((r) => r.status === 'completed').length
  const inProgressCount = rides.filter((r) => 
    r.status === 'in_progress' || r.status === 'driver_assigned' || r.status === 'driver_arrived'
  ).length
  const totalRevenue = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => {
      const fare = parseFloat(String(r.finalFare || r.acceptedFare || r.proposedFare || 0))
      return sum + fare
    }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ride Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all rides on the platform</p>
        </div>
        <Button variant="primary">
          <Filter className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rides</p>
                <p className="text-2xl font-bold text-gray-900">{rides.length}</p>
              </div>
              <Navigation className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
              </div>
              <Navigation className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search rides by ID, rider, or driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('in_progress')}
              >
                In Progress
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </Button>
              <Button
                variant={filterStatus === 'cancelled' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('cancelled')}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rides List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading rides...</p>
          </CardContent>
        </Card>
      ) : (
      <div className="space-y-4">
          {filteredRides.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No rides found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRides.map((ride) => (
          <Card key={ride.id} hover>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Ride ID</p>
                          <p className="text-lg font-bold text-gray-900">#{ride.id.substring(0, 8)}...</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {formatStatus(ride.status)}
                    </span>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="text-sm font-medium text-gray-900">
                            {ride.createdAt ? formatDate(new Date(ride.createdAt)) : 'N/A'} at{' '}
                            {ride.createdAt ? formatTime(new Date(ride.createdAt)) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Pickup</p>
                              <p className="text-sm font-medium text-gray-900">{ride.pickupLocation || 'N/A'}</p>
                        </div>
                      </div>
                      <Navigation className="w-4 h-4 text-gray-400 ml-1" />
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-accent-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Destination</p>
                              <p className="text-sm font-medium text-gray-900">{ride.destination || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Rider:</span>
                        </div>
                            <span className="text-sm font-medium text-gray-900">
                              {ride.passenger?.name || 'N/A'}
                            </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Driver:</span>
                        </div>
                            <span className="text-sm font-medium text-gray-900">
                              {ride.driver?.name || 'Not assigned'}
                            </span>
                      </div>
                          {ride.distance && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Distance:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {parseFloat(String(ride.distance)).toFixed(2)} km
                              </span>
                      </div>
                          )}
                          {ride.estimatedDuration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {ride.estimatedDuration} min
                              </span>
                      </div>
                          )}
                    </div>
                  </div>
                </div>

                <div className="ml-6 text-right">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Fare</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                            parseFloat(String(ride.finalFare || ride.acceptedFare || ride.proposedFare || 0))
                          )}
                        </p>
                  </div>
                      <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRide(ride.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                </div>
              </div>
            </CardContent>
          </Card>
            ))
          )}
      </div>
      )}
    </div>
  )
}
