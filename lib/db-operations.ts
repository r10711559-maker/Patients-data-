import { getSupabaseClient } from "./supabase-client"

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface User {
  id?: string
  email: string
  name: string
  role: "admin" | "staff" | "doctor"
  created_at?: string
  updated_at?: string
}

export interface Patient {
  id?: string
  patient_id?: string
  name: string
  age: number
  gender: "Male" | "Female" | "Other"
  mobile: string
  address: string
  referring_doctor?: string
  created_at?: string
  updated_at?: string
}

export interface Test {
  id?: string
  name: string
  category: string
  price: number
  sample_type?: string
  turnaround_time?: string
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

export interface Bill {
  id?: string
  bill_number?: string
  patient_id: string
  subtotal: number
  discount: number
  total: number
  status: "pending" | "paid" | "cancelled"
  payment_method?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface BillItem {
  id?: string
  bill_id: string
  test_id: string
  quantity: number
  price: number
  created_at?: string
}

export interface Report {
  id?: string
  report_number?: string
  patient_id: string
  bill_id?: string
  pdf_url?: string
  pdf_filename?: string
  status: "pending" | "processing" | "completed" | "reviewed"
  completed_at?: string
  created_at?: string
  updated_at?: string
}

// ============================================================================
// PATIENT OPERATIONS
// ============================================================================

export async function addPatient(patientData: Patient) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  const patient_id = `PAT-${timestamp}-${random}`

  // First attempt: try with referring_doctor field
  let attempt1Error = null
  const { data: data1, error: error1 } = await supabase
    .from("patients")
    .insert([
      {
        patient_id,
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        mobile: patientData.mobile,
        address: patientData.address,
        referring_doctor: patientData.referring_doctor || null,
      },
    ])
    .select('*')

  // If success, return data
  if (!error1) {
    return data1?.[0]
  }

  // If error mentions referring_doctor column doesn't exist, try without it
  if (error1?.message?.includes('referring_doctor')) {
    console.warn("referring_doctor column not available yet, inserting without it")
    const { data: data2, error: error2 } = await supabase
      .from("patients")
      .insert([
        {
          patient_id,
          name: patientData.name,
          age: patientData.age,
          gender: patientData.gender,
          mobile: patientData.mobile,
          address: patientData.address,
          test_name: "N/A", // Default for backward compatibility
        },
      ])
      .select('*')
    
    if (error2) {
      console.error("Error adding patient:", error2)
      throw error2
    }
    return data2?.[0]
  }

  // Other errors - throw
  if (error1) {
    console.error("Error adding patient:", error1)
    throw error1
  }
}

export async function getPatients() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patients:", error)
    throw error
  }

  return data || []
}

export async function getTodaysPatients() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .gte("created_at", today.toISOString())
    .lt("created_at", new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching today's patients:", error)
    throw error
  }

  return data || []
}

export async function searchPatients(searchTerm: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  if (!searchTerm.trim()) {
    return getPatients()
  }

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .or(
      `name.ilike.%${searchTerm}%,patient_id.ilike.%${searchTerm}%,mobile.ilike.%${searchTerm}%`
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching patients:", error)
    throw error
  }

  return data || []
}

export async function getPatientById(patientId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching patient:", error)
    throw error
  }

  return data
}

export async function updatePatient(patientId: string, patientData: Partial<Patient>) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const updateFields: any = {}

  if (patientData.name !== undefined) updateFields.name = patientData.name
  if (patientData.age !== undefined) updateFields.age = patientData.age
  if (patientData.gender !== undefined) updateFields.gender = patientData.gender
  if (patientData.mobile !== undefined) updateFields.mobile = patientData.mobile
  if (patientData.address !== undefined) updateFields.address = patientData.address
  if (patientData.referring_doctor !== undefined) updateFields.referring_doctor = patientData.referring_doctor

  updateFields.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("patients")
    .update(updateFields)
    .eq("id", patientId)
    .select('*')

  if (error) {
    console.error("Error updating patient:", error)
    throw error
  }

  return data?.[0]
}

