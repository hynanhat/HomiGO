import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Maximize, Calendar, Heart, Share2 } from 'lucide-react';
import api from '../services/api';

const ListingDetailPage = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data.data);
      } catch (error) {
        console.error('Failed to fetch listing details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Không tìm thấy thông tin bất động sản.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Image Gallery */}
          <div className="h-96 bg-gray-200">
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={`http://localhost:8080${listing.images[0]}`} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Không có hình ảnh
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{listing.title}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-1" />
                  <span>{listing.districtName}, {listing.provinceName}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(listing.price)}
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 border border-red-200 bg-red-50 rounded-full hover:bg-red-100 transition-colors">
                    <Heart className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-100 mb-8">
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-full mr-3">
                  <Maximize className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Diện tích</div>
                  <div className="font-semibold">{listing.area} m²</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-full mr-3">
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ngày đăng</div>
                  <div className="font-semibold">
                    {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin mô tả</h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
