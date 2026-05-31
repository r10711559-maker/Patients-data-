"use client"

import { ReportManagement } from "@/components/report-management"
import { Toaster } from "sonner"

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ReportManagement />
      <Toaster />
    </div>
  )
}
