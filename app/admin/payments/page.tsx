'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, Download, DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      setError('')
      // Note: Payments endpoint might be user-specific
      // For admin, we might need a separate endpoint or fetch all users' payments
      const response: any = await api.getAllPayments({ limit: 1000 })
      const paymentsList = Array.isArray(response) ? response : (response?.payments || response?.data || [])
      setPayments(paymentsList)
    } catch (err: any) {
      console.error('Failed to load payments:', err)
      // Don't show error if it's expected (endpoint might be user-specific)
      if (!err.message?.includes('user-specific')) {
        setError(err.message || 'Failed to load payments. Note: Payments endpoint may be user-specific.')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(
    (payment) =>
      payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.rideId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0)
  
  // Calculate platform fee (assuming 20% commission)
  const PLATFORM_FEE_RATE = 0.2
  const totalPlatformFee = totalRevenue * PLATFORM_FEE_RATE
  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(String(p.amount || 0)), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'failed':
      case 'refunded':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Monitor transactions and financial records</p>
        </div>
        <Button variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalPlatformFee)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-accent-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search payments by ID, user, or ride ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {error 
                  ? 'Payments endpoint may be user-specific. Backend modification may be needed for admin access.'
                  : 'No payments found'}
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Payment ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Ride ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Platform Fee
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                  {filteredPayments.map((payment) => {
                    const platformFee = parseFloat(String(payment.amount || 0)) * PLATFORM_FEE_RATE
                    return (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900">
                            {payment.id?.substring(0, 8)}...
                          </span>
                    </td>
                    <td className="py-4 px-4">
                          <span className="text-gray-700">
                            {payment.rideId ? `#${payment.rideId.substring(0, 8)}...` : 'N/A'}
                          </span>
                    </td>
                    <td className="py-4 px-4">
                          <span className="text-gray-700">
                            {payment.user?.name || payment.userId?.substring(0, 8) || 'N/A'}
                          </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">
                            {formatCurrency(parseFloat(String(payment.amount || 0)))}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                          <span className="text-gray-700">{formatCurrency(platformFee)}</span>
                    </td>
                    <td className="py-4 px-4">
                          <span className="text-gray-700">
                            {payment.method ? payment.method.replace('_', ' ').toUpperCase() : 'N/A'}
                          </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                      >
                            {payment.status || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {payment.createdAt ? formatDate(new Date(payment.createdAt)) : 'N/A'}
                          </span>
                    </td>
                  </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
