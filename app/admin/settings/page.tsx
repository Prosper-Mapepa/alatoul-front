'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  Settings,
  Bell,
  Shield,
  DollarSign,
  Navigation,
  Users,
  Globe,
  Save,
} from 'lucide-react'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'general' | 'notifications' | 'security' | 'pricing' | 'users' | 'system'
  >('general')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: '',
    supportEmail: '',
    supportPhone: '',
    timezone: 'UTC-5 (Eastern Time)',
    defaultLanguage: 'English',
  })

  // Pricing settings
  const [pricingSettings, setPricingSettings] = useState({
    platformFeePercent: 20,
    minimumFare: 5,
    baseRatePerMile: 1.5,
    baseRatePerMinute: 0.3,
  })

  // Real-time calculation inputs
  const [calcDistance, setCalcDistance] = useState<number>(5)
  const [calcTime, setCalcTime] = useState<number>(15)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError('')
      const settings = await api.getSettings()
      
      setGeneralSettings({
        platformName: settings.platformName || 'Alatoul',
        supportEmail: settings.supportEmail || 'support@alatoul.com',
        supportPhone: settings.supportPhone || '+1 (555) 123-4567',
        timezone: settings.timezone || 'UTC-5 (Eastern Time)',
        defaultLanguage: settings.defaultLanguage === 'en' ? 'English' : settings.defaultLanguage || 'English',
      })

      setPricingSettings({
        platformFeePercent: parseFloat(String(settings.platformFeePercent || 20)),
        minimumFare: parseFloat(String(settings.minimumFare || 5)),
        baseRatePerMile: parseFloat(String(settings.baseRatePerMile || 1.5)),
        baseRatePerMinute: parseFloat(String(settings.baseRatePerMinute || 0.3)),
      })
    } catch (err: any) {
      console.error('Failed to load settings:', err)
      setError(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      const timezoneMap: Record<string, string> = {
        'UTC-5 (Eastern Time)': 'UTC-5',
        'UTC-8 (Pacific Time)': 'UTC-8',
        'UTC (Greenwich Mean Time)': 'UTC',
      }
      
      const languageMap: Record<string, string> = {
        'English': 'en',
        'Spanish': 'es',
        'French': 'fr',
      }

      await api.updateSettings({
        platformName: generalSettings.platformName,
        supportEmail: generalSettings.supportEmail,
        supportPhone: generalSettings.supportPhone,
        timezone: timezoneMap[generalSettings.timezone] || generalSettings.timezone,
        defaultLanguage: languageMap[generalSettings.defaultLanguage] || generalSettings.defaultLanguage,
      })

      setSuccess('General settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save general settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePricing = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      await api.updatePricingSettings(pricingSettings)

      setSuccess('Pricing settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save pricing settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'users', label: 'User Settings', icon: Users },
    { id: 'system', label: 'System', icon: Globe },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading settings...</div>
                ) : (
                  <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Name
                  </label>
                      <Input
                        value={generalSettings.platformName}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, platformName: e.target.value })
                        }
                        placeholder="Alatoul"
                      />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                      <Input
                        type="email"
                        value={generalSettings.supportEmail}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
                        }
                        placeholder="support@alatoul.com"
                      />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Phone
                  </label>
                      <Input
                        type="tel"
                        value={generalSettings.supportPhone}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                      />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC (Greenwich Mean Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Language
                  </label>
                      <select
                        value={generalSettings.defaultLanguage}
                        onChange={(e) =>
                          setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                    <Button variant="primary" onClick={handleSaveGeneral} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive email notifications for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive SMS for critical alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Enable push notifications in admin panel</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <Button variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Two-Factor Authentication
                  </label>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <span className="text-gray-700">Require 2FA for admin accounts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Policy
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm text-gray-700">Minimum 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm text-gray-700">Require uppercase and lowercase</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm text-gray-700">Require numbers</span>
                    </div>
                  </div>
                </div>
                <Button variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pricing Settings */}
          {activeTab === 'pricing' && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading pricing settings...</div>
                ) : (
                  <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Fee (%)
                  </label>
                      <Input
                        type="number"
                        value={pricingSettings.platformFeePercent}
                        onChange={(e) =>
                          setPricingSettings({
                            ...pricingSettings,
                            platformFeePercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.1"
                        min="0"
                        max="100"
                      />
                  <p className="text-sm text-gray-500 mt-1">
                    Percentage of each ride fare taken by the platform
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Fare ($)
                  </label>
                      <Input
                        type="number"
                        value={pricingSettings.minimumFare}
                        onChange={(e) =>
                          setPricingSettings({
                            ...pricingSettings,
                            minimumFare: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.1"
                        min="0"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum amount charged for any ride, regardless of distance or time
                      </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Rate per Mile ($)
                  </label>
                      <Input
                        type="number"
                        value={pricingSettings.baseRatePerMile}
                        onChange={(e) =>
                          setPricingSettings({
                            ...pricingSettings,
                            baseRatePerMile: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.1"
                        min="0"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Base rate charged per mile traveled
                      </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Rate per Minute ($)
                  </label>
                      <Input
                        type="number"
                        value={pricingSettings.baseRatePerMinute}
                        onChange={(e) =>
                          setPricingSettings({
                            ...pricingSettings,
                            baseRatePerMinute: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.1"
                        min="0"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Base rate charged per minute of ride duration
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                      <p className="text-sm font-medium text-blue-900 mb-3">Fare Calculation Preview:</p>
                      
                      {/* Input fields for calculation */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-blue-900 mb-1">
                            Distance (miles)
                          </label>
                          <Input
                            type="number"
                            value={calcDistance}
                            onChange={(e) => setCalcDistance(parseFloat(e.target.value) || 0)}
                            step="0.1"
                            min="0"
                            className="bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-900 mb-1">
                            Time (minutes)
                          </label>
                          <Input
                            type="number"
                            value={calcTime}
                            onChange={(e) => setCalcTime(parseFloat(e.target.value) || 0)}
                            step="0.1"
                            min="0"
                            className="bg-white"
                          />
                        </div>
                      </div>

                      {/* Real-time calculation results - updates when pricing settings or inputs change */}
                      {(() => {
                        // Calculate using current pricing settings values
                        const baseFare =
                          (calcDistance || 0) * (pricingSettings.baseRatePerMile || 0) +
                          (calcTime || 0) * (pricingSettings.baseRatePerMinute || 0)
                        const finalFare = Math.max(baseFare, pricingSettings.minimumFare || 0)
                        const platformFee = (finalFare * (pricingSettings.platformFeePercent || 0)) / 100
                        const driverEarning = finalFare - platformFee

                        return (
                          <div className="space-y-2 pt-2 border-t border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">Base Fare:</span>
                              <span className="text-sm font-semibold text-blue-900">
                                ${baseFare.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">Final Fare:</span>
                              <span className="text-sm font-semibold text-blue-900">
                                ${finalFare.toFixed(2)}
                                {finalFare === pricingSettings.minimumFare && (
                                  <span className="text-xs text-blue-600 ml-1">(min)</span>
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700">
                                Platform Fee ({pricingSettings.platformFeePercent}%):
                              </span>
                              <span className="text-sm font-semibold text-blue-900">
                                ${platformFee.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                              <span className="text-sm font-medium text-blue-900">Driver Earning:</span>
                              <span className="text-sm font-bold text-green-700">
                                ${driverEarning.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )
                      })()}

                      {/* Formula reference - updates in real-time */}
                      {(() => {
                        const baseFareCalc =
                          (calcDistance || 0) * (pricingSettings.baseRatePerMile || 0) +
                          (calcTime || 0) * (pricingSettings.baseRatePerMinute || 0)
                        const finalFareCalc = Math.max(baseFareCalc, pricingSettings.minimumFare || 0)
                        const platformFeeCalc = (finalFareCalc * (pricingSettings.platformFeePercent || 0)) / 100
                        const driverEarningCalc = finalFareCalc - platformFeeCalc

                        return (
                          <div className="pt-2 border-t border-blue-200">
                            <p className="text-xs font-medium text-blue-900 mb-1">Formula (updates in real-time):</p>
                            <p className="text-xs text-blue-700">
                              Base Fare = ({calcDistance || 0} × ${pricingSettings.baseRatePerMile}/mile) + ({calcTime || 0} × ${pricingSettings.baseRatePerMinute}/min) = <strong>${baseFareCalc.toFixed(2)}</strong>
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Final Fare = Max(${baseFareCalc.toFixed(2)}, ${pricingSettings.minimumFare}) = <strong>${finalFareCalc.toFixed(2)}</strong>
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Platform Fee = {pricingSettings.platformFeePercent}% × ${finalFareCalc.toFixed(2)} = <strong>${platformFeeCalc.toFixed(2)}</strong>
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Driver Earning = ${finalFareCalc.toFixed(2)} - ${platformFeeCalc.toFixed(2)} = <strong>${driverEarningCalc.toFixed(2)}</strong>
                            </p>
                          </div>
                        )
                      })()}
                </div>
                    <Button variant="primary" onClick={handleSavePricing} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* User Settings */}
          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>User Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Require Email Verification</p>
                    <p className="text-sm text-gray-600">Users must verify email before using the platform</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Require Phone Verification</p>
                    <p className="text-sm text-gray-600">Users must verify phone number</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Age for Users
                  </label>
                  <Input type="number" defaultValue="18" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Ride Cancellations per Day
                  </label>
                  <Input type="number" defaultValue="3" />
                </div>
                <Button variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Mode
                  </label>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <span className="text-gray-700">Temporarily disable platform access</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Rate Limit (requests per minute)
                  </label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Database Backup Frequency
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <Button variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

