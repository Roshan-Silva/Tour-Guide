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

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-[calc(100vh-5rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/driver" element={<DriverRoute><DriverDashboard view="overview" /></DriverRoute>} />
          <Route path="/driver/bookings" element={<DriverRoute><DriverDashboard view="bookings" /></DriverRoute>} />
          <Route path="/driver/profile" element={<DriverRoute><DriverDashboard view="profile" /></DriverRoute>} />
          <Route path="/driver/apply" element={<DriverApply />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}
export default App;
