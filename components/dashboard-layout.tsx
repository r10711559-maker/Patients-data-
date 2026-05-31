"use client"

import { useState, useEffect } from "react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  getTodaysPatients,
  getTodaysRevenue,
  getMonthlyRevenue,
  getPendingReports,
  getCompletedReports,
  type Patient,
} from "@/lib/db-operations"
import { toast } from "sonner"

export default function Dashboard() {
  const [todaysPatients, setTodaysPatients] = useState<number>(0)
  const [todaysRevenue, setTodaysRevenue] = useState<number>(0)
  const [pendingReports, setPendingReports] = useState<number>(0)
  const [completedReports, setCompletedReports] = useState<number>(0)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Get today's patient count
      const patients = await getTodaysPatients()
      setTodaysPatients(patients.length)

      // Get today's revenue
      const revenue = await getTodaysRevenue()
      setTodaysRevenue(revenue)

      // Get pending reports
      const pending = await getPendingReports()
      setPendingReports(pending.length)

      // Get completed reports
      const completed = await getCompletedReports()
      setCompletedReports(completed.length)

      // Get monthly revenue data
      const monthlyRevenue = await getMonthlyRevenue()
      const groupedData = groupRevenueByDate(monthlyRevenue)
      setMonthlyData(groupedData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const groupRevenueByDate = (data: any[]) => {
    const grouped: { [key: string]: number } = {}
    data.forEach((bill) => {
      const date = new Date(bill.created_at).toLocaleDateString()
      grouped[date] = (grouped[date] || 0) + (bill.total || 0)
    })
    return Object.entries(grouped).map(([date, total]) => ({ date, total }))
  }

  const StatCard = ({ title, value, description, icon }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-2xl font-bold text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar>
        <SidebarHeader className="bg-primary text-primary-foreground p-4 font-bold text-lg">
          Sri Sai Aarav Diagnostics
        </SidebarHeader>
        <SidebarContent className="space-y-4 p-4">
          <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = "/dashboard"}>
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = "/patients"}>
            Patient Registration
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = "/tests"}>
            Test Management
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = "/billing"}>
            Billing
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = "/reports"}>
            Reports
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => window.location.href = "/admin"}>
            Admin Panel
          </Button>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to Sri Sai Aarav Diagnostics Management System</p>
            </div>
            <SidebarTrigger className="md:hidden" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Today's Patients" value={todaysPatients} description="New registrations today" icon="👥" />
            <StatCard title="Today's Revenue" value={`₹${todaysRevenue.toFixed(2)}`} description="Paid bills today" icon="💰" />
            <StatCard title="Pending Reports" value={pendingReports} description="Reports awaiting completion" icon="📋" />
            <StatCard title="Completed Reports" value={completedReports} description="Reports completed" icon="✓" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue trend for this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#0066cc" name="Revenue (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = "/patients"}>
                  Register New Patient
                </Button>
                <Button className="w-full" variant="outline" onClick={() => window.location.href = "/billing"}>
                  Create Bill
                </Button>
                <Button className="w-full" variant="outline" onClick={() => window.location.href = "/reports"}>
                  Upload Report
                </Button>
                <Button className="w-full" variant="outline" onClick={() => window.location.href = "/admin"}>
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
