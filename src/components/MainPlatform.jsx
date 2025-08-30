import React from 'react';
import { Link } from 'react-router-dom';

const MainPlatform = ({ filters = { state: '', modes: [] } }) => {
  const stateLabel = filters?.state && filters.state.length > 0 ? filters.state : 'All India';
  const modesLabel = (filters?.modes?.length ?? 0) === 0
    ? 'No modes selected'
    : (filters.modes.includes('All') ? 'All transportation modes' : filters.modes.join(', '));
  return (
    <section className="py-20 px-6 md:px-20 bg-[#F8F9FA]"> {/* Light gray background */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
          Real-time Intelligence At Your Fingertips
        </h2>
        <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
          Transform complex hydrogen infrastructure data into actionable insights with our advanced GIS-powered platform. Monitor, analyze, and optimize your operations with unprecedented clarity.
        </p>

        {/* Active Filters Card */}
        <div className="mt-8 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg shadow p-4">
            <div>
              <div className="text-sm text-gray-500">Active Filters</div>
              <div className="mt-1 text-gray-800">
                <span className="font-semibold">Region:</span> {stateLabel}
              </div>
              <div className="text-gray-800">
                <span className="font-semibold">Transportation:</span> {modesLabel}
              </div>
            </div>
            <Link to="/preferences" className="self-start md:self-auto px-4 py-2 rounded-md bg-[#4A90E2] hover:bg-[#3A7EDC] text-white text-sm font-medium shadow">Edit preferences</Link>
          </div>
        </div>

        {/* Stats Selector removed per request */}

        <div className="mt-12 flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
          {/* Left Panel */}
          <div className="lg:w-1/4 space-y-4">
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Live Infrastructure Monitoring</h3>
              <p className="text-sm text-gray-600 mt-2">Real-time tracking of hydrogen assets with automated alerts and performance metrics.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Temporal Analysis & Forecasting</h3>
              <p className="text-sm text-gray-600 mt-2">Historical trend analysis with predictive modeling for strategic planning.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Multi-Layer Data Integration</h3>
              <p className="text-sm text-gray-600 mt-2">Seamless integration of infrastructure, market, and environmental data layers.</p>
            </div>
          </div>

          {/* Map and Dashboard Section */}
          <div className="lg:w-1/2 relative">
            <div className="p-4 bg-white rounded-lg shadow-lg h-full border border-gray-200">
              {/* Map Placeholder */}
              <img src="https://i.imgur.com/k6lPq5G.jpg" alt="Hydrogen Map" className="w-full h-auto rounded-lg" />
              
              {/* Floating Layer Panel */}
              <div className="absolute top-8 left-8 bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h4 className="font-semibold text-gray-800">Map Layers</h4>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>Hydrogen Infrastructure</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-[#4A90E2] peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div> {/* Light blue toggle */}
                    </label>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Renewable Energy</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-[#4A90E2] peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div> {/* Light blue toggle */}
                    </label>
                  </li>
                  {/* ... other layers */}
                </ul>
              </div>

              {/* Floating Dashboard */}
              <div className="absolute top-8 right-8 bg-white p-4 rounded-lg shadow-md w-64 border border-gray-200">
                <h4 className="font-bold mb-2 text-gray-800">Real-Time Dashboard</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Total Production</span>
                    <p className="font-semibold text-xl text-green-600">1821 MW</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Demand</span>
                    <p className="font-semibold text-xl text-red-600">414 MW</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Market Price</span>
                    <p className="font-semibold text-xl text-purple-600">€5.45/kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:w-1/4 space-y-4">
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Spatial Query & Analysis Tools</h3>
              <p className="text-sm text-gray-600 mt-2">Advanced geospatial analysis for site selection and route optimization.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Real-Time Market Intelligence</h3>
              <p className="text-sm text-gray-600 mt-2">Dynamic market data visualization with demand forecasting capabilities.</p>
            </div>
          </div>
        </div>

        {/* Report/Document CTA Row removed per request; moved to Preferences page */}
      </div>
    </section>
  );
};

export default MainPlatform;