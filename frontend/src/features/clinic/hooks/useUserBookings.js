import { useState, useEffect, useCallback } from 'react';
import { getMyBookings } from '../api/clinicApi';

export const useUserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = useCallback(async (p = page) => {
    setLoading(true); setError(null);
    try {
      const res = await getMyBookings(p);
      setBookings(res.data.data.docs);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchBookings(page); }, [fetchBookings, page]);

  return { bookings, loading, error, page, totalPages, setPage, refetch: fetchBookings };
};