export async function deletePatient(patientId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { error } = await supabase.from("patients").delete().eq("id", patientId)

  if (error) {
    console.error("Error deleting patient:", error)
    throw error
  }
}

// ============================================================================
// TEST OPERATIONS
// ============================================================================

export async function getTests() {
  const supabase = getSupabaseClient()
  
  console.log("[v0] ========== getTests() START ==========")
  console.log("[v0] Supabase client available:", !!supabase)
  console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  if (!supabase) {
    const error = new Error("Supabase client not initialized")
    console.error("[v0] FATAL:", error.message)
    throw error
  }

  // Step 1: Test basic connection and RLS by querying with just id
  console.log("[v0] Step 1: Testing connection with minimal query (id only)")
  const { data: connTest, error: connError } = await supabase
    .from('tests')
    .select('id')
    .limit(1)

  if (connError) {
    console.error("[v0] Connection test FAILED:", {
      code: connError.code,
      message: connError.message,
      hint: connError.hint,
    })
    throw connError
  }
  console.log("[v0] Connection test PASSED - table exists and is accessible")

  // Step 2: Try to query with all desired columns
  console.log("[v0] Step 2: Querying with id, test_name, price")
  const { data, error } = await supabase
    .from('tests')
    .select('id,test_name,price')

  if (error) {
    console.error("[v0] QUERY ERROR:", {
      code: error.code,
      message: error.message,
      hint: error.hint,
      details: error.details,
      fullError: error
    })

    // Check if it's a column error - try without price
    if (error.message?.includes('price') || error.code === 'PGRST204') {
      console.log("[v0] Price column not available, trying without it...")
      const { data: data2, error: error2 } = await supabase
        .from('tests')
        .select('id,test_name')
      
      if (error2) {
        console.error("[v0] FALLBACK QUERY ALSO FAILED:", {
          code: error2.code,
          message: error2.message,
        })
        throw error2
      }
      console.log("[v0] Fallback query succeeded - returning data without price")
      return data2 || []
    }

    throw error
  }

  console.log("[v0] Query successful!")
  console.log("[v0] Records returned:", data?.length || 0)
  if (data && data.length > 0) {
    console.log("[v0] Sample record:", JSON.stringify(data[0], null, 2))
  }
  console.log("[v0] ========== getTests() END ==========")
  
  return data || []
}

export async function getTestsWithDebug() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      data: null,
      error: "Supabase client not available",
      tableName: "tests",
      supabaseUrl: null,
      rawData: null,
      rawError: null
    }
  }

  // Get Supabase URL
  const supabaseUrl = supabase.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL

  console.log('[v0] Querying table: tests')
  console.log('[v0] Supabase URL:', supabaseUrl)
  console.log('[v0] Selecting columns: id,test_name,price')

  const { data, error } = await supabase
    .from('tests')
    .select('id,test_name,price')

  console.log('[v0] RAW DATA:', JSON.stringify(data, null, 2))
  console.log('[v0] RAW ERROR:', JSON.stringify(error, null, 2))

  return {
    data,
    error,
    tableName: "tests",
    supabaseUrl,
    rawData: JSON.stringify(data, null, 2),
    rawError: JSON.stringify(error, null, 2),
    supabaseHostname: supabaseUrl ? new URL(supabaseUrl).hostname : null
  }
}

export async function getAllTests() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  // Try with all columns first
  let { data, error } = await supabase
    .from("tests")
    .select("id, test_name, price")

  // Fallback if price doesn't exist
  if (error?.message?.includes('price')) {
    const { data: data2, error: error2 } = await supabase
      .from("tests")
      .select("id, test_name")
    data = data2
    error = error2
  }

  if (error) {
    console.error("Error fetching all tests:", error)
    throw error
  }

  return data || []
}

export async function getTestById(testId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("tests")
    .select("id, test_name, price")
    .eq("id", testId)
    .single()

  if (error) {
    console.error("Error fetching test:", error)
    throw error
  }

  return data
}

