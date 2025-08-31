import React, { useState, useEffect } from "react";
import { Slider } from "@mui/material";

function WeightageInput({ onWeightageChange, onLocationChange, onCalculate, location }) {
    // Note: The `useState` for weights and `useEffect` to call `onWeightageChange`
    // have been moved outside this component in the main 'Heat' component
    // to centralize state management, as per the full refactoring provided previously.
    // However, if you are only changing this file, you can keep the local state.
    const [weights, setWeights] = useState({
        demand: 33,
        renewable: 33,
        power: 34,
    });

    useEffect(() => {
        onWeightageChange(weights);
    }, [weights, onWeightageChange]);

    const handleSliderChange = (type) => (e, newValue) => {
        if (newValue < 0) newValue = 0;
        let newWeights = { ...weights };
        newWeights[type] = newValue;
        const totalRemaining = 100 - newValue;
        const otherKeys = Object.keys(newWeights).filter(key => key !== type);
        const sumOfOthers = newWeights[otherKeys[0]] + newWeights[otherKeys[1]];
        
        if (sumOfOthers > 0) {
            newWeights[otherKeys[0]] = (newWeights[otherKeys[0]] / sumOfOthers) * totalRemaining;
            newWeights[otherKeys[1]] = (newWeights[otherKeys[1]] / sumOfOthers) * totalRemaining;
        } else {
            newWeights[otherKeys[0]] = totalRemaining / 2;
            newWeights[otherKeys[1]] = totalRemaining / 2;
        }
        setWeights(newWeights);
    };

    const handleLocationInputChange = (e) => {
        const { name, value } = e.target;
        onLocationChange({ ...location, [name]: value });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Inputs & Weights</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input
                            type="text"
                            name="lat"
                            value={location.lat}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g., 18.5905"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input
                            type="text"
                            name="lon"
                            value={location.lon}
                            onChange={handleLocationInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="e.g., 75.2493"
                        />
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Demand Areas Weightage:</span>
                        <span className="text-sm text-gray-500">{weights.demand.toFixed(0)}%</span>
                    </div>
                    <Slider
                        value={weights.demand}
                        onChange={handleSliderChange("demand")}
                        min={0}
                        max={100}
                        step={1}
                        sx={{
                            '& .MuiSlider-thumb': { color: '#4A90E2' },
                            '& .MuiSlider-track': { color: '#4A90E2' },
                        }}
                    />
                    
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Renewable Sources Weightage:</span>
                        <span className="text-sm text-gray-500">{weights.renewable.toFixed(0)}%</span>
                    </div>
                    <Slider
                        value={weights.renewable}
                        onChange={handleSliderChange("renewable")}
                        min={0}
                        max={100}
                        step={1}
                        sx={{
                            '& .MuiSlider-thumb': { color: '#4A90E2' },
                            '& .MuiSlider-track': { color: '#4A90E2' },
                        }}
                    />

                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Existing Power Sources Weightage:</span>
                        <span className="text-sm text-gray-500">{weights.power.toFixed(0)}%</span>
                    </div>
                    <Slider
                        value={weights.power}
                        onChange={handleSliderChange("power")}
                        min={0}
                        max={100}
                        step={1}
                        sx={{
                            '& .MuiSlider-thumb': { color: '#4A90E2' },
                            '& .MuiSlider-track': { color: '#4A90E2' },
                        }}
                    />
                </div>
            </div>

            <button
                onClick={onCalculate}
                className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                Calculate Score
            </button>
        </div>
    );
}

export default WeightageInput;