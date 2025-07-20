import { MapPin, Calendar, Users, Star, Phone, Mail, Car, Clock, Mountain, Waves, Building, TreePine } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Drivers() {

    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/drivers")
            .then(response => {
                setDrivers(response.data);
            })
            .catch(error => {
                console.error("Error fetching drivers:", error);
            });
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Professional Tour Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {drivers.map(driver => (
                <div key={driver.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={driver.image}
                      alt={driver.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                      driver.availability ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {driver.availability ? 'Available' : 'Busy'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{driver.name}</h3>
                    <h5 className="text-xl font-medium text-gray-900 mb-2">{driver.phoneNumber}</h5>
                    <p className="text-sm text-gray-600 mb-2">Vehicle Type :  
                        <span key={driver.vehicleType} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {driver.vehicleType}
                        </span>
                    </p>
                
                    {/* <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{driver.phoneNumber}</span>
                      <span className="text-gray-500 text-sm ml-2">{driver.vehicleType}</span>
                    </div> */}
                    {/* <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Languages:</p>
                      <div className="flex flex-wrap gap-2">
                        {driver.languages.map(lang => (
                          <span key={lang} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div> */}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">
                        {/* ${driver.pricePerDay}/day */}
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          driver.availability
                            ? 'bg-sky-600 text-white hover:bg-sky-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!driver.availability}
                      >
                        {driver.availability ? 'Book Now' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
    );

}