import React from 'react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const MainPlatform = ({ filters = { state: '', modes: [] } }) => {
  const stateLabel = filters?.state && filters.state.length > 0 ? filters.state : 'All India';
  const modesLabel = (filters?.modes?.length ?? 0) === 0
    ? 'No modes selected'
    : (filters.modes.includes('All') ? 'All transportation modes' : filters.modes.join(', '));

  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context((self) => {
      const q = self.selector;
      // Word-reveal for headings/paragraphs
      const toSplit = q('.reveal-words');
      toSplit.forEach((el) => {
        if (!el.dataset.split) {
          const text = (el.textContent || '').trim();
          el.innerHTML = text
            .split(' ')
            .map((w) => `<span class=\"oh\"><span class=\"word\">${w}&nbsp;</span></span>`)
            .join('');
          el.dataset.split = '1';
        }
        const words = el.querySelectorAll('.word');
        gsap.set(words, { y: '110%', opacity: 0, skewY: 6 });
        gsap.to(words, {
          y: '0%', opacity: 1, skewY: 0,
          duration: 1.2, // Increased duration for a slower reveal
          ease: 'power4.out', stagger: 0.05, // Increased stagger for a more deliberate feel
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
        });
      });
      gsap.from(q('.platform-heading'), {
        y: 40,
        opacity: 0,
        duration: 1.5, // Slower animation
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
      gsap.from(q('.platform-card'), {
        y: 30,
        opacity: 0,
        duration: 1.0, // Slower animation
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
      gsap.from(q('.platform-map'), {
        y: 40,
        opacity: 0,
        duration: 1.5, // Slower animation
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
      gsap.from(q('.platform-left > div'), {
        y: 30,
        opacity: 0,
        duration: 1.0, // Slower animation
        stagger: 0.1, // Increased stagger
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
      gsap.from(q('.platform-right > div'), {
        y: 30,
        opacity: 0,
        duration: 1.0, // Slower animation
        stagger: 0.1, // Increased stagger
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-20 bg-section bg-noise"> {/* Increased vertical padding */}
      <div className="max-w-7xl mx-auto space-y-16"> {/* Increased vertical spacing between sections */}
        <div className="text-center">
          <h2 className="platform-heading text-4xl md:text-5xl font-bold text-gray-800 reveal-words">
            Real-time Intelligence At Your Fingertips
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto reveal-words">
            Transform complex hydrogen infrastructure data into actionable insights with our advanced GIS-powered platform. Monitor, analyze, and optimize your operations with unprecedented clarity.
          </p>
        </div>

        {/* Active Filters Card */}
        <div className="platform-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border border-gray-200 rounded-2xl shadow-lg p-6"> {/* Updated styling for card */}
            <div>
              <div className="text-sm text-gray-500">Active Filters</div>
              <div className="mt-1 text-gray-800 text-lg">
                <span className="font-semibold">Region:</span> {stateLabel}
              </div>
              <div className="text-gray-800 text-lg">
                <span className="font-semibold">Transportation:</span> {modesLabel}
              </div>
            </div>
            <Link to="/preferences" className="btn-sweep btn-primary magnet inline-flex items-center font-semibold px-6 py-3 rounded-xl border">
              <span className="label">Edit preferences</span>
              <span className="arrow ml-2">→</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row space-y-12 lg:space-y-0 lg:space-x-12 mt-12"> {/* Adjusted spacing and top margin */}
          {/* Left Panel */}
          <div className="platform-left lg:w-1/4 space-y-6"> {/* Increased spacing */}
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Live Infrastructure Monitoring</h3>
              <p className="text-sm text-gray-600 mt-2">Real-time tracking of hydrogen assets with automated alerts and performance metrics.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Temporal Analysis & Forecasting</h3>
              <p className="text-sm text-gray-600 mt-2">Historical trend analysis with predictive modeling for strategic planning.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Multi-Layer Data Integration</h3>
              <p className="text-sm text-gray-600 mt-2">Seamless integration of infrastructure, market, and environmental data layers.</p>
            </div>
          </div>

          {/* Map and Dashboard Section */}
          <div className="lg:w-1/2 relative">
            <div className="platform-map p-6 bg-white rounded-xl shadow-lg h-full border border-gray-200 relative">
              <div className="w-full h-80 md:h-[32rem] rounded-lg overflow-hidden">
                <iframe
                  title="India Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=68.0%2C6.0%2C98.0%2C38.0&layer=mapnik"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Floating Layer Panel */}
              <div className="absolute top-8 left-8 bg-white p-5 rounded-xl shadow-md border border-gray-200">
                <h4 className="font-semibold text-gray-800">Map Layers</h4>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex items-center justify-between">
                    <span>Hydrogen Infrastructure</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-[#4A90E2] peer-checked:after:translate-x-full after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Renewable Energy</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-[#4A90E2] peer-checked:after:translate-x-full after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                  </li>
                </ul>
              </div>

              {/* Floating Dashboard */}
              <div className="absolute top-8 right-8 bg-white p-5 rounded-xl shadow-md w-64 border border-gray-200">
                <h4 className="font-bold mb-3 text-gray-800">Real-Time Dashboard</h4>
                <div className="space-y-3 text-sm">
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
          <div className="platform-right lg:w-1/4 space-y-6"> {/* Increased spacing */}
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Spatial Query & Analysis Tools</h3>
              <p className="text-sm text-gray-600 mt-2">Advanced geospatial analysis for site selection and route optimization.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-800">Real-Time Market Intelligence</h3>
              <p className="text-sm text-gray-600 mt-2">Dynamic market data visualization with demand forecasting capabilities.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainPlatform;