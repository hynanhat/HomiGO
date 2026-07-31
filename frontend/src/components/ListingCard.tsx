import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Heart } from 'lucide-react';

interface Listing {
  id: number;
  title: string;
  price: number;
  area: number;
  districtName: string;
  provinceName: string;
  images: string[];
}

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const imageUrl = listing.images && listing.images.length > 0 
    ? `http://localhost:8080${listing.images[0]}` 
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
        <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
          <Heart className="w-5 h-5 text-gray-500 hover:text-red-500" />
        </button>
        <div className="absolute bottom-3 left-3 bg-red-500 text-white px-3 py-1 rounded-md font-semibold">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(listing.price)}
        </div>
      </div>
      <div className="p-4">
        <Link to={`/listings/${listing.id}`}>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 hover:text-red-500 mb-2">
            {listing.title}
          </h3>
        </Link>
        <div className="flex items-center text-gray-600 mb-2 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{listing.districtName}, {listing.provinceName}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm border-t pt-3 mt-3">
          <div className="flex items-center mr-4">
            <Maximize className="w-4 h-4 mr-1" />
            <span>{listing.area} m²</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
