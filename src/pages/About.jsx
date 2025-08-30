import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <section className="px-6 md:px-20 py-20 max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">About H2Atlas</h1>
        <p className="mt-4 text-lg text-gray-600">
          H2Atlas delivers real-time intelligence for green hydrogen infrastructure planning, investment decisions,
          and market positioning. We combine geospatial data, transportation connectivity, and renewable supply insights into a
          single, interactive analysis experience.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold">What we do</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-700">
              <li>Map industrial demand, renewable plants, and infrastructure layers.</li>
              <li>Analyze proximity to multi-modal transport (rail, road, air, water, metro, pipelines, seaports).</li>
              <li>Score and filter potential locations using configurable weights.</li>
              <li>Provide fast, responsive exploration powered by modern web GIS.</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold">How it helps</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-700">
              <li>Identify high-potential sites for hydrogen production and offtake.</li>
              <li>Reduce project risk with transparent, data-backed location insights.</li>
              <li>Accelerate decision-making with clear scoring and visual layers.</li>
              <li>Align stakeholders around a shared, interactive source of truth.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold">Key capabilities</h2>
          <ul className="mt-3 space-y-2 list-disc list-inside text-gray-700">
            <li>GIS mapping built with React and React Leaflet for smooth interaction.</li>
            <li>Nearby transport fetched via OpenStreetMap Overpass API (no API key required).</li>
            <li>Renewable plants and industrial demand datasets with flexible styling.</li>
            <li>Configurable scoring weights and real-time filtering for quick trade-off analysis.</li>
          </ul>
        </div>

        <div className="mt-8 p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-semibold">Get started</h2>
          <ol className="mt-3 space-y-2 list-decimal list-inside text-gray-700">
            <li>Open Preferences to set region and transport modes that matter to you.</li>
            <li>Explore data layers and insights on the interactive maps.</li>
            <li>Use filters and weights to focus on the best opportunities.</li>
          </ol>
          <div className="mt-6 flex gap-3">
            <Link to="/" className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-md">Back to Home</Link>
            <Link to="/preferences" className="bg-[#4A90E2] hover:bg-[#3A7EDC] text-white font-medium py-2 px-4 rounded-md">Open Preferences</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
