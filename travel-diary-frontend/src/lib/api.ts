import axios from 'axios';
import { ParamValue } from 'next/dist/server/request/params';

const API_BASE = 'http://127.0.0.1:8000';

export const getAllDiaries = () => axios.get(`${API_BASE}/diary/`);

export const getDiaryById = (id: ParamValue) =>
  axios.get(`${API_BASE}/diary/${id}`);

export const searchDiariesByTags = (tags: string[]) => {
  const queryString = tags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
  return axios.get(`${API_BASE}/diary/search/?${queryString}`);
};

export const createDiary = (formData: FormData) =>
  axios.post(`${API_BASE}/diary/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const updateDiary = (id: ParamValue, formData: FormData) =>
  axios.put(`${API_BASE}/diary/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const deleteDiary = (id: number | string) =>
  axios.delete(`${API_BASE}/diary/${id}`);

export const generateTagsFromImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${API_BASE}/ai/generate_tags`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
