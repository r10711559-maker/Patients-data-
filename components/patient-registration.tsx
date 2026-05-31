"use client"

import { useState, useEffect } from "react"
import { addPatient, getPatients, searchPatients, updatePatient, deletePatient, type Patient } from "@/lib/db-operations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export function PatientRegistration() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    mobile: "",
    address: "",
    referring_doctor: "",
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await getPatients()
      setPatients(data)
    } catch (error) {
      console.error("Error loading patients:", error)
      toast.error("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      loadPatients()
      return
    }
    try {
      const data = await searchPatients(term)
      setPatients(data)
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Search failed")
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.age || !formData.gender || !formData.mobile || !formData.address) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setSubmitting(true)

      if (isEditing && selectedPatient?.id) {
        await updatePatient(selectedPatient.id, {
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender as any,
          mobile: formData.mobile,
          address: formData.address,
          referring_doctor: formData.referring_doctor,
        })
        toast.success("Patient updated successfully")
        setIsEditing(false)
        setSelectedPatient(null)
      } else {
        await addPatient({
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender as any,
          mobile: formData.mobile,
          address: formData.address,
          referring_doctor: formData.referring_doctor,
        })
        toast.success("Patient registered successfully")
      }

      setFormData({ name: "", age: "", gender: "", mobile: "", address: "", referring_doctor: "" })
      await loadPatients()
    } catch (error: any) {
      toast.error(error.message || "Failed to save patient")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      mobile: patient.mobile,
      address: patient.address,
      referring_doctor: patient.referring_doctor || "",
    })
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (!selectedPatient?.id) return
    try {
      await deletePatient(selectedPatient.id)
      toast.success("Patient deleted")
      setDeleteDialog(false)
      setSelectedPatient(null)
      await loadPatients()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to delete patient")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedPatient(null)
    setFormData({ name: "", age: "", gender: "", mobile: "", address: "", referring_doctor: "" })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Registration Form */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Patient" : "Register Patient"}</CardTitle>
            <CardDescription>Add new patient record</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Patient Name *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age *</Label>
                  <Input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age"
                    required
                  />
                </div>
                <div>
                  <Label>Gender *</Label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Mobile Number *</Label>
                <Input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  required
                />
              </div>

              <div>
                <Label>Address *</Label>
                <Textarea name="address" value={formData.address} onChange={handleChange} placeholder="Full address" required />
              </div>

              <div>
                <Label>Referring Doctor</Label>
                <Input name="referring_doctor" value={formData.referring_doctor} onChange={handleChange} placeholder="Optional" />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Processing..." : isEditing ? "Update" : "Register"}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>{patients.length} patients registered</CardDescription>
            <Input
              placeholder="Search by name, ID, or mobile..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="mt-4"
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">Loading...</p>
            ) : patients.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No patients found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-mono text-xs">{patient.patient_id?.slice(-6)}</TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.mobile}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(patient)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedPatient(patient)
                                setDeleteDialog(true)
                              }}
                            >
                              Delete
                            </Button>
                          </div>
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPatient?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
