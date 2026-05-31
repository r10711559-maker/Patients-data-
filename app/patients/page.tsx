import { PatientRegistration } from "@/components/patient-registration"
import { Toaster } from "sonner"

export const metadata = {
  title: "Patient Registration - Sri Sai Aarav Diagnostics",
  description: "Register and manage patient records",
}

export default function PatientsPage() {
  return (
    <>
      <PatientRegistration />
      <Toaster />
    </>
  )
}
