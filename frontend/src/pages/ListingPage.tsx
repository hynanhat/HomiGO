import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import api from '../services/api';

const ListingPage = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const type = searchParams.get('type') || '';
        const keyword = searchParams.get('q') || '';
        // In a real app, you'd pass these as params, for now just basic fetch
        const res = await api.get(`/listings?transactionType=${type}&keyword=${keyword}&page=${page}&size=12`);
        setListings(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
      } catch (error) {
        console.error('Failed to fetch listings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [searchParams, page]);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kết Quả Tìm Kiếm</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {listings.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow">
                Không tìm thấy bất động sản nào phù hợp.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing: any) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <button 
                      disabled={page === 0}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2">Trang {page + 1} / {totalPages}</span>
                    <button 
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListingPage;
