'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Search,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Car,
  MessageSquare,
  Phone,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function SafetyPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'investigating' | 'resolved'>(
    'all'
  )

  const reports = [
    {
      id: 'SAF-001',
      user: 'John Doe',
      driver: 'Sarah Miller',
      rideId: 1002,
      type: 'Safety Concern',
      description: 'Driver was driving too fast and ignoring traffic rules',
      status: 'investigating',
      priority: 'high',
      reportedDate: new Date(2024, 0, 15, 16, 30),
      resolution: null,
    },
    {
      id: 'SAF-002',
      user: 'Jane Smith',
      driver: 'Mike Thompson',
      rideId: 1003,
      type: 'Inappropriate Behavior',
      description: 'Driver made inappropriate comments during the ride',
      status: 'open',
      priority: 'medium',
      reportedDate: new Date(2024, 0, 14, 10, 15),
      resolution: null,
    },
    {
      id: 'SAF-003',
      user: 'Mike Johnson',
      driver: 'John Driver',
      rideId: 1001,
      type: 'Vehicle Condition',
      description: 'Vehicle was not clean and had mechanical issues',
      status: 'resolved',
      priority: 'low',
      reportedDate: new Date(2024, 0, 12, 14, 20),
      resolution: 'Driver warned and vehicle inspected',
    },
    {
      id: 'SAF-004',
      user: 'Sarah Williams',
      driver: 'John Driver',
      rideId: 1004,
      type: 'Emergency',
      description: 'Rider felt unsafe during the trip',
      status: 'investigating',
      priority: 'high',
      reportedDate: new Date(2024, 0, 15, 12, 45),
      resolution: null,
    },
  ]

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.driver.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700'
      case 'investigating':
        return 'bg-yellow-100 text-yellow-700'
      case 'open':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety Management</h1>
          <p className="text-gray-600 mt-1">Monitor and resolve safety reports and incidents</p>
        </div>
        <Button variant="primary">
          <Shield className="w-4 h-4 mr-2" />
          Emergency Dashboard
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter((r) => r.status === 'open').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Investigating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter((r) => r.status === 'investigating').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter((r) => r.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
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
                  placeholder="Search reports by ID, user, or driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('open')}
              >
                Open
              </Button>
              <Button
                variant={filterStatus === 'investigating' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('investigating')}
              >
                Investigating
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('resolved')}
              >
                Resolved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} hover>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-bold text-gray-900">{report.id}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}
                    >
                      {report.priority} priority
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.type}</h3>
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Ride ID</p>
                      <p className="font-medium text-gray-900">#{report.rideId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reported By</p>
                      <p className="font-medium text-gray-900">{report.user}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Driver</p>
                      <p className="font-medium text-gray-900">{report.driver}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reported Date</p>
                      <p className="font-medium text-gray-900">{formatDate(report.reportedDate)}</p>
                    </div>
                  </div>
                  {report.resolution && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-1">Resolution:</p>
                      <p className="text-sm text-green-700">{report.resolution}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                {report.status !== 'resolved' && (
                  <>
                    <Button variant="primary" size="sm">
                      Start Investigation
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact User
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact Driver
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" className="ml-auto">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

