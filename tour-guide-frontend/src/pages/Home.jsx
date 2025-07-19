import { MapPin, Calendar, Users, Star, Phone, Mail, Car, Clock, Mountain, Waves, Building, TreePine } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative h-96 bg-gradient-to-r from-blue-700 to-yellow-300 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h2 className="text-5xl font-bold mb-4">Discover Beautiful Sri Lanka</h2>
            <p className="text-xl mb-8 text-white/90">
              Plan your perfect journey through the Pearl of the Indian Ocean with personalized recommendations
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Mountain className="h-5 w-5" />
                <span>Ancient Wonders</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Waves className="h-5 w-5" />
                <span>Pristine Beaches</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <TreePine className="h-5 w-5" />
                <span>Wildlife Safari</span>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
}