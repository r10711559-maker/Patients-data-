"use client"

import dynamic from "next/dynamic"
import { Toaster } from "sonner"
import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DashboardLayout = dynamic(() => import("@/components/dashboard-layout"), {
  loading: () => (
    <div className="p-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  ),
  ssr: false,
})

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <DashboardLayout />
      </Suspense>
      <Toaster />
    </>
  )
}
