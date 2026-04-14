import { useState, useEffect, useCallback } from 'react';
import {
  getBookings, getBookingById, assignTechnician, updateBookingStatus,
  uploadReport, cancelBooking, getTechnicians,
} from '../api/clinicApi';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeStatus, setActiveStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentBooking, setCurrentBooking] = useState(null);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  const fetchBookings = useCallback(async (status = activeStatus, p = page) => {
    setLoading(true); setError(null);
    try {
      const [bookRes, techRes] = await Promise.all([
        getBookings(status, p),
        getTechnicians(),
      ]);
      setBookings(bookRes.data.data.docs);
      setTotalPages(bookRes.data.data.totalPages);
      setTechnicians(techRes.data.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [activeStatus, page]);

  useEffect(() => { fetchBookings(activeStatus, page); }, [activeStatus, page]);

  const fetchBookingById = useCallback(async (id) => {
    setLoading(true); setError(null);
    try {
      const res = await getBookingById(id);
      setCurrentBooking(res.data.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  const handleAssignTechnician = async (bookingId, data) => {
    setActionLoading(bookingId);
    try {
      await assignTechnician(bookingId, data);
      await fetchBookings(activeStatus);
      if (currentBooking?._id === bookingId || currentBooking?.id === bookingId)
        await fetchBookingById(bookingId);
      flash('Technician assigned!');
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleStatusUpdate = async (bookingId, status, description) => {
    setActionLoading(bookingId);
    try {
      await updateBookingStatus(bookingId, { status, description });
      await fetchBookings(activeStatus);
      if (currentBooking?._id === bookingId || currentBooking?.id === bookingId)
        await fetchBookingById(bookingId);
      flash('Status updated!');
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleUploadReport = async (bookingId, file) => {
    setActionLoading(bookingId);
    try {
      const fd = new FormData();
      fd.append('reports', file);
      await uploadReport(bookingId, fd);
      await fetchBookings(activeStatus);
      if (currentBooking?._id === bookingId || currentBooking?.id === bookingId)
        await fetchBookingById(bookingId);
      flash('Report uploaded successfully!');
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await cancelBooking(bookingId);
      await fetchBookings(activeStatus);
      flash('Booking cancelled.');
    } catch (err) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const filterByStatus = (status) => setActiveStatus(status);

  return {
    bookings, technicians, currentBooking, loading, actionLoading, error, success,
    activeStatus, filterByStatus,
    page, totalPages, setPage,
    fetchBookingById,
    handleAssignTechnician, handleStatusUpdate, handleUploadReport, handleCancel,
    refetch: fetchBookings,
  };
};
