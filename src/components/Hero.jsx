import React from 'react';
import { Eye, BarChart2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-white py-20 px-6 md:px-20 text-center md:text-left">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
            Navigate the Green
            <br />
            Hydrogen Economy with
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Precision
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Real-time intelligence for hydrogen infrastructure planning, investment decisions, and market positioning.
          </p>
          <div className="mt-8 flex justify-center md:justify-start">
            <Link to="/preferences" className="bg-[#4A90E2] hover:bg-[#3A7EDC] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg">
              Preferences
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center md:justify-start text-sm text-gray-500 space-x-4">
            <span className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>Real-time data</span>
            </span>
            <span className="flex items-center space-x-1">
              <BarChart2 className="h-4 w-4" />
              <span>Market intelligence</span>
            </span>
            <span className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>Global coverage</span>
            </span>
          </div>
        </div>
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center items-center">
          <div className="bg-white p-4 rounded-xl shadow-2xl">
            <img src="https://i.imgur.com/G3t7x5I.png" alt="Interactive Hydrogen Network" className="w-80 h-auto" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;