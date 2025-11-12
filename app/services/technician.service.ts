import API from '../utils/API';

export interface Technician {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnicianData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface UpdateTechnicianData {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export const getAllTechnicians = async () => {
  const response = await API.get('/technician');
  return response;
};

export const getTechnicianById = async (id: string) => {
  const response = await API.get(`/technician/${id}`);
  return response;
};

export const createTechnician = async (data: CreateTechnicianData) => {
  const response = await API.post('/technician', data);
  return response;
};

export const updateTechnician = async (
  id: string,
  data: UpdateTechnicianData
) => {
  const response = await API.put(`/technician/${id}`, data);
  return response;
};

export const deleteTechnician = async (id: string) => {
  const response = await API.delete(`/technician/${id}`);
  return response;
};
