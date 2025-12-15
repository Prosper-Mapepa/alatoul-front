import React from 'react'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden">
      <AdminSidebar />
      <div className="flex-1 ml-64 min-w-0">
        <AdminHeader />
        <main className="p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

