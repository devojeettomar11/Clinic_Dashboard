import { useState, useEffect, useCallback } from 'react';
import {
  getPackages, createPackage, updatePackage,
  deletePackage, togglePackageStatus,
} from '../api/clinicApi';

export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPackages = useCallback(async (p = page) => {
    setLoading(true); setError(null);
    try {
      const res = await getPackages(p);
      setPackages(res.data.data.docs);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchPackages(page); }, [fetchPackages, page]);

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  const handleCreate = async (data) => {
    setSaving(true); setError(null);
    try {
      await createPackage(data);
      await fetchPackages();
      flash('Package created successfully!');
      return true;
    } catch (err) { setError(err.response?.data?.message || err.message); return false; }
    finally { setSaving(false); }
  };

  const handleUpdate = async (id, data) => {
    setSaving(true); setError(null);
    try {
      await updatePackage(id, data);
      await fetchPackages();
      flash('Package updated successfully!');
      return true;
    } catch (err) { setError(err.response?.data?.message || err.message); return false; }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deletePackage(id);
      await fetchPackages();
      flash('Package deleted.');
    } catch (err) { setError(err.response?.data?.message || err.message); }
  };

  const handleToggle = async (id) => {
    try {
      await togglePackageStatus(id);
      await fetchPackages();
    } catch (err) { setError(err.message); }
  };

  return { packages, loading, saving, error, success, page, totalPages, setPage, handleCreate, handleUpdate, handleDelete, handleToggle, refetch: fetchPackages };
};
