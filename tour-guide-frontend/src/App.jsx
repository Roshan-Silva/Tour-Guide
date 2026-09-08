import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Drivers from './pages/Drivers';
import Navbar from './components/Navbar';
import Bookings from './pages/Bookings';
import Footer from './components/Footer';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';
import DriverDashboard from './pages/DriverDashboard';
import DriverRoute from './components/DriverRoute';
import DriverApply from './pages/DriverApply';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import TripPlanner from './pages/TripPlanner';
import SavedPlaces from './pages/SavedPlaces';
import DriverDetail from './pages/DriverDetail';
import TravelerDashboard from './pages/TravelerDashboard';
import TravelerRoute from './components/TravelerRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SavedItineraries from './pages/SavedItineraries';
import PaymentResult from './pages/PaymentResult';
import AdminFinance from './pages/AdminFinance';
import DriverEarnings from './pages/DriverEarnings';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-[calc(100vh-5rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/drivers/:id" element={<DriverDetail />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:slug" element={<DestinationDetail />} />
          <Route path="/trip-planner" element={<TripPlanner />} />
          <Route path="/saved-places" element={<SavedPlaces />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/payment/return" element={<TravelerRoute><PaymentResult /></TravelerRoute>} />
          <Route path="/payment/cancel" element={<TravelerRoute><PaymentResult cancelled /></TravelerRoute>} />
          <Route path="/traveler" element={<TravelerRoute><TravelerDashboard view="overview" /></TravelerRoute>} />
          <Route path="/traveler/reviews" element={<TravelerRoute><TravelerDashboard view="reviews" /></TravelerRoute>} />
          <Route path="/traveler/profile" element={<TravelerRoute><TravelerDashboard view="profile" /></TravelerRoute>} />
          <Route path="/traveler/itineraries" element={<TravelerRoute><SavedItineraries /></TravelerRoute>} />
          <Route path="/traveler/itineraries/:id" element={<TravelerRoute><SavedItineraries /></TravelerRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminFinance view="payments" /></AdminRoute>} />
          <Route path="/admin/payouts" element={<AdminRoute><AdminFinance view="payouts" /></AdminRoute>} />
          <Route path="/driver" element={<DriverRoute><DriverDashboard view="overview" /></DriverRoute>} />
          <Route path="/driver/bookings" element={<DriverRoute><DriverDashboard view="bookings" /></DriverRoute>} />
          <Route path="/driver/profile" element={<DriverRoute><DriverDashboard view="profile" /></DriverRoute>} />
          <Route path="/driver/earnings" element={<DriverRoute><DriverEarnings /></DriverRoute>} />
          <Route path="/driver/apply" element={<DriverApply />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}
export default App;
