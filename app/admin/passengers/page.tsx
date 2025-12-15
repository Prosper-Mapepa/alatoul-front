'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Search, Filter, User, Mail, Phone, Ban, CheckCircle, Edit, Trash2, FileText, Eye, X, MapPin, Calendar, CreditCard } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function PassengersPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending' | 'verified'>('all')
  const [passengers, setPassengers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false)
  const [viewingKYC, setViewingKYC] = useState<any>(null)
  const [kycRejectionReason, setKycRejectionReason] = useState('')
  const [editingPassenger, setEditingPassenger] = useState<any>(null)
  const [kycDataMap, setKycDataMap] = useState<Record<string, any>>({})
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null)
  const [kycStatusUpdate, setKycStatusUpdate] = useState('')
  const [userStatusUpdate, setUserStatusUpdate] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'suspended' | 'pending',
  })

  useEffect(() => {
    // Check for search query from URL
    const urlSearch = searchParams?.get('search')
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
    loadPassengers()
  }, [filterStatus, searchParams])

  const loadPassengers = async () => {
    try {
      setLoading(true)
      setError('')
      const params: any = { role: 'passenger', limit: 1000 }
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }
      const response: any = await api.getAllUsers(params)
      const passengersList = Array.isArray(response) ? response : (response?.users || response?.data || [])
      setPassengers(passengersList)

      // Load KYC data for all passengers
      try {
        const allKYC = await api.getAllKYC()
        const kycList = Array.isArray(allKYC) ? allKYC : []
        const kycMap: Record<string, any> = {}
        kycList.forEach((kyc: any) => {
          const userId = kyc.userId || kyc.user?.id
          if (userId) {
            kycMap[userId] = kyc
          }
        })
        setKycDataMap(kycMap)
      } catch (err) {
        console.error('Failed to load KYC data:', err)
      }
    } catch (err: any) {
      console.error('Failed to load passengers:', err)
      setError(err.message || 'Failed to load passengers')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPassenger = (passenger: any) => {
    setEditingPassenger(passenger)
    setFormData({
      name: passenger.name || '',
      email: passenger.email || '',
      phone: passenger.phone || '',
      status: passenger.status || 'active',
    })
    setIsModalOpen(true)
  }

  const handleSavePassenger = async () => {
    try {
      setError('')
      if (editingPassenger) {
        await api.updateUser(editingPassenger.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })
        if (formData.status !== editingPassenger.status) {
          await api.updateUserStatus(editingPassenger.id, formData.status)
        }
        setIsModalOpen(false)
        await loadPassengers()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save passenger')
    }
  }

  const handleDeletePassenger = async (passengerId: string) => {
    if (!confirm('Are you sure you want to delete this passenger?')) return
    try {
      await api.deleteUser(passengerId)
      await loadPassengers()
    } catch (err: any) {
      setError(err.message || 'Failed to delete passenger')
    }
  }

  const handleToggleStatus = async (passenger: any) => {
    try {
      const newStatus = passenger.status === 'active' ? 'suspended' : 'active'
      await api.updateUserStatus(passenger.id, newStatus)
      await loadPassengers()
    } catch (err: any) {
      setError(err.message || 'Failed to update passenger status')
    }
  }

  const handleViewKYC = async (passenger: any) => {
    try {
      // Get full user details to ensure we have avatar
      const userDetails: any = await api.getUser(passenger.id)
      const kyc = await api.getKYCByUserId(passenger.id)
      setViewingKYC({ ...(userDetails || {}), ...(passenger || {}), kyc })
      setIsKYCModalOpen(true)
    } catch (err: any) {
      console.error('Failed to load KYC:', err)
      // Fallback to passenger data we already have
      const kyc = await api.getKYCByUserId(passenger.id).catch(() => null)
      setViewingKYC({ ...(passenger || {}), kyc })
      setIsKYCModalOpen(true)
    }
  }

  const handleApproveKYC = async () => {
    if (!viewingKYC) return
    try {
      await api.updateKYCStatus(viewingKYC.id, 'approved')
      await api.updateUserStatus(viewingKYC.id, 'verified')
      setIsKYCModalOpen(false)
      setViewingKYC(null)
      await loadPassengers()
    } catch (err: any) {
      setError(err.message || 'Failed to approve KYC')
    }
  }

  const handleRejectKYC = async () => {
    if (!viewingKYC || !kycRejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }
    try {
      await api.updateKYCStatus(viewingKYC.id, 'rejected', kycRejectionReason)
      setIsKYCModalOpen(false)
      setViewingKYC(null)
      setKycRejectionReason('')
      await loadPassengers()
    } catch (err: any) {
      setError(err.message || 'Failed to reject KYC')
    }
  }

  const handleUpdateKYCStatus = async () => {
    if (!viewingKYC || !kycStatusUpdate) return
    if (kycStatusUpdate === 'rejected' && !kycRejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }
    try {
      await api.updateKYCStatus(
        viewingKYC.id,
        kycStatusUpdate,
        kycStatusUpdate === 'rejected' ? kycRejectionReason : undefined
      )
      if (kycStatusUpdate === 'approved') {
        await api.updateUserStatus(viewingKYC.id, 'active')
      }
      // Refresh the data
      const userDetails: any = await api.getUser(viewingKYC.id)
      const kyc = await api.getKYCByUserId(viewingKYC.id)
      setViewingKYC({ ...(userDetails || {}), ...(viewingKYC || {}), kyc })
      setKycStatusUpdate('')
      setKycRejectionReason('')
      await loadPassengers()
    } catch (err: any) {
      setError(err.message || 'Failed to update KYC status')
    }
  }

  const handleUpdateUserStatusFromKYC = async () => {
    if (!viewingKYC || !userStatusUpdate) return
    try {
      await api.updateUserStatus(viewingKYC.id, userStatusUpdate)
      // Reload user and KYC data to reflect changes
      const userDetails: any = await api.getUser(viewingKYC.id)
      const kyc = await api.getKYCByUserId(viewingKYC.id)
      setViewingKYC({ ...(userDetails || {}), kyc })
      setUserStatusUpdate('')
      await loadPassengers()
    } catch (err: any) {
      setError(err.message || 'Failed to update user status')
    }
  }

  const filteredPassengers = passengers.filter((passenger) => {
    const matchesSearch =
      passenger.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passenger.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passenger.phone?.includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || passenger.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const activeCount = passengers.filter((p) => p.status === 'active').length
  const pendingCount = passengers.filter((p) => p.status === 'pending').length
  const verifiedCount = passengers.filter((p) => p.status === 'verified').length
  const suspendedCount = passengers.filter((p) => p.status === 'suspended').length

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passenger Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all passengers and their accounts</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Passengers</p>
                <p className="text-2xl font-bold text-gray-900">{passengers.length}</p>
              </div>
              <User className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search passengers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'verified' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('verified')}
                size="sm"
              >
                Verified
              </Button>
              <Button
                variant={filterStatus === 'suspended' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('suspended')}
                size="sm"
              >
                Suspended
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passengers Table */}
      <Card>
        <CardHeader className="px-4 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Passengers ({filteredPassengers.length})</CardTitle>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500">Loading passengers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Passenger</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      Contact
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Rides</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      Rating
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      KYC
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      Joined
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPassengers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        No passengers found
                      </td>
                    </tr>
                  ) : (
                    filteredPassengers.map((passenger) => {
                      const passengerKYC = kycDataMap[passenger.id]
                      return (
                        <tr
                          key={passenger.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 px-3">
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm text-gray-900 truncate">{passenger.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500 truncate">ID: {passenger.id.substring(0, 8)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center text-xs text-gray-700 truncate">
                                <Mail className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{passenger.email}</span>
                              </div>
                              {passenger.phone && (
                                <div className="flex items-center text-xs text-gray-600 truncate">
                                  <Phone className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{passenger.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-sm font-medium text-gray-900">{passenger.totalRides || 0}</span>
                          </td>
                          <td className="py-2 px-3">
                            {passenger.averageRating > 0 ? (
                              <span className="text-sm font-medium text-gray-900">
                                {parseFloat(String(passenger.averageRating)).toFixed(1)} ⭐
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                passenger.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : passenger.status === 'verified'
                                  ? 'bg-blue-100 text-blue-700'
                                  : passenger.status === 'suspended'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {passenger.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {passengerKYC ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                  passengerKYC.status === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : passengerKYC.status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {passengerKYC.status}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              {passenger.createdAt ? formatDate(new Date(passenger.createdAt)) : 'N/A'}
                            </span>
                          </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-end space-x-1">
                            {kycDataMap[passenger.id] && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewKYC(passenger)}
                                className="h-7 px-2"
                                title="Review KYC"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPassenger(passenger)}
                              className="h-7 px-2"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(passenger)}
                              className="h-7 px-2"
                              title={passenger.status === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {passenger.status === 'active' ? (
                                <Ban className="w-3.5 h-3.5 text-red-600" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePassenger(passenger.id)}
                              className="h-7 px-2 text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Passenger"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter passenger name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePassenger}>
              Update Passenger
            </Button>
          </div>
        </div>
      </Modal>

      {/* KYC Review Modal */}
      <Modal
        isOpen={isKYCModalOpen}
        onClose={() => {
          setIsKYCModalOpen(false)
          setViewingKYC(null)
          setKycRejectionReason('')
          setKycStatusUpdate('')
          setUserStatusUpdate('')
        }}
        title="KYC Review"
        size="xl"
      >
        {viewingKYC && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Profile Photo */}
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center overflow-hidden">
                {viewingKYC.avatar ? (
                  <img
                    src={viewingKYC.avatar}
                    alt={viewingKYC.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingKYC.name}</h2>
                <p className="text-gray-600">{viewingKYC.email}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    viewingKYC.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : viewingKYC.status === 'verified'
                      ? 'bg-blue-100 text-blue-700'
                      : viewingKYC.status === 'suspended'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {viewingKYC.status}
                </span>
              </div>
            </div>

            {/* Passenger Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Passenger Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{viewingKYC.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{viewingKYC.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{viewingKYC.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Rides</p>
                  <p className="font-semibold text-gray-900">{viewingKYC.totalRides || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="font-semibold text-gray-900">
                    {viewingKYC.averageRating ? parseFloat(String(viewingKYC.averageRating)).toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      viewingKYC.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : viewingKYC.status === 'verified'
                        ? 'bg-blue-100 text-blue-700'
                        : viewingKYC.status === 'suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {viewingKYC.status}
                  </span>
                </div>
              </div>
            </div>

            {viewingKYC.kyc ? (
              <>
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">First Name</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Name</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold text-gray-900">
                        {viewingKYC.kyc.dateOfBirth
                          ? formatDate(new Date(viewingKYC.kyc.dateOfBirth))
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nationality</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.nationality || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.city || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">State</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.state || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ZIP Code</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.zipCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.country || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* ID Verification */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ID Verification</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">ID Type</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.idType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID Number</p>
                      <p className="font-semibold text-gray-900">{viewingKYC.kyc.idNumber || 'N/A'}</p>
                    </div>
                    {viewingKYC.kyc.idExpiryDate && (
                      <div>
                        <p className="text-sm text-gray-600">ID Expiry Date</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(new Date(viewingKYC.kyc.idExpiryDate))}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingKYC.kyc.idFrontImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">ID Front</p>
                        <div
                          className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() =>
                            setViewingImage({
                              url: viewingKYC.kyc.idFrontImage,
                              title: 'ID Front',
                            })
                          }
                        >
                          <img
                            src={viewingKYC.kyc.idFrontImage}
                            alt="ID Front"
                            className="w-full h-32 object-contain rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                              ;(e.target as HTMLImageElement).parentElement!.innerHTML =
                                '<div class="w-full h-32 bg-gray-100 rounded flex items-center justify-center"><p class="text-gray-500 text-sm">Image not available</p></div>'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {viewingKYC.kyc.idBackImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">ID Back</p>
                        <div
                          className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() =>
                            setViewingImage({
                              url: viewingKYC.kyc.idBackImage,
                              title: 'ID Back',
                            })
                          }
                        >
                          <img
                            src={viewingKYC.kyc.idBackImage}
                            alt="ID Back"
                            className="w-full h-32 object-contain rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                              ;(e.target as HTMLImageElement).parentElement!.innerHTML =
                                '<div class="w-full h-32 bg-gray-100 rounded flex items-center justify-center"><p class="text-gray-500 text-sm">Image not available</p></div>'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information (for passengers) */}
                {(viewingKYC.kyc.bankName ||
                  viewingKYC.kyc.accountNumber ||
                  viewingKYC.kyc.mobileMoneyNumber) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {viewingKYC.kyc.bankName && (
                        <div>
                          <p className="text-sm text-gray-600">Bank Name</p>
                          <p className="font-semibold text-gray-900">{viewingKYC.kyc.bankName}</p>
                        </div>
                      )}
                      {viewingKYC.kyc.accountNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Account Number</p>
                          <p className="font-semibold text-gray-900">{viewingKYC.kyc.accountNumber}</p>
                        </div>
                      )}
                      {viewingKYC.kyc.accountHolderName && (
                        <div>
                          <p className="text-sm text-gray-600">Account Holder</p>
                          <p className="font-semibold text-gray-900">{viewingKYC.kyc.accountHolderName}</p>
                        </div>
                      )}
                      {viewingKYC.kyc.mobileMoneyNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Mobile Money</p>
                          <p className="font-semibold text-gray-900">
                            {viewingKYC.kyc.mobileMoneyNumber} ({viewingKYC.kyc.mobileMoneyProvider || 'N/A'})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* KYC Status and Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* KYC Status Update */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Status</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Current Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              viewingKYC.kyc.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : viewingKYC.kyc.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {viewingKYC.kyc.status}
                          </span>
                        </div>
                        {viewingKYC.kyc.rejectionReason && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                            <p className="text-sm text-gray-900 bg-red-50 border border-red-200 rounded p-2">
                              {viewingKYC.kyc.rejectionReason}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update KYC Status
                          </label>
                          <select
                            value={kycStatusUpdate || viewingKYC.kyc.status}
                            onChange={(e) => setKycStatusUpdate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        {kycStatusUpdate === 'rejected' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rejection Reason
                            </label>
                            <textarea
                              value={kycRejectionReason}
                              onChange={(e) => setKycRejectionReason(e.target.value)}
                              placeholder="Enter reason for rejection..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              rows={3}
                            />
                          </div>
                        )}
                        <Button
                          variant="primary"
                          onClick={handleUpdateKYCStatus}
                          disabled={!kycStatusUpdate || kycStatusUpdate === viewingKYC.kyc.status}
                          className="w-full"
                        >
                          Update KYC Status
                        </Button>
                      </div>
                    </div>

                    {/* User Status Update */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Status</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Current Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              viewingKYC.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : viewingKYC.status === 'verified'
                                ? 'bg-blue-100 text-blue-700'
                                : viewingKYC.status === 'suspended'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {viewingKYC.status}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update User Status
                          </label>
                          <select
                            value={userStatusUpdate || viewingKYC.status}
                            onChange={(e) => setUserStatusUpdate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="verified">Verified</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleUpdateUserStatusFromKYC}
                          disabled={!userStatusUpdate || userStatusUpdate === viewingKYC.status}
                          className="w-full"
                        >
                          Update User Status
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No KYC information available for this passenger.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <Modal
          isOpen={!!viewingImage}
          onClose={() => setViewingImage(null)}
          title={viewingImage.title}
          size="lg"
        >
          <div className="flex items-center justify-center p-4">
            <img
              src={viewingImage.url}
              alt={viewingImage.title}
              className="max-w-full max-h-96 object-contain rounded-lg"
              onError={(e) => {
                ;(e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<div class="text-center py-8 text-red-500">Failed to load image</div>'
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
