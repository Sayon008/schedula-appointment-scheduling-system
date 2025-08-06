export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED_BY_PATIENT = 'cancelled_by_patient',
  CANCELLED_BY_DOCTOR = 'cancelled_by_doctor',
  RESCHEDULED = 'recheduled',
  NO_SHOW = 'no_show',
  PENDING_DOCTOR_AVAILABILITY_CHANGE = 'pending_doctor_availability_change',
  PENDING = 'pending'
}