import httpClient from '../../../services/httpClient';

// ── Packages ──────────────────────────────────────────────
export const getPackages = (page = 1, limit = 10) =>
  httpClient.get(`/clinic/packages?page=${page}&limit=${limit}`);
export const getPackageById = (id) => httpClient.get(`/clinic/packages/${id}`);
export const createPackage = (data) => httpClient.post('/clinic/packages', data);
export const updatePackage = (id, data) => httpClient.put(`/clinic/packages/${id}`, data);
export const deletePackage = (id) => httpClient.delete(`/clinic/packages/${id}`);
export const togglePackageStatus = (id) => httpClient.patch(`/clinic/packages/${id}/toggle`);

// ── Lab Tests ─────────────────────────────────────────────
export const getLabTests = (page = 1, limit = 10) =>
  httpClient.get(`/clinic/lab-tests?page=${page}&limit=${limit}`);
export const getLabTestById = (id) => httpClient.get(`/clinic/lab-tests/${id}`);
export const createLabTest = (data) => httpClient.post('/clinic/lab-tests', data);
export const updateLabTest = (id, data) => httpClient.put(`/clinic/lab-tests/${id}`, data);
export const deleteLabTest = (id) => httpClient.delete(`/clinic/lab-tests/${id}`);

// ── Bookings ──────────────────────────────────────────────
export const getBookings = (status, page = 1, limit = 10) => {
  const params = { page, limit };
  if (status) params.status = status;
  return httpClient.get('/clinic/bookings', { params });
};
export const getBookingById = (id) => httpClient.get(`/clinic/bookings/${id}`);
export const assignTechnician = (id, data) => httpClient.put(`/clinic/bookings/${id}/assign`, data);
export const updateBookingStatus = (id, data) => httpClient.put(`/clinic/bookings/${id}/status`, data);
export const uploadReport = (id, formData) =>
  httpClient.post(`/clinic/bookings/${id}/report`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const cancelBooking = (id) => httpClient.put(`/clinic/bookings/${id}/cancel`);

// ── Patient Bookings (My Bookings) ────────────────────────
export const getMyBookings = (page = 1, limit = 10) =>
  httpClient.get(`/clinic/bookings/my?page=${page}&limit=${limit}`);

// ── Revenue ───────────────────────────────────────────────
export const getRevenueSummary = () => httpClient.get('/clinic/revenue/summary');
export const getRevenueTransactions = (period, page = 1, limit = 10) => {
  const params = { page, limit };
  if (period) params.period = period;
  return httpClient.get('/clinic/revenue/transactions', { params });
};

// ── Technicians ───────────────────────────────────────────
export const getTechnicians = () => httpClient.get('/clinic/technicians');

// ── Profile Setup ─────────────────────────────────────────
export const getMyClinic = () => httpClient.get('/clinic/my-clinic');
export const setupClinic = (data) => httpClient.post('/clinic/setup', data);

export const uploadClinicLicense = (file) => {
  const formData = new FormData();
  formData.append('license', file);
  return httpClient.post('/clinic/upload-license', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
