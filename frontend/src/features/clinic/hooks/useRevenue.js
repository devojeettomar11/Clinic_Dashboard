import { useState, useEffect } from 'react';
import { getRevenueSummary, getRevenueTransactions } from '../api/clinicApi';

export const useRevenue = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRevenue = async (p = period, pg = page) => {
    setLoading(true); setError(null);
    try {
      const [sumRes, txRes] = await Promise.all([
        getRevenueSummary(),
        getRevenueTransactions(p, pg),
      ]);
      setSummary(sumRes.data.data);
      setTransactions(txRes.data.data.docs);
      setTotalPages(txRes.data.data.totalPages);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRevenue(period, page); }, [period, page]);

  return { summary, transactions, loading, error, period, setPeriod, page, totalPages, setPage, refetch: fetchRevenue };
};
