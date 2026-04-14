export const BOOKING_STATUS = {
  PENDING: 'booked',
  ASSIGNED: 'assigned',
  SAMPLE_COLLECTED: 'sample_collected',
  IN_ANALYSIS: 'in_analysis',
  REPORT_READY: 'report_ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const BOOKING_STEPS = [
  { step: 1, key: 'booked',           label: 'Booking Received',    desc: 'User booked the test' },
  { step: 2, key: 'assigned',         label: 'Technician Assigned', desc: 'Assign a lab technician' },
  { step: 3, key: 'sample_collected', label: 'Sample Collected',    desc: 'Technician collected sample' },
  { step: 4, key: 'in_analysis',      label: 'Lab Analysis',        desc: 'Sample under analysis' },
  { step: 5, key: 'report_ready',     label: 'Report Uploaded',     desc: 'Upload test report' },
  { step: 6, key: 'completed',        label: 'Completed',           desc: 'User downloaded report' },
];

export const TEST_CATEGORIES = [
  'Blood Test', 'Thyroid Test', 'Vitamin Test', 'Urine Test',
  'Lipid Profile', 'Liver Function', 'Kidney Function', 'Diabetes Panel',
  'Cardiac Markers', 'Hormone Test', 'COVID Test', 'Allergy Test',
];

export const PACKAGE_INCLUDES = [
  'Blood Test', 'Thyroid Test', 'Vitamin Test', 'Urine Test',
  'Lipid Profile', 'Liver Function', 'Kidney Function', 'HbA1c',
  'CBC', 'ESR', 'CRP', 'Vitamin D', 'Vitamin B12', 'Iron Studies',
];
