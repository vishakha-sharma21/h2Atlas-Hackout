import React from 'react';
import { Repeat2, CircleDollarSign, Gauge } from 'lucide-react';

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

  return (
    <section className="py-20 px-6 md:px-20 text-center bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          The Challenge: Fragmented Planning, Inefficient Growth.
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white text-left flex flex-col items-center md:items-start">
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
          <a href="#" className="text-[#4A90E2] font-semibold text-lg hover:underline">See how we solve these &rarr;</a>
        </div>
      </div>
    </section>
  );
};

export default TheChallenge;