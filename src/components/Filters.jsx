import React from 'react';

const INDIA_STATES = [
  'All India',
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

const TRANSPORT_OPTIONS = ['Railways','Roadways','Airways','All'];

export default function Filters({ value, onChange }) {
  const selectedState = value?.state ?? '';
  const modes = value?.modes ?? [];

  const updateState = (e) => {
    const v = e.target.value;
    onChange?.({ state: v === 'All India' ? '' : v, modes });
  };

  const toggleMode = (option) => (e) => {
    const checked = e.target.checked;
    if (option === 'All') {
      onChange?.({ state: selectedState, modes: checked ? ['All'] : [] });
      return;
    }
    let next = new Set(modes.includes('All') ? [] : modes);
    if (checked) next.add(option); else next.delete(option);
    onChange?.({ state: selectedState, modes: Array.from(next) });
  };

  return (
    <section className="py-6 px-6 md:px-20 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region (State/UT)</label>
              <select
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6495ED]"
                value={selectedState || 'All India'}
                onChange={updateState}
              >
                {INDIA_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <span className="block text-sm font-medium text-gray-700 mb-1">Transportation</span>
              <div className="flex flex-wrap gap-4">
                {TRANSPORT_OPTIONS.map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={opt === 'All' ? modes.includes('All') : (!modes.includes('All') && modes.includes(opt))}
                      onChange={toggleMode(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