export async function addTest(testData: Test) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("tests")
    .insert([{
      test_name: testData.name,
      price: testData.price,
    }])
    .select("id, test_name, price")

  if (error) {
    console.error("Error adding test:", error)
    throw error
  }

  return data?.[0]
}

// ============================================================================
// BILL OPERATIONS
// ============================================================================

export async function generateBillNumber() {
  const date = new Date()
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "")
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `BILL-${dateStr}-${random}`
}

export async function createBill(billData: Bill, billItems: Omit<BillItem, "id" | "bill_id">[]) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const bill_number = await generateBillNumber()

  const { data: billData_, error: billError } = await supabase
    .from("bills")
    .insert([
      {
        bill_number,
        patient_id: billData.patient_id,
        subtotal: billData.subtotal,
        discount: billData.discount,
        total: billData.total,
        status: billData.status,
        payment_method: billData.payment_method,
      },
    ])
    .select()

  if (billError) {
    console.error("Error creating bill:", billError)
    throw billError
  }

  const createdBill = billData_?.[0]
  if (!createdBill) throw new Error("Bill not created")

  for (const item of billItems) {
    const { error: itemError } = await supabase
      .from("bill_items")
      .insert([{ bill_id: createdBill.id, ...item }])

    if (itemError) {
      console.error("Error adding bill item:", itemError)
      throw itemError
    }
  }

  return createdBill
}

export async function getBills() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("bills")
    .select("*, patient:patients(name, patient_id), items:bill_items(*, test:tests(name, price))")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bills:", error)
    throw error
  }

  return data || []
}

export async function getTodaysRevenue() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("bills")
    .select("total, status")
    .gte("created_at", today.toISOString())
    .lt("created_at", new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
    .eq("status", "paid")

  if (error) {
    console.error("Error fetching today's revenue:", error)
    throw error
  }

  const revenue = (data || []).reduce((sum, bill) => sum + (bill.total || 0), 0)
  return revenue
}

export async function getMonthlyRevenue() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("bills")
    .select("created_at, total, status")
    .eq("status", "paid")
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  if (error) {
    console.error("Error fetching monthly revenue:", error)
    throw error
  }

  return data || []
}

export async function getPatientBills(patientId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("bills")
    .select("*, items:bill_items(*, test:tests(name, price))")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patient bills:", error)
    throw error
  }

  return data || []
}

export async function updateBillStatus(
  billId: string,
  status: "pending" | "paid" | "cancelled"
) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("bills")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", billId)
    .select()

  if (error) {
    console.error("Error updating bill:", error)
    throw error
  }

  return data?.[0]
}

// ============================================================================
// REPORT OPERATIONS
// ============================================================================

export async function createReport(reportData: Report) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const report_number = `RPT-${Date.now().toString().slice(-8)}`

  const { data, error } = await supabase
    .from("reports")
    .insert([{ ...reportData, report_number }])
    .select()

  if (error) {
    console.error("Error creating report:", error)
    throw error
  }

  return data?.[0]
}

export async function getReports() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("reports")
    .select("*, patient:patients(name, patient_id)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error)
    throw error
  }

  return data || []
}

export async function getPatientReports(patientId: string) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patient reports:", error)
    throw error
  }

  return data || []
}

export async function updateReportStatus(
  reportId: string,
  status: "pending" | "processing" | "completed" | "reviewed"
) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("reports")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()

  if (error) {
    console.error("Error updating report:", error)
    throw error
  }

  return data?.[0]
}

export async function getPendingReports() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("reports")
    .select("*, patient:patients(name, patient_id)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pending reports:", error)
    throw error
  }

  return data || []
}

export async function getCompletedReports() {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error("Supabase client not available")

  const { data, error } = await supabase
    .from("reports")
    .select("*, patient:patients(name, patient_id)")
    .eq("status", "completed")
    .order("completed_at", { ascending: false })

  if (error) {
    console.error("Error fetching completed reports:", error)
    throw error
  }

  return data || []
}
