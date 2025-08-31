import React, { useEffect, useRef } from 'react';
import { Repeat2, CircleDollarSign, Gauge } from 'lucide-react';

const TheChallenge = () => {
  const challenges = [
    {
      title: "Redundant Investments",
      description: "Multiple regions independently develop similar hydrogen projects without coordination, leading to duplicated efforts and missed synergies.",
      statistic: "40% duplicated projects across regions",
      icon: <Repeat2 className="text-blue-600 w-8 h-8" />,
    },
    {
      title: "Higher Project Costs",
      description: "Isolated planning increases project expenses through suboptimal routing, missed economies of scale and inefficient resource allocation.",
      statistic: "25-30% cost premium from fragmentation",
      icon: <CircleDollarSign className="text-blue-600 w-8 h-8" />,
    },
    {
      title: "Underutilized Resources",
      description: "Existing infrastructure and renewable energy capacity remain underexploited due to lack of comprehensive regional demand mapping and coordination.",
      statistic: "60% of renewable capacity underutilized",
      icon: <Gauge className="text-blue-600 w-8 h-8" />,
    },
  ];

  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate title words
            if (entry.target === titleRef.current) {
              const words = entry.target.querySelectorAll('.word');
              words.forEach((word, index) => {
                setTimeout(() => {
                  word.style.transform = 'translateY(0)';
                  word.style.opacity = '1';
                }, index * 200); // Slower stagger for title words
              });
            }

            // Animate cards
            cardsRef.current.forEach((card, index) => {
              if (card && entry.target.contains(card)) {
                setTimeout(() => {
                  card.style.transform = 'translateY(0)';
                  card.style.opacity = '1';
                }, index * 300); // Slower stagger for cards
              }
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-50px'
      }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const splitTextIntoWords = (text) => {
    return text.split(' ').map((word, index) => (
      <span
        key={index}
        className="word inline-block overflow-hidden" // Added overflow-hidden for a cleaner effect
        style={{
          transform: 'translateY(40px)', // Increased starting position
          opacity: 0,
          transition: 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Slower and smoother transition
        }}
      >
        {word}&nbsp;
      </span>
    ));
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 lg:py-40 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 bg-gradient-to-br from-gray-50 to-blue-50" // Increased vertical padding
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20"> {/* Increased bottom margin */}
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-4" // Increased font size
          >
            {splitTextIntoWords("The Challenge: Fragmented Planning, Inefficient Growth.")}
          </h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-4"></div> {/* Wider and thicker divider */}
        </div>

        {/* Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-16"> {/* Increased gap between cards */}
          {challenges.map((challenge, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-6 md:p-8 transition-all duration-700 hover:-translate-y-2" // Updated styling and transition
              style={{
                transform: 'translateY(50px)', // Increased starting position
                opacity: 0,
                transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Slower and smoother transition
              }}
            >
              {/* Icon */}
              <div className="mb-6 flex justify-center md:justify-start">
                <div className="p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors duration-500">
                  {challenge.icon}
                </div>
              </div>

              {/* Content */}
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800 leading-tight">
                  {challenge.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {challenge.description}
                </p>

                {/* Statistics */}
                <div className="space-y-3">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">
                    {challenge.statistic}
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-3 py-1.5">
                    Show executive evidence
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button className="group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2">
            <span className="mr-2">See how we solve these</span>
            <span className="text-lg group-hover:translate-x-1 transition-transform duration-200">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TheChallenge;