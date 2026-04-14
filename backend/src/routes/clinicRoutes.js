const express = require('express');
const router = express.Router();
const { protect, clinicAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  getPackages, getPackageById, createPackage, updatePackage, deletePackage, togglePackageStatus,
} = require('../controllers/packageController');

const {
  getLabTests, getLabTestById, createLabTest, updateLabTest, deleteLabTest,
} = require('../controllers/labTestController');

const {
  getBookings, getBookingById, assignTechnician, updateBookingStatus,
  uploadReport, cancelBooking, getMyBookings,
} = require('../controllers/bookingController');

const {
  getRevenueSummary, getRevenueTransactions,
} = require('../controllers/revenueController');

const {
  getTechnicians,
} = require('../controllers/technicianController');

const {
  getMyClinic, setupClinic, uploadClinicLicense,
} = require('../controllers/clinicController');

// Packages
router.get('/packages', protect, clinicAdmin, getPackages);
router.get('/packages/:id', protect, clinicAdmin, getPackageById);
router.post('/packages', protect, clinicAdmin, createPackage);
router.put('/packages/:id', protect, clinicAdmin, updatePackage);
router.delete('/packages/:id', protect, clinicAdmin, deletePackage);
router.patch('/packages/:id/toggle', protect, clinicAdmin, togglePackageStatus);

// Lab Tests
router.get('/lab-tests', protect, clinicAdmin, getLabTests);
router.get('/lab-tests/:id', protect, clinicAdmin, getLabTestById);
router.post('/lab-tests', protect, clinicAdmin, createLabTest);
router.put('/lab-tests/:id', protect, clinicAdmin, updateLabTest);
router.delete('/lab-tests/:id', protect, clinicAdmin, deleteLabTest);

// Bookings
router.get('/bookings/my', protect, getMyBookings);
router.get('/bookings', protect, clinicAdmin, getBookings);
router.get('/bookings/:id', protect, getBookingById);
router.put('/bookings/:id/assign', protect, clinicAdmin, assignTechnician);
router.put('/bookings/:id/status', protect, clinicAdmin, updateBookingStatus);
router.post('/bookings/:id/report', protect, clinicAdmin, upload.array('reports', 5), uploadReport);
router.put('/bookings/:id/cancel', protect, cancelBooking);

// Revenue
router.get('/revenue/summary', protect, clinicAdmin, getRevenueSummary);
router.get('/revenue/transactions', protect, clinicAdmin, getRevenueTransactions);

// Technicians
router.get('/technicians', protect, clinicAdmin, getTechnicians);

// Clinic Setup
router.get('/my-clinic', protect, clinicAdmin, getMyClinic);
router.post('/setup', protect, clinicAdmin, setupClinic);
router.post('/upload-license', protect, clinicAdmin, upload.single('license'), uploadClinicLicense);

module.exports = router;
