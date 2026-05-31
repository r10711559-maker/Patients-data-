"use client"

import { useState, useEffect } from "react"
import { getBills, getPatients, getTodaysRevenue, getMonthlyRevenue } from "@/lib/db-operations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { toast } from "sonner"

export default function AdminPage() {
  const [bills, setBills] = useState<any[]>([])
  const [todaysRevenue, setTodaysRevenue] = useState(0)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [billsData, todayRev, monthlyRev] = await Promise.all([
        getBills(),
        getTodaysRevenue(),
        getMonthlyRevenue(),
      ])

      setBills(billsData)
      setTodaysRevenue(todayRev)

      const grouped: { [key: string]: number } = {}
      monthlyRev.forEach((bill) => {
        const date = new Date(bill.created_at).toLocaleDateString()
        grouped[date] = (grouped[date] || 0) + (bill.total || 0)
      })
      setMonthlyData(Object.entries(grouped).map(([date, total]) => ({ date, total })))
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const paidBills = bills.filter((b) => b.status === "paid").length
  const pendingBills = bills.filter((b) => b.status === "pending").length
  const totalRevenue = bills.filter((b) => b.status === "paid").reduce((sum, b) => sum + (b.total || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{paidBills}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{pendingBills}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalRevenue.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trend</CardDescription>
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

        {/* Bill Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Status</CardTitle>
            <CardDescription>Payment status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { status: "Paid", count: paidBills },
                { status: "Pending", count: pendingBills },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0066cc" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>Latest billing transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : bills.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No bills found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.slice(0, 20).map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-mono text-xs">{bill.bill_number?.slice(-8)}</TableCell>
                      <TableCell>{bill.patient?.name}</TableCell>
                      <TableCell className="font-mono font-bold">₹{bill.total?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={bill.status === "paid" ? "default" : "secondary"}>
                          {bill.status?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{bill.payment_method}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(bill.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
