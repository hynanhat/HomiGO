import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState('buy');
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/listings?type=${transactionType}&q=${keyword}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 w-full max-w-4xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
            Tìm Kiếm Ngôi Nhà Mơ Ước Của Bạn
          </h1>
          
          <div className="bg-white p-4 rounded-xl shadow-2xl">
            <div className="flex space-x-4 mb-4 border-b">
              <button 
                className={`pb-2 px-4 font-medium transition-colors ${transactionType === 'buy' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                onClick={() => setTransactionType('buy')}
              >
                Mua Bán
              </button>
              <button 
                className={`pb-2 px-4 font-medium transition-colors ${transactionType === 'rent' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                onClick={() => setTransactionType('rent')}
              >
                Cho Thuê
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Nhập địa điểm, dự án hoặc từ khóa..." 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              </div>
              <button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
              >
                Tìm Kiếm
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Featured Section placeholder */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Bất Động Sản Nổi Bật</h2>
        <div className="text-center text-gray-500">
          Danh sách bất động sản sẽ được tải tại đây...
        </div>
      </div>
    </div>
  );
};

export default HomePage;
