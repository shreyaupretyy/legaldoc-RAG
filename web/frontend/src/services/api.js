import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes for large PDFs
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatAPI = {
  sendMessage: async (question, conversationId = null) => {
    try {
      const response = await api.post('/chat', {
        question,
        conversation_id: conversationId,
      });
      return response.data;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  },
};

export const documentAPI = {
  uploadDocument: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading file:', file.name, 'Size:', file.size);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('Upload progress:', percentCompleted + '%');
          onProgress && onProgress(percentCompleted);
        },
      });
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getDocuments: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      console.error('Get documents error:', error);
      throw error;
    }
  },
};

export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },
};

export default api;