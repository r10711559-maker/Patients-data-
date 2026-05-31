"use client"

import { useState, useEffect } from "react"
import { getReports, updateReportStatus, getPatientReports, createReport, type Report } from "@/lib/db-operations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPatients, type Patient } from "@/lib/db-operations"
import { toast } from "sonner"

export function ReportManagement() {
  const [reports, setReports] = useState<any[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reportsData, patientsData] = await Promise.all([
        getReports(),
        getPatients(),
      ])
      setReports(reportsData)
      setPatients(patientsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
    } else {
      toast.error("Please select a PDF file")
      setPdfFile(null)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient || !pdfFile) {
      toast.error("Please select patient and upload PDF")
      return
    }

    try {
      setSubmitting(true)

      // In a real application, you would upload the file to Supabase Storage
      // For now, we're just creating a report record with placeholder URL
      const report: Report = {
        patient_id: selectedPatient,
        pdf_filename: pdfFile.name,
        status: "pending",
      }

      await createReport(report)
      toast.success("Report uploaded successfully!")

      setSelectedPatient("")
      setPdfFile(null)
      await loadData()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to upload report")
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (reportId: string, status: any) => {
    try {
      await updateReportStatus(reportId, status)
      toast.success("Report status updated")
      await loadData()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to update status")
    }
  }

  const getPatientName = (patientId: string) => {
    return patients.find((p) => p.id === patientId)?.name || "Unknown"
  }

  const statusColors = {
    pending: "secondary",
    processing: "default",
    completed: "default",
    reviewed: "default",
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Upload Form */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Upload Report</CardTitle>
            <CardDescription>Upload patient PDF report</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
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

              <div>
                <Label>PDF File *</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {pdfFile && (
                  <p className="text-xs text-green-600 mt-2">✓ {pdfFile.name}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Uploading..." : "Upload Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>{reports.length} total reports</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : reports.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No reports found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-mono text-xs">
                          {report.report_number?.slice(-6)}
                        </TableCell>
                        <TableCell>{getPatientName(report.patient_id)}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs">
                          {report.pdf_filename}
                        </TableCell>
                        <TableCell>
                          <Select value={report.status} onValueChange={(val) => updateStatus(report.id, val)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {report.pdf_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(report.pdf_url, "_blank")}
                            >
                              Download
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
