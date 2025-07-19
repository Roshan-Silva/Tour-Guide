import { MapPin, Calendar, Users, Star, Phone, Mail, Car, Clock, Mountain, Waves, Building, TreePine } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {

    const [places, setPlaces] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/places")
            .then(response => {
                setPlaces(response.data);
            })
            .catch(error => {
                console.error("Error fetching places:", error);
            });
    }, []);

  return (
    <>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-6">Popular Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map(place => (
                <div key={place._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={place.image} alt={place.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                    {/* <p className="text-gray-600 mb-4">{place.location}</p> */}
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{place.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {place.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                </div>
                </div>
            ))}
            </div>
        </div>
      </>



  );
}