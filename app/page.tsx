"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const router = useRouter()

  const modules = [
    {
      title: "Dashboard",
      description: "View analytics and today's statistics",
      path: "/dashboard",
      icon: "📊",
    },
    {
      title: "Patient Registration",
      description: "Register and manage patient records",
      path: "/patients",
      icon: "👥",
    },
    {
      title: "Test Management",
      description: "Manage diagnostic tests and pricing",
      path: "/tests",
      icon: "🧪",
    },
    {
      title: "Billing System",
      description: "Create bills and manage payments",
      path: "/billing",
      icon: "💰",
    },
    {
      title: "Report Management",
      description: "Upload and manage patient reports",
      path: "/reports",
      icon: "📋",
    },
    {
      title: "Admin Panel",
      description: "View advanced analytics and reports",
      path: "/admin",
      icon: "⚙️",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Sri Sai Aarav Diagnostics
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Complete Diagnostics Management System
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Professional lab management for Patancheru
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.map((module, index) => (
            <Card key={index} className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-4xl">{module.icon}</div>
                </div>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push(module.path)}
                  className="w-full"
                >
                  Access Module <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>Everything you need to manage your diagnostics center</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background">
                <p className="font-semibold text-foreground mb-2">✓ Patient Management</p>
                <p className="text-sm text-muted-foreground">Register, search, and manage patient records</p>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="font-semibold text-foreground mb-2">✓ Billing System</p>
                <p className="text-sm text-muted-foreground">Create bills with multiple tests and discounts</p>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="font-semibold text-foreground mb-2">✓ Report Management</p>
                <p className="text-sm text-muted-foreground">Upload and track PDF reports</p>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="font-semibold text-foreground mb-2">✓ Analytics Dashboard</p>
                <p className="text-sm text-muted-foreground">Real-time revenue and patient statistics</p>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="font-semibold text-foreground mb-2">✓ Test Management</p>
                <p className="text-sm text-muted-foreground">Manage diagnostic tests and pricing</p>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="font-semibold text-foreground mb-2">✓ Search Functionality</p>
                <p className="text-sm text-muted-foreground">Quick search by ID, name, or mobile</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>Sri Sai Aarav Diagnostics • Patancheru</p>
        <p className="mt-2">Professional Diagnostics Management System</p>
      </div>
    </div>
  )
}
