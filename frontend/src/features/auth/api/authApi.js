import httpClient from '../../../services/httpClient';

export const loginApi = (data) => httpClient.post('/auth/login', data);
export const registerApi = (data) => httpClient.post('/auth/register', data);
export const getMeApi = () => httpClient.get('/auth/me');
export const refreshUserApi = () => httpClient.get('/auth/refresh');
export const changePassword = (currentPassword, newPassword) =>
  httpClient.put('/auth/change-password', { currentPassword, newPassword });
export const deleteAccount = () => httpClient.delete('/auth/delete-account');
