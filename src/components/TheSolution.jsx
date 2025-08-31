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
          duration: 1.2, // Slower duration for text
          ease: 'power4.out', stagger: 0.05, // Slower stagger
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
        });
      });
      gsap.from(q('.solution-card'), {
        y: 40, // Increased start position
        opacity: 0,
        duration: 1.5, // Slower duration for cards
        stagger: 0.2, // Slower stagger
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-20 text-center bg-white bg-noise"> {/* Increased padding */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-16"> {/* Increased bottom margin for header */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 reveal-words">
            The Solution: A Unified, Geospatial Intelligence Platform
          </h2>
          <p className="mt-4 text-lg text-gray-600 reveal-words max-w-2xl mx-auto"> {/* Added max-width and adjusted font size */}
            Three integrated data streams that power smarter hydrogen infrastructure decisions
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"> {/* Increased gap between cards */}
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="solution-card p-8 border border-gray-200 rounded-2xl shadow-lg bg-[#F8F9FA] text-left flex flex-col items-center md:items-start transition-all duration-300 hover:shadow-xl hover:-translate-y-2" // Updated styling and added hover effect
            >
              <div className="mb-6">
                {solution.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-800">{solution.title}</h3> {/* Adjusted font size */}
              <p className="text-gray-600 text-base">{solution.description}</p> {/* Adjusted font size */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheSolution;