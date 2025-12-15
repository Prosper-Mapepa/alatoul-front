'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  Search,
  Car,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  AlertCircle,
  FileText,
  Edit,
  Trash2,
  Eye,
  X,
  Image as ImageIcon,
  MapPin,
  Calendar,
  CreditCard,
  User,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'

export default function DriversPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'suspended'>('all')
  const [drivers, setDrivers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false)
  const [viewingDriverKYC, setViewingDriverKYC] = useState<any>(null)
  const [kycRejectionReason, setKycRejectionReason] = useState('')
  const [editingDriver, setEditingDriver] = useState<any>(null)
  const [kycStatusUpdate, setKycStatusUpdate] = useState('')
  const [userStatusUpdate, setUserStatusUpdate] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'suspended' | 'pending',
  })
  const [kycDataMap, setKycDataMap] = useState<Record<string, any>>({})
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    // Check for search query from URL
    const urlSearch = searchParams?.get('search')
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
    loadDrivers()
  }, [filterStatus, searchParams])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      setError('')
      const params: any = { role: 'driver', limit: 1000 }
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }
      const response: any = await api.getAllUsers(params)
      const driversList = Array.isArray(response) ? response : (response?.users || response?.data || [])
      setDrivers(driversList)

      // Load vehicles for all drivers
      try {
        const vehiclesList = await api.getAllVehicles()
        const vehiclesMap: Record<string, any> = {}
        if (Array.isArray(vehiclesList)) {
          vehiclesList.forEach((vehicle: any) => {
            if (vehicle.driverId) {
              vehiclesMap[vehicle.driverId] = vehicle
            }
          })
        }
        setVehicles(vehiclesMap)
      } catch (err) {
        console.error('Failed to load vehicles:', err)
      }

      // Load KYC data for all drivers
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

      // Load earnings for each driver
      for (const driver of driversList) {
        try {
          const earnings = await api.getEarnings()
          // Note: Earnings endpoint might be user-specific, so this might need adjustment
        } catch (err) {
          // Ignore earnings errors for now
        }
      }
    } catch (err: any) {
      console.error('Failed to load drivers:', err)
      setError(err.message || 'Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleEditDriver = (driver: any) => {
    setEditingDriver(driver)
    setFormData({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      status: driver.status || 'active',
    })
    setIsModalOpen(true)
  }

  const handleSaveDriver = async () => {
    try {
      setError('')
      if (editingDriver) {
        await api.updateUser(editingDriver.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })
        if (formData.status !== editingDriver.status) {
          await api.updateUserStatus(editingDriver.id, formData.status)
        }
        setIsModalOpen(false)
        await loadDrivers()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save driver')
    }
  }

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return
    try {
      await api.deleteUser(driverId)
      await loadDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to delete driver')
    }
  }

  const handleToggleStatus = async (driver: any) => {
    try {
      const newStatus = driver.status === 'active' ? 'suspended' : 'active'
      await api.updateUserStatus(driver.id, newStatus)
      await loadDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to update driver status')
    }
  }

  const handleApproveDriver = async (driver: any) => {
    try {
      await api.updateUserStatus(driver.id, 'active')
      // Also approve KYC if exists
      const kyc = kycDataMap[driver.id]
      if (kyc && kyc.status === 'pending') {
        await api.updateKYCStatus(driver.id, 'approved')
      }
      await loadDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to approve driver')
    }
  }

  const handleViewKYC = async (driver: any) => {
    try {
      // Get full user details to ensure we have avatar
      const userDetails = await api.getUser(driver.id)
      const kyc = await api.getKYCByUserId(driver.id)
      setViewingDriverKYC({ ...userDetails, ...driver, kyc })
      setIsKYCModalOpen(true)
    } catch (err: any) {
      console.error('Failed to load KYC:', err)
      // Fallback to driver data we already have
      const kyc = await api.getKYCByUserId(driver.id).catch(() => null)
      setViewingDriverKYC({ ...driver, kyc })
      setIsKYCModalOpen(true)
    }
  }

  const handleApproveKYC = async () => {
    if (!viewingDriverKYC) return
    try {
      await api.updateKYCStatus(viewingDriverKYC.id, 'approved')
      await api.updateUserStatus(viewingDriverKYC.id, 'verified')
      setIsKYCModalOpen(false)
      setViewingDriverKYC(null)
      await loadDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to approve KYC')
    }
  }

  const handleRejectKYC = async () => {
    if (!viewingDriverKYC || !kycRejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }
    try {
      await api.updateKYCStatus(viewingDriverKYC.id, 'rejected', kycRejectionReason)
      setIsKYCModalOpen(false)
      setViewingDriverKYC(null)
      setKycRejectionReason('')
      await loadDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to reject KYC')
    }
  }

  const handleUpdateKYCStatus = async () => {
    if (!viewingDriverKYC || !kycStatusUpdate) return
    if (kycStatusUpdate === 'rejected' && !kycRejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }
    try {
      await api.updateKYCStatus(
        viewingDriverKYC.id,
        kycStatusUpdate,
        kycStatusUpdate === 'rejected' ? kycRejectionReason : undefined
      )
      if (kycStatusUpdate === 'approved') {
        await api.updateUserStatus(viewingDriverKYC.id, 'active')
      }
      // Refresh the data
      const userDetails = await api.getUser(viewingDriverKYC.id)
      const kyc = await api.getKYCByUserId(viewingDriverKYC.id)
      setViewingDriverKYC({ ...userDetails, ...viewingDriverKYC, kyc })
      setKycStatusUpdate('')
      setKycRejectionReason('')
      await loadDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to update KYC status')
    }
  }

  const handleUpdateUserStatusFromKYC = async () => {
    if (!viewingDriverKYC || !userStatusUpdate) return
    try {
      await api.updateUserStatus(viewingDriverKYC.id, userStatusUpdate)
      // Reload user and KYC data to reflect changes
      const userDetails = await api.getUser(viewingDriverKYC.id)
      const kyc = await api.getKYCByUserId(viewingDriverKYC.id)
      setViewingDriverKYC({ ...userDetails, kyc })
      setUserStatusUpdate('')
      await loadDrivers()
    } catch (err: any) {
      setError(err.message || 'Failed to update user status')
    }
  }

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.includes(searchTerm) ||
      vehicles[driver.id]?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || driver.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getDriverVehicle = (driverId: string) => {
    const vehicle = vehicles[driverId]
    if (!vehicle) return null
    return {
      make: vehicle.make || 'N/A',
      model: vehicle.model || 'N/A',
      year: vehicle.year || '',
      licensePlate: vehicle.licensePlate || 'N/A',
      fullName: `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'No vehicle',
    }
  }

  const approvedCount = drivers.filter((d) => d.status === 'active').length
  const pendingCount = drivers.filter((d) => d.status === 'pending').length
  const suspendedCount = drivers.filter((d) => d.status === 'suspended').length

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage drivers, verifications, and approvals</p>
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
                <p className="text-sm text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
              </div>
              <Car className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
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
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-gray-900">{suspendedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
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
                  placeholder="Search drivers..."
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
                Approved
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                Pending
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

      {/* Drivers Table */}
      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-base">Drivers ({filteredDrivers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500">Loading drivers...</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Driver
                  </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Vehicle
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
                    <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No drivers found
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((driver) => {
                      const vehicle = getDriverVehicle(driver.id)
                      const isVerified = driver.status === 'active' || driver.status === 'verified'
                      const driverKYC = kycDataMap[driver.id]
                      return (
                  <tr
                    key={driver.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                          <td className="py-2 px-3">
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <Car className="w-4 h-4 text-white" />
                        </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-1">
                                  <p className="font-medium text-sm text-gray-900 truncate">{driver.name || 'N/A'}</p>
                                  {isVerified && (
                                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                                <p className="text-xs text-gray-500 truncate">{driver.email}</p>
                                {driver.phone && (
                                  <p className="text-xs text-gray-400 truncate">{driver.phone}</p>
                                )}
                        </div>
                      </div>
                    </td>
                          <td className="py-2 px-3">
                            {vehicle ? (
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">{vehicle.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">Plate: {vehicle.licensePlate}</p>
                      </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                    </td>
                          <td className="py-2 px-3">
                            <span className="text-sm font-medium text-gray-900">{driver.totalRides || 0}</span>
                    </td>
                          <td className="py-2 px-3">
                            {driver.averageRating > 0 ? (
                        <div className="flex items-center">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900">
                                  {parseFloat(String(driver.averageRating)).toFixed(1)}
                                </span>
                        </div>
                      ) : (
                              <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                          <td className="py-2 px-3">
                      <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                driver.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : driver.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>
                          <td className="py-2 px-3">
                            {driverKYC ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                  driverKYC.status === 'approved'
                                    ? 'bg-green-100 text-green-700'
                                    : driverKYC.status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {driverKYC.status}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center justify-end space-x-1 flex-wrap">
                              {kycDataMap[driver.id] && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewKYC(driver)}
                                  className="h-7 px-2"
                                  title="Review KYC"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              )}
                        {driver.status === 'pending' && (
                          <>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleApproveDriver(driver)}
                                    className="h-7 px-2 text-xs"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                                  {!kycDataMap[driver.id] && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleViewKYC(driver)}
                                      className="h-7 px-2"
                                      title="Review"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                            </Button>
                                  )}
                          </>
                        )}
                              {driver.status === 'active' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(driver)}
                                  className="h-7 px-2"
                                  title="Suspend"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        )}
                        {driver.status === 'suspended' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(driver)}
                                  className="h-7 px-2"
                                  title="Reactivate"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          </Button>
                        )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDriver(driver)}
                                className="h-7 px-2"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDriver(driver.id)}
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
        title="Edit Driver"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter driver name"
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
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveDriver}>
              Update Driver
            </Button>
          </div>
        </div>
      </Modal>

      {/* KYC Review Modal */}
      <Modal
        isOpen={isKYCModalOpen}
        onClose={() => {
          setIsKYCModalOpen(false)
          setViewingDriverKYC(null)
          setKycRejectionReason('')
          setKycStatusUpdate('')
          setUserStatusUpdate('')
        }}
        title="KYC Review"
        size="xl"
      >
        {viewingDriverKYC && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Profile Photo */}
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center overflow-hidden">
                {viewingDriverKYC.avatar ? (
                  <img
                    src={viewingDriverKYC.avatar}
                    alt={viewingDriverKYC.name}
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
                <h2 className="text-2xl font-bold text-gray-900">{viewingDriverKYC.name}</h2>
                <p className="text-gray-600">{viewingDriverKYC.email}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    viewingDriverKYC.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : viewingDriverKYC.status === 'suspended'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {viewingDriverKYC.status}
                </span>
              </div>
            </div>

            {/* Driver Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{viewingDriverKYC.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{viewingDriverKYC.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{viewingDriverKYC.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Rides</p>
                  <p className="font-semibold text-gray-900">{viewingDriverKYC.totalRides || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="font-semibold text-gray-900">
                    {viewingDriverKYC.averageRating ? parseFloat(String(viewingDriverKYC.averageRating)).toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      viewingDriverKYC.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : viewingDriverKYC.status === 'suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {viewingDriverKYC.status}
                  </span>
                </div>
              </div>
            </div>

            {viewingDriverKYC.kyc ? (
              <>
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">First Name</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Name</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-semibold text-gray-900">
                        {viewingDriverKYC.kyc.dateOfBirth
                          ? formatDate(new Date(viewingDriverKYC.kyc.dateOfBirth))
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nationality</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.nationality || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.city || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">State</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.state || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ZIP Code</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.zipCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.country || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* ID Verification */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ID Verification</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">ID Type</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.idType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID Number</p>
                      <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.idNumber || 'N/A'}</p>
                    </div>
                    {viewingDriverKYC.kyc.idExpiryDate && (
                      <div>
                        <p className="text-sm text-gray-600">ID Expiry Date</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(new Date(viewingDriverKYC.kyc.idExpiryDate))}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingDriverKYC.kyc.idFrontImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">ID Front</p>
                        <div
                          className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() =>
                            setViewingImage({
                              url: viewingDriverKYC.kyc.idFrontImage,
                              title: 'ID Front',
                            })
                          }
                        >
                          <img
                            src={viewingDriverKYC.kyc.idFrontImage}
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
                    {viewingDriverKYC.kyc.idBackImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">ID Back</p>
                        <div
                          className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() =>
                            setViewingImage({
                              url: viewingDriverKYC.kyc.idBackImage,
                              title: 'ID Back',
                            })
                          }
                        >
                          <img
                            src={viewingDriverKYC.kyc.idBackImage}
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

                {/* Driver License */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver License</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">License Number</p>
                      <p className="font-semibold text-gray-900">
                        {viewingDriverKYC.kyc.licenseNumber || 'N/A'}
                      </p>
                    </div>
                    {viewingDriverKYC.kyc.licenseExpiryDate && (
                      <div>
                        <p className="text-sm text-gray-600">License Expiry</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(new Date(viewingDriverKYC.kyc.licenseExpiryDate))}
                        </p>
                      </div>
                    )}
                    {viewingDriverKYC.kyc.licenseIssuedDate && (
                      <div>
                        <p className="text-sm text-gray-600">License Issued</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(new Date(viewingDriverKYC.kyc.licenseIssuedDate))}
                        </p>
                      </div>
                    )}
                  </div>
                  {viewingDriverKYC.kyc.licenseImage && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">License Image</p>
                      <div
                        className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-primary-500 transition-colors max-w-md"
                        onClick={() =>
                          setViewingImage({
                            url: viewingDriverKYC.kyc.licenseImage,
                            title: 'Driver License',
                          })
                        }
                      >
                        <img
                          src={viewingDriverKYC.kyc.licenseImage}
                          alt="License"
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

                {/* Vehicle Information */}
                {(viewingDriverKYC.kyc.vehicleMake ||
                  viewingDriverKYC.kyc.vehicleModel ||
                  viewingDriverKYC.kyc.vehiclePlateNumber) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Make</p>
                        <p className="font-semibold text-gray-900">
                          {viewingDriverKYC.kyc.vehicleMake || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Model</p>
                        <p className="font-semibold text-gray-900">
                          {viewingDriverKYC.kyc.vehicleModel || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Year</p>
                        <p className="font-semibold text-gray-900">
                          {viewingDriverKYC.kyc.vehicleYear || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Plate Number</p>
                        <p className="font-semibold text-gray-900">
                          {viewingDriverKYC.kyc.vehiclePlateNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {viewingDriverKYC.kyc.vehicleRegistrationImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Vehicle Registration</p>
                        <div
                          className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-primary-500 transition-colors max-w-md"
                          onClick={() =>
                            setViewingImage({
                              url: viewingDriverKYC.kyc.vehicleRegistrationImage,
                              title: 'Vehicle Registration',
                            })
                          }
                        >
                          <img
                            src={viewingDriverKYC.kyc.vehicleRegistrationImage}
                            alt="Vehicle Registration"
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
                )}

                {/* Payment Information */}
                {(viewingDriverKYC.kyc.bankName ||
                  viewingDriverKYC.kyc.accountNumber ||
                  viewingDriverKYC.kyc.mobileMoneyNumber) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {viewingDriverKYC.kyc.bankName && (
                        <div>
                          <p className="text-sm text-gray-600">Bank Name</p>
                          <p className="font-semibold text-gray-900">{viewingDriverKYC.kyc.bankName}</p>
                        </div>
                      )}
                      {viewingDriverKYC.kyc.accountNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Account Number</p>
                          <p className="font-semibold text-gray-900">
                            {viewingDriverKYC.kyc.accountNumber}
                          </p>
                        </div>
                      )}
                      {viewingDriverKYC.kyc.accountHolderName && (
                        <div>
                          <p className="text-sm text-gray-600">Account Holder</p>
                          <p className="font-semibold text-gray-900">
                            {viewingDriverKYC.kyc.accountHolderName}
                          </p>
                        </div>
                      )}
                      {viewingDriverKYC.kyc.mobileMoneyNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Mobile Money</p>
                          <p className="font-semibold text-gray-900">
                            {viewingDriverKYC.kyc.mobileMoneyNumber} (
                            {viewingDriverKYC.kyc.mobileMoneyProvider || 'N/A'})
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
                              viewingDriverKYC.kyc.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : viewingDriverKYC.kyc.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {viewingDriverKYC.kyc.status}
                          </span>
                        </div>
                        {viewingDriverKYC.kyc.rejectionReason && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                            <p className="text-sm text-gray-900 bg-red-50 border border-red-200 rounded p-2">
                              {viewingDriverKYC.kyc.rejectionReason}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update KYC Status
                          </label>
                          <select
                            value={kycStatusUpdate || viewingDriverKYC.kyc.status}
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
                          disabled={!kycStatusUpdate || kycStatusUpdate === viewingDriverKYC.kyc.status}
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
                              viewingDriverKYC.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : viewingDriverKYC.status === 'suspended'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {viewingDriverKYC.status}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update User Status
                          </label>
                          <select
                            value={userStatusUpdate || viewingDriverKYC.status}
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
                          disabled={!userStatusUpdate || userStatusUpdate === viewingDriverKYC.status}
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
                <p>No KYC information available for this driver.</p>
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
