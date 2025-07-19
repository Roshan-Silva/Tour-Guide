import { Link } from "react-router-dom";
import { MapPin } from 'lucide-react';

export default function Navbar() {
  return (
    // <nav className="bg-blue-700 text-white p-4 flex gap-4">
    //   <Link to="/" className="font-bold">Home</Link>
    //   <Link to="/signin">Sign In</Link>
    //   <Link to="/signup">Sign Up</Link>
    //   <Link to="/drivers">Drivers</Link>
    // </nav>

    <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-sky-600" />
              <h1 className="text-2xl font-bold text-gray-900">Ceylon Explorer</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
                <Link to="/" className="font-bold">Home</Link>
                <Link to="/signin" className="font-bold">Sign In</Link>
                <Link to="/signup" className="font-bold">Sign Up</Link>
                <Link to="/drivers" className="font-bold">Drivers</Link>
            </nav>
          </div>
        </div>
      </header>

    
  );
}