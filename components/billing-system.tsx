"use client"

import { useState, useEffect } from "react"
import { createBill, getBills, getPatients, getTests, updateBillStatus, type Patient, type Test } from "@/lib/db-operations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function BillingSystem() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [selectedTests, setSelectedTests] = useState<{ test_id: string; quantity: number }[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [patientsData, testsData, billsData] = await Promise.all([
        getPatients(),
        getTests(),
        getBills(),
      ])
      setPatients(patientsData)
      setTests(testsData)
      setBills(billsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const addTest = () => {
    setSelectedTests([...selectedTests, { test_id: "", quantity: 1 }])
  }

  const updateTest = (index: number, test_id: string, quantity: number) => {
    const updated = [...selectedTests]
    updated[index] = { test_id, quantity }
    setSelectedTests(updated)
  }

  const removeTest = (index: number) => {
    setSelectedTests(selectedTests.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    const subtotal = selectedTests.reduce((sum, item) => {
      const test = tests.find((t) => t.id === item.test_id)
      return sum + ((test?.price || 0) * item.quantity)
    }, 0)
    const total = Math.max(0, subtotal - discount)
    return { subtotal, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient || selectedTests.length === 0) {
      toast.error("Please select patient and at least one test")
      return
    }

    try {
      setSubmitting(true)
      const { subtotal, total } = calculateTotal()

      const billData: any = {
        patient_id: selectedPatient,
        subtotal,
        discount,
        total,
        status: "pending",
        payment_method: paymentMethod,
      }

      const billItems = selectedTests.map((item) => {
        const test = tests.find((t) => t.id === item.test_id)
        return {
          test_id: item.test_id,
          quantity: item.quantity,
          price: test?.price || 0,
        }
      })

      await createBill(billData, billItems)
      toast.success("Bill created successfully!")

      // Reset form
      setSelectedPatient("")
      setSelectedTests([])
      setDiscount(0)
      setPaymentMethod("")

      await loadData()
    } catch (error) {
      console.error("Error creating bill:", error)
      toast.error("Failed to create bill")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentStatus = async (billId: string) => {
    try {
      await updateBillStatus(billId, "paid")
      toast.success("Bill marked as paid")
      await loadData()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to update bill")
    }
  }

  const { subtotal, total } = calculateTotal()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Bill Creation Form */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Create Bill</CardTitle>
            <CardDescription>Add multiple tests to bill</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Select Patient *</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id || ""}>
                        {patient.name} ({patient.patient_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <Label className="mb-2 block">Select Tests</Label>
                {selectedTests.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Select value={item.test_id} onValueChange={(val) => updateTest(index, val, item.quantity)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Test" />
                      </SelectTrigger>
                      <SelectContent>
                        {tests.map((test) => (
                          <SelectItem key={test.id} value={test.id || ""}>
                            {test.name} (₹{test.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateTest(index, item.test_id, Number(e.target.value))}
                      className="w-16"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTest(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={addTest}
                >
                  + Add Test
                </Button>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>

                <div>
                  <Label>Discount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>

                <div className="flex justify-between font-bold text-lg bg-primary/10 p-2 rounded">
                  <span>Total:</span>
                  <span className="font-mono">₹{total.toFixed(2)}</span>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Bill"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Bills</CardTitle>
            <CardDescription>{bills.length} total bills</CardDescription>
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
                      <TableHead>Bill #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-mono text-xs">{bill.bill_number?.slice(-8)}</TableCell>
                        <TableCell>{bill.patient?.name}</TableCell>
                        <TableCell className="font-mono">₹{bill.total?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={bill.status === "paid" ? "default" : "secondary"}>
                            {bill.status?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{bill.payment_method}</TableCell>
                        <TableCell>
                          {bill.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentStatus(bill.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
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
    </div>
  )
}
