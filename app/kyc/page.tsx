'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Car,
  User,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Camera,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react'
import { api } from '@/lib/api'

export default function KYCPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountType = searchParams?.get('type') || 'passenger'

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    nationality: '',
    idType: '',
    idNumber: '',
    
    // Driver specific
    licenseNumber: '',
    licenseExpiry: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    insuranceProvider: '',
    insuranceNumber: '',
    insuranceExpiry: '',
    bankName: '',
    bankAccount: '',
    bankRouting: '',
    accountHolderName: '',
    mobileMoneyNumber: '',
    mobileMoneyProvider: '',
  })

  const [files, setFiles] = useState<any>({
    idFront: null as File | null,
    idBack: null as File | null,
    licenseFront: null as File | null,
    vehicleRegistration: null as File | null,
    insuranceDocument: null as File | null,
    profilePhoto: null as File | null,
  })

  const [userInfo, setUserInfo] = useState<{ name: string; email: string; phone: string } | null>(null)

  useEffect(() => {
    // Load user data and KYC data
    loadUserData()
    loadKYCData()
  }, [])

  const loadUserData = async () => {
    try {
      const user: any = await api.getCurrentUser()
      if (user) {
        const userData: any = {
          name: (user as any).name || '',
          email: (user as any).email || '',
          phone: (user as any).phone || '',
        }
        setUserInfo(userData)

        // Prepopulate name fields if not already set
        if (user.name && !formData.firstName && !formData.lastName) {
          // Split name into first and last name
          const nameParts = user.name.trim().split(/\s+/)
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          setFormData(prev => ({
            ...prev,
            firstName: prev.firstName || firstName,
            lastName: prev.lastName || lastName,
          }))
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    }
  }

  const loadKYCData = async () => {
    try {
      // First, load user data to prepopulate
      const user: any = await api.getCurrentUser()
      if (user) {
        const userData: any = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        }
        setUserInfo(userData)

        // Split name if available
        if (user.name && !formData.firstName && !formData.lastName) {
          const nameParts = user.name.trim().split(/\s+/)
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          setFormData(prev => ({
            ...prev,
            firstName: prev.firstName || firstName,
            lastName: prev.lastName || lastName,
          }))
        }
      }

      // Then, try to load existing KYC data
      const kycData: any = await api.getKYC()
      if (kycData) {
        // Populate form with existing KYC data (overrides user data if present)
        setFormData(prev => ({
          ...prev,
          firstName: kycData.firstName || prev.firstName || '',
          lastName: kycData.lastName || prev.lastName || '',
          dateOfBirth: kycData.dateOfBirth || '',
          address: kycData.address || '',
          city: kycData.city || '',
          state: kycData.state || '',
          zipCode: kycData.zipCode || '',
          country: kycData.country || '',
          nationality: kycData.nationality || '',
          idType: kycData.idType || '',
          idNumber: kycData.idNumber || '',
          licenseNumber: kycData.licenseNumber || '',
          vehicleMake: kycData.vehicleMake || '',
          vehicleModel: kycData.vehicleModel || '',
          bankAccount: kycData.accountNumber || '',
        }))
      }
      // If kycData is null (404), silently continue - this is normal for new users
    } catch (err: any) {
      // Only log unexpected errors (404 is expected for new users and is already handled in getKYC)
      if (err?.statusCode !== 404 && !err?.message?.includes('404') && !err?.message?.toLowerCase().includes('not found')) {
        console.error('Error loading KYC data:', err)
      }
      // Always try to load user data even if KYC fails
      loadUserData()
    }
  }

  const totalSteps = accountType === 'driver' ? 5 : 3

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFiles({
      ...files,
      [field]: file,
    })
  }

  const handleNext = async () => {
    setError('')
    
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.dateOfBirth || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        setError('Please fill in all required fields')
        return
      }
      // Save step 1 data
      try {
        setIsLoading(true)
        await api.updateKYC({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to save data. Please try again.')
        setIsLoading(false)
        return
      }
    } else if (currentStep === 2) {
      if (!formData.idType || !formData.idNumber || !files.idFront) {
        setError('Please fill in all required fields and upload ID front image')
        return
      }
      // Save step 2 data
      try {
        setIsLoading(true)
        await api.updateKYC({
          idType: formData.idType,
          idNumber: formData.idNumber,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to save data. Please try again.')
        setIsLoading(false)
        return
      }
    } else if (currentStep === 3 && accountType === 'driver') {
      if (!formData.licenseNumber || !formData.licenseExpiry || !files.licenseFront) {
        setError('Please fill in all required fields and upload license image')
        return
      }
      // Save step 3 data
      try {
        setIsLoading(true)
        await api.updateKYC({
          licenseNumber: formData.licenseNumber,
          licenseExpiryDate: formData.licenseExpiry,
        })
      } catch (err: any) {
        setError(err.message || 'Failed to save data. Please try again.')
        setIsLoading(false)
        return
      }
    } else if ((currentStep === 4 && accountType === 'driver') || (currentStep === 3 && accountType === 'passenger')) {
      // Payment step - no validation needed for passenger
      if (accountType === 'driver') {
        if (!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear || !formData.vehiclePlate) {
          setError('Please fill in all vehicle information')
          return
        }
        // Save vehicle data
        try {
          setIsLoading(true)
          await api.registerVehicle({
            make: formData.vehicleMake,
            model: formData.vehicleModel,
            year: parseInt(formData.vehicleYear),
            plateNumber: formData.vehiclePlate,
            type: 'sedan', // Default, can be enhanced
          })
        } catch (err: any) {
          setError(err.message || 'Failed to save vehicle data. Please try again.')
          setIsLoading(false)
          return
        }
      }
    }
    
    setIsLoading(false)
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Final KYC submission
      const kycPayload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country || 'US',
        idType: formData.idType,
        idNumber: formData.idNumber,
      }

      if (accountType === 'driver') {
        kycPayload.licenseNumber = formData.licenseNumber
        kycPayload.licenseExpiryDate = formData.licenseExpiry
        kycPayload.vehicleMake = formData.vehicleMake
        kycPayload.vehicleModel = formData.vehicleModel
        kycPayload.vehicleYear = formData.vehicleYear
        kycPayload.vehiclePlateNumber = formData.vehiclePlate
        
        if (formData.bankAccount) {
          kycPayload.bankName = formData.bankName
          kycPayload.accountNumber = formData.bankAccount
          kycPayload.accountHolderName = formData.accountHolderName
        }
        if (formData.mobileMoneyNumber) {
          kycPayload.mobileMoneyNumber = formData.mobileMoneyNumber
          kycPayload.mobileMoneyProvider = formData.mobileMoneyProvider
        }
      }

      await api.updateKYC(kycPayload)

      // Redirect to dashboard after successful KYC
      // Get current user to check role
      try {
        const currentUser: any = await api.getCurrentUser()
        if (currentUser?.role === 'admin') {
          router.push('/admin')
        } else if (accountType === 'driver' || currentUser?.role === 'driver') {
          router.push('/driver')
        } else {
          router.push('/dashboard')
        }
      } catch (err) {
        // Fallback to account type if user fetch fails
      if (accountType === 'driver') {
        router.push('/driver')
      } else {
        router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete setup. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 sm:w-9 sm:h-9 text-gray-900" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
            Complete Your {accountType === 'driver' ? 'Driver' : 'Passenger'} Profile
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Help us verify your identity and set up your {accountType === 'driver' ? 'driver' : 'passenger'} account
          </p>
        </div>

        {/* KYC Form Container */}
        <Card className="border border-gray-200 shadow-lg">
          {/* Progress Steps - Inside Card Header */}
          <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="relative w-full">
              {/* Connecting Lines Background */}
              <div className="absolute top-5 sm:top-6 left-0 right-0 h-1 bg-gray-200" style={{ marginLeft: '5%', marginRight: '5%', width: '90%' }}></div>
              
              {/* Active Progress Line */}
              {currentStep > 1 && (
                <div
                  className="absolute top-5 sm:top-6 h-1 bg-primary-500 transition-all duration-300"
                  style={{
                    left: '5%',
                    width: `${((currentStep - 1) / (totalSteps - 1)) * 90}%`,
                  }}
                ></div>
              )}
              
              {/* Steps Container - Evenly Distributed */}
              <div className="relative flex items-start justify-between w-full" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    {/* Step Circle */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-base sm:text-lg shrink-0 relative z-10 ${
                        index + 1 < currentStep
                          ? 'bg-primary-500 text-gray-900'
                          : index + 1 === currentStep
                          ? 'bg-primary-500 text-gray-900'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1 < currentStep ? (
                        <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <span className={`mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-center leading-tight ${
                      index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {accountType === 'driver'
                        ? ['Personal Info', 'ID Verification', 'License', 'Vehicle', 'Payment'][index]
                        : ['Personal Info', 'ID Verification', 'Payment'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">Personal Information</h2>
                    
                    {/* Pre-filled info from registration */}
                    {/* {userInfo && (userInfo.email || userInfo.phone) && (
                      <div className="mb-6 p-5 sm:p-6 bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl shadow-sm w-full">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                          <p className="text-sm font-semibold text-gray-900">
                            Information from your registration
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          {userInfo.email && (
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={userInfo.email}
                                disabled
                                className="w-full text-sm text-gray-900 font-medium bg-white/80 px-3 py-2.5 rounded-lg border border-primary-200/50 cursor-not-allowed opacity-75"
                              />
                            </div>
                          )}
                          {userInfo.phone && (
                            <div className="space-y-1.5">
                              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={userInfo.phone}
                                disabled
                                className="w-full text-sm text-gray-900 font-medium bg-white/80 px-3 py-2.5 rounded-lg border border-primary-200/50 cursor-not-allowed opacity-75"
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-primary-200/50">
                          <p className="text-xs text-gray-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary-600" />
                            <span>This information is already verified from your registration</span>
                          </p>
                        </div>
                      </div>
                    )} */}
                    
                    <div className="mb-6">
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Profile Photo <span className="text-xs text-gray-500">(JPG, PNG up to 5MB)</span>
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="profilePhoto"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              // Validate file size (5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                alert('File size must be less than 5MB');
                                e.target.value = ''; // Reset input
                                return;
                              }
                              // Validate file type
                              if (!file.type.startsWith('image/')) {
                                alert('Please select an image file');
                                e.target.value = ''; // Reset input
                                return;
                              }
                              handleFileChange('profilePhoto', file);
                            }
                          }}
                        />
                        <label 
                          htmlFor="profilePhoto" 
                          className="cursor-pointer shrink-0"
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-primary-500 transition-colors">
                            {files.profilePhoto ? (
                              <img
                                src={URL.createObjectURL(files.profilePhoto)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            )}
                          </div>
                        </label>
                        {/* <div className="flex-1 min-w-0">
                          <label htmlFor="profilePhoto">
                            <Button 
                              variant="outline" 
                              type="button" 
                              className="font-semibold cursor-pointer w-full sm:w-auto"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                document.getElementById('profilePhoto')?.click();
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Photo
                            </Button>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                        </div> */}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <Input
                        label="First Name"
                        type="text"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-primary-50 "
                      />
                      <Input
                        label="Last Name"
                        type="text"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-primary-50"
                      />
                      <Input
                        label="Date of Birth"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Address"
                        type="text"
                        name="address"
                        placeholder="Street address"
                        // icon={<MapPin className="w-5 h-5" />}
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="City"
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="State/Province"
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="ZIP/Postal Code"
                        type="text"
                        name="zipCode"
                        placeholder="ZIP code"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: ID Verification */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Identity Verification</h2>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Type
                      </label>
                      <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select ID Type</option>
                        <option value="passport">Passport</option>
                        <option value="drivers-license">Driver's License</option>
                        <option value="national-id">National ID</option>
                      </select>
                    </div>

                    <Input
                      label="ID Number"
                      type="text"
                      name="idNumber"
                      placeholder="Enter ID number"
                      icon={<FileText className="w-5 h-5" />}
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 w-full">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          ID Front Side
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="idFront"
                            onChange={(e) => handleFileChange('idFront', e.target.files?.[0] || null)}
                          />
                          <label htmlFor="idFront" className="cursor-pointer">
                            {files.idFront ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                                <p className="text-sm font-medium text-gray-900">{files.idFront.name}</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm font-medium text-gray-700">Upload ID Front</p>
                                <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          ID Back Side
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="idBack"
                            onChange={(e) => handleFileChange('idBack', e.target.files?.[0] || null)}
                          />
                          <label htmlFor="idBack" className="cursor-pointer">
                            {files.idBack ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                                <p className="text-sm font-medium text-gray-900">{files.idBack.name}</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm font-medium text-gray-700">Upload ID Back</p>
                                <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Driver License (Driver only) */}
              {currentStep === 3 && accountType === 'driver' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Driver's License</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <Input
                        label="License Number"
                        type="text"
                        name="licenseNumber"
                        placeholder="Enter license number"
                        icon={<FileText className="w-5 h-5" />}
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                      />
                      <Input
                        label="Expiry Date"
                        type="date"
                        name="licenseExpiry"
                        icon={<Calendar className="w-5 h-5" />}
                        value={formData.licenseExpiry}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 w-full">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          License Front
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="licenseFront"
                            onChange={(e) => handleFileChange('licenseFront', e.target.files?.[0] || null)}
                          />
                          <label htmlFor="licenseFront" className="cursor-pointer">
                            {files.licenseFront ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                                <p className="text-sm font-medium text-gray-900">{files.licenseFront.name}</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm font-medium text-gray-700">Upload License Front</p>
                                <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          License Back
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="licenseBack"
                            onChange={(e) => handleFileChange('licenseBack', e.target.files?.[0] || null)}
                          />
                          <label htmlFor="licenseBack" className="cursor-pointer">
                            {files.licenseBack ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                                <p className="text-sm font-medium text-gray-900">{files.licenseBack.name}</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm font-medium text-gray-700">Upload License Back</p>
                                <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Vehicle Information (Driver only) */}
              {currentStep === 4 && accountType === 'driver' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Vehicle Information</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <Input
                        label="Vehicle Make"
                        type="text"
                        name="vehicleMake"
                        placeholder="e.g., Toyota"
                        icon={<Car className="w-5 h-5" />}
                        value={formData.vehicleMake}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      <Input
                        label="Vehicle Model"
                        type="text"
                        name="vehicleModel"
                        placeholder="e.g., Camry"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      <Input
                        label="Year"
                        type="number"
                        name="vehicleYear"
                        placeholder="e.g., 2020"
                        value={formData.vehicleYear}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      <Input
                        label="License Plate"
                        type="text"
                        name="vehiclePlate"
                        placeholder="License plate number"
                        value={formData.vehiclePlate}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Vehicle Registration Document
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          id="vehicleRegistration"
                          onChange={(e) => handleFileChange('vehicleRegistration', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="vehicleRegistration" className="cursor-pointer">
                          {files.vehicleRegistration ? (
                            <div className="space-y-2">
                              <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                              <p className="text-sm font-medium text-gray-900">{files.vehicleRegistration.name}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                              <p className="text-sm font-medium text-gray-700">Upload Registration</p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      <Input
                        label="Insurance Provider"
                        type="text"
                        name="insuranceProvider"
                        placeholder="Insurance company"
                        value={formData.insuranceProvider}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      <Input
                        label="Insurance Policy Number"
                        type="text"
                        name="insuranceNumber"
                        placeholder="Policy number"
                        value={formData.insuranceNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      <Input
                        label="Insurance Expiry"
                        type="date"
                        name="insuranceExpiry"
                        icon={<Calendar className="w-5 h-5" />}
                        value={formData.insuranceExpiry}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Insurance Document
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          id="insuranceDocument"
                          onChange={(e) => handleFileChange('insuranceDocument', e.target.files?.[0] || null)}
                        />
                        <label htmlFor="insuranceDocument" className="cursor-pointer">
                          {files.insuranceDocument ? (
                            <div className="space-y-2">
                              <CheckCircle2 className="w-12 h-12 text-primary-500 mx-auto" />
                              <p className="text-sm font-medium text-gray-900">{files.insuranceDocument.name}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                              <p className="text-sm font-medium text-gray-700">Upload Insurance</p>
                              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 or 5: Payment Information */}
              {(currentStep === 3 && accountType === 'passenger') || (currentStep === 5 && accountType === 'driver') ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment Information</h2>
                    
                    {accountType === 'driver' ? (
                      <div className="space-y-4">
                        <Input
                          label="Bank Account Number"
                          type="text"
                          name="bankAccount"
                          placeholder="Enter account number"
                          icon={<CreditCard className="w-5 h-5" />}
                          value={formData.bankAccount}
                          onChange={handleInputChange}
                          required
                        />
                        <Input
                          label="Routing Number"
                          type="text"
                          name="bankRouting"
                          placeholder="Enter routing number"
                          icon={<CreditCard className="w-5 h-5" />}
                          value={formData.bankRouting}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600 mb-4">
                            Payment methods will be set up after verification. You can add credit/debit cards or other payment options in your dashboard.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="font-semibold w-full sm:w-auto order-2 sm:order-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    className="font-semibold border-2 border-primary-500 w-full sm:w-auto order-1 sm:order-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Continue'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    className="font-semibold border-2 border-primary-500 w-full sm:w-auto order-1 sm:order-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Completing...' : 'Complete Setup'}
                    {!isLoading && <CheckCircle2 className="w-4 h-4 ml-2" />}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

