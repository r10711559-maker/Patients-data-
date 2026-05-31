"use client"

import { BillingSystem } from "@/components/billing-system"
import { Toaster } from "sonner"

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <BillingSystem />
      <Toaster />
    </div>
  )
}
