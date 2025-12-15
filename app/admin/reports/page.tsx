'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FileText, Download, Filter, Calendar, TrendingUp, AlertCircle } from 'lucide-react'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const reports = [
    {
      id: 1,
      title: 'User Activity Report',
      description: 'Comprehensive report on user registrations, activity, and engagement',
      type: 'user',
      generatedDate: '2024-01-15',
      period: 'Last 30 days',
    },
    {
      id: 2,
      title: 'Driver Performance Report',
      description: 'Analysis of driver performance, ratings, and earnings',
      type: 'driver',
      generatedDate: '2024-01-15',
      period: 'Last 30 days',
    },
    {
      id: 3,
      title: 'Revenue Report',
      description: 'Financial overview including revenue, fees, and transactions',
      type: 'financial',
      generatedDate: '2024-01-14',
      period: 'Last 30 days',
    },
    {
      id: 4,
      title: 'Safety Incidents Report',
      description: 'Safety reports, incidents, and resolution status',
      type: 'safety',
      generatedDate: '2024-01-13',
      period: 'Last 30 days',
    },
    {
      id: 5,
      title: 'Ride Statistics Report',
      description: 'Complete ride statistics including completion rates and trends',
      type: 'rides',
      generatedDate: '2024-01-12',
      period: 'Last 30 days',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate and download comprehensive reports</p>
        </div>
        <Button variant="primary">
          <FileText className="w-4 h-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} hover>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {report.generatedDate}
                    </div>
                    <span>•</span>
                    <span>{report.period}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                <Button variant="primary" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>User Activity</option>
                <option>Driver Performance</option>
                <option>Revenue & Financial</option>
                <option>Safety Incidents</option>
                <option>Ride Statistics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last 6 months</option>
                <option>Last year</option>
                <option>Custom range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="primary" className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

