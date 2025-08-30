import React, { useEffect, useRef } from 'react';
import { Repeat2, CircleDollarSign, Gauge } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const TheChallenge = () => {
  const challenges = [
    {
      title: "Redundant Investments",
      description: "Multiple regions independently develop similar hydrogen projects without coordination, leading to duplicated efforts and missed synergies.",
      statistic: "40% duplicated projects across regions",
      icon: <Repeat2 className="text-[#4A90E2] w-12 h-12" />,
    },
    {
      title: "Higher Project Costs",
      description: "Isolated planning increases project expenses through suboptimal routing, missed economies of scale and inefficient resource allocation.",
      statistic: "25-30% cost premium from fragmentation",
      icon: <CircleDollarSign className="text-[#4A90E2] w-12 h-12" />,
    },
    {
      title: "Underutilized Resources",
      description: "Existing infrastructure and renewable energy capacity remain underexploited due to lack of comprehensive regional demand mapping and coordination.",
      statistic: "60% of renewable capacity underutilized",
      icon: <Gauge className="text-[#4A90E2] w-12 h-12" />,
    },
  ];

  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(sectionRef);

      // Word-reveal animation for elements with .reveal-words
      const toSplit = q('.reveal-words');
      toSplit.forEach((el) => {
        if (!el.dataset.split) {
          const text = (el.textContent || '').trim();
          el.innerHTML = text
            .split(' ')
            .map((w) => `<span class="oh"><span class="word">${w}&nbsp;</span></span>`) 
            .join('');
          el.dataset.split = '1';
        }
        const words = el.querySelectorAll('.word');
        gsap.set(words, { y: '110%', opacity: 0, skewY: 6 });
        gsap.to(words, {
          y: '0%',
          opacity: 1,
          skewY: 0,
          duration: 0.75,
          ease: 'power4.out',
          stagger: 0.03,
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'restart none none reset', invalidateOnRefresh: true }
        });
      });

      gsap.from(q('.challenge-card'), {
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
    <section ref={sectionRef} className="py-20 px-6 md:px-20 text-center bg-section bg-noise">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 reveal-words">
          The Challenge: Fragmented Planning, Inefficient Growth.
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => (
            <div key={index} className="challenge-card p-6 border border-gray-200 rounded-lg shadow-sm bg-white text-left flex flex-col items-center md:items-start">
              <div className="mb-4">
                {challenge.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{challenge.title}</h3>
              <p className="text-gray-600 text-sm">{challenge.description}</p>
              <div className="mt-4">
                <span className="font-bold text-[#4A90E2] block">{challenge.statistic}</span>
                <a href="#" className="text-[#4A90E2] text-sm hover:underline mt-1 block">Show executive evidence</a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <a href="#" className="btn-sweep btn-primary magnet inline-flex items-center font-semibold py-3 px-6 rounded-xl border">
            <span className="label">See how we solve these</span>
            <span className="arrow ml-2">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default TheChallenge;