import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostListingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    categoryId: '1', // Hardcoded for demo, normally fetched
    districtId: '1', // Hardcoded for demo, normally fetched
  });
  const [error, setError] = useState('');
  
  if (!user) {
    return <div className="p-8 text-center">Vui lòng đăng nhập để đăng tin</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        area: parseFloat(formData.area),
        categoryId: parseInt(formData.categoryId),
        districtId: parseInt(formData.districtId)
      };
      
      await api.post('/listings', payload);
      // Success, redirect to dashboard or detail
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng tin');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Đăng tin mới</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mức giá (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Diện tích (m²)</label>
                <input
                  type="number"
                  name="area"
                  required
                  min="1"
                  step="0.1"
                  value={formData.area}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
              <textarea
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            {/* Note: In a real implementation, we would fetch categories and districts, 
                and add a multi-file upload component here using api.post('/listings/upload') */}
            
            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mr-3 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Đăng tin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostListingPage;
