'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart3, TrendingUp, Download, Filter } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Deep insights into platform performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="primary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-2">Growth Rate</p>
            <p className="text-2xl font-bold text-gray-900">+24.5%</p>
            <div className="flex items-center mt-2 text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">vs last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-2">User Retention</p>
            <p className="text-2xl font-bold text-gray-900">78%</p>
            <div className="flex items-center mt-2 text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+5% vs last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-2">Avg Ride Value</p>
            <p className="text-2xl font-bold text-gray-900">$24.50</p>
            <div className="flex items-center mt-2 text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+$2.30 vs last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-2">Driver Utilization</p>
            <p className="text-2xl font-bold text-gray-900">68%</p>
            <div className="flex items-center mt-2 text-yellow-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+3% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>User growth chart</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ride Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Ride volume trends chart</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Revenue analysis chart</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Geographic distribution map</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Peak Hours</p>
              <p className="text-lg font-semibold text-gray-900">8:00 AM - 10:00 AM</p>
              <p className="text-sm text-gray-500 mt-1">and 5:00 PM - 7:00 PM</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Most Popular Routes</p>
              <p className="text-lg font-semibold text-gray-900">Downtown → Airport</p>
              <p className="text-sm text-gray-500 mt-1">15.2% of all rides</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Avg Response Time</p>
              <p className="text-lg font-semibold text-gray-900">2.3 minutes</p>
              <p className="text-sm text-gray-500 mt-1">Driver acceptance time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

