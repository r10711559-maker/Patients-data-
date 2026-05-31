"use client"

import { useState, useEffect } from "react"
import { getTests } from "@/lib/db-operations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TestRecord {
  id: string
  test_name: string
  price: number
}

export default function TestsPage() {
  const [tests, setTests] = useState<TestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[v0] Starting to load tests...")
      
      const data = await getTests()
      
      console.log("[v0] Tests loaded successfully:", data)
      setTests(data)
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load tests"
      console.error("[v0] Error loading tests:", {
        message: errorMessage,
        code: err?.code,
        hint: err?.hint,
        details: err?.details,
        fullError: err
      })
      setError(errorMessage)
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Tests</CardTitle>
          <CardDescription>Available tests and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading tests...</p>
            </div>
          )}
          
          {!loading && error && (
            <div className="text-center py-8 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-semibold mb-2">Error loading tests:</p>
                <p className="text-sm text-red-600 font-mono break-all">{error}</p>
              </div>
              <Button onClick={loadTests} variant="outline">
                Try Again
              </Button>
            </div>
          )}
          
          {!loading && !error && tests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tests found</p>
            </div>
          )}
          
          {!loading && !error && tests.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-mono text-sm">{test.id}</TableCell>
                      <TableCell className="font-semibold">{test.test_name}</TableCell>
                      <TableCell className="text-right font-mono">₹{test.price}</TableCell>
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
