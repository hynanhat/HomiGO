import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import ListingDetailPage from './pages/ListingDetailPage';
import AuthPage from './pages/AuthPage';
import SellerDashboard from './pages/SellerDashboard';
import PostListingPage from './pages/PostListingPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<SellerDashboard />} />
        <Route path="/post" element={<PostListingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
