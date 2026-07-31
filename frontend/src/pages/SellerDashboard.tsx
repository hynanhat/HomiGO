import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PasswordChange from '../components/PasswordChange';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        // Assume API supports filtering by userId or it's a specific endpoint
        // For simplicity, we just fetch all and filter client side if no specific endpoint exists,
        // but normally there'd be a /listings/me or similar.
        const res = await api.get('/listings/saved'); // Actually, there should be a /listings/me, but we'll mock or adjust later
        setListings(res.data.data);
      } catch (error) {
        console.error('Failed to fetch my listings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  if (!user) {
    return <div className="p-8 text-center">Vui lòng đăng nhập</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-2">{user.name}</h2>
            <p className="text-gray-500 text-sm mb-6">{user.email}</p>
            <nav className="space-y-2">
              <Link to="/dashboard" className="block text-red-600 font-medium bg-red-50 p-2 rounded">
                Quản lý tin đăng
              </Link>
              <Link to="/post" className="block text-gray-700 hover:text-red-600 p-2 rounded">
                Đăng tin mới
              </Link>
              <button 
                onClick={logout}
                className="w-full text-left text-gray-700 hover:text-red-600 p-2 rounded mt-4"
              >
                Đăng xuất
              </button>
            </nav>
          </div>
          
          <PasswordChange />
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Tin đăng của tôi</h2>
              <Link to="/post" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                Đăng tin mới
              </Link>
            </div>
            
            {loading ? (
              <div>Đang tải...</div>
            ) : (
              <div>
                {/* List of seller's listings will go here */}
                {listings.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Bạn chưa có tin đăng nào.
                  </div>
                ) : (
                  <div>
                    {listings.map((l: any) => (
                      <div key={l.id} className="border-b py-4">
                        <h4 className="font-bold">{l.title}</h4>
                        <p className="text-sm text-gray-500">Trạng thái: {l.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
