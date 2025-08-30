import React, { useEffect, useRef } from 'react';
import { Map, Zap, Warehouse } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const TheSolution = () => {
  const solutions = [
    {
      title: "Planned Infrastructure",
      description: "Overlay existing and planned hydrogen production facilities, pipelines, and storage networks to identify optimal integration points.",
      icon: <Map className="text-[#4A90E2] w-12 h-12" />,
    },
    {
      title: "Renewable Energy Availability",
      description: "Analyze solar irradiance, wind patterns, and capacity factors to pinpoint the most cost-effective renewable energy sources.",
      icon: <Zap className="text-[#4A90E2] w-12 h-12" />,
    },
    {
      title: "Demand Centers & Transport Networks",
      description: "Map industrial demand clusters, population centers, and existing transport corridors to optimize distribution strategies.",
      icon: <Warehouse className="text-[#4A90E2] w-12 h-12" />,
    },
  ];

  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(sectionRef);
      gsap.from(q('.solution-heading'), {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
      gsap.from(q('.solution-card'), {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-6 md:px-20 text-center bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="solution-heading text-3xl md:text-4xl font-bold text-gray-800">
          The Solution: A Unified, Geospatial Intelligence Platform
        </h2>
        <p className="mt-4 text-gray-600">
          Three integrated data streams that power smarter hydrogen infrastructure decisions
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div key={index} className="solution-card p-6 border border-gray-200 rounded-lg shadow-sm bg-[#F8F9FA] text-left flex flex-col items-center md:items-start">
              <div className="mb-4">
                {solution.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{solution.title}</h3>
              <p className="text-gray-600 text-sm">{solution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheSolution;