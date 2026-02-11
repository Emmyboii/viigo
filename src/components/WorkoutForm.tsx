'use client';
import { useState } from 'react';

export default function WorkoutForm() {
    const [name, setName] = useState('');
    const [dailyWorkout, setDailyWorkout] = useState('');
    const [weeklyWorkout, setWeeklyWorkout] = useState('');

    const isFormComplete = name && dailyWorkout && weeklyWorkout;

    const dailyOptions = ['More than an hour', 'Less than an hour', 'Not sure'];
    const weeklyOptions = ['1-2 days', '3-4 days', '5+ days', 'Not sure'];

    const handleSubmit = () => {
        if (!isFormComplete) return;
        const data = { name, dailyWorkout, weeklyWorkout };
        console.log('Saved data:', data);
        alert('Data saved! Check console.');
    };

    return (
        <div className="p-5 space-y-6 flex flex-col h-screen">

            <div className="flex-1 overflow-y-auto space-y-6">
                {/* Question 1 */}
                <div>
                    <label className="block mb-2 font-semibold text-black text-[22px]">
                        What's your Name?
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border border-[#475569] text-[#0F172A] text-sm w-full rounded-lg py-2 px-4 outline-none h-[48px]"
                        placeholder="Please type our name here ..."
                    />
                </div>

                {/* Question 2 */}
                <div>
                    <p className="mb-2 font-semibold text-black text-[22px]">
                        How many hours a day do you workout?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {dailyOptions.map((option) => (
                            <div
                                key={option}
                                onClick={() => setDailyWorkout(option)}
                                className={`cursor-pointer p-1.5 text-[10px] text-center font-normal text-nowrap rounded-full border ${dailyWorkout === option
                                    ? 'bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]'
                                    : 'border-[#475569] bg-white text-[#475569]'
                                    }`}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question 3 */}
                <div>
                    <p className="mb-2 font-semibold text-black text-[22px] :text-gray-200">
                        How often do you usually work out in a week?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {weeklyOptions.map((option) => (
                            <div
                                key={option}
                                onClick={() => setWeeklyWorkout(option)}
                                className={`cursor-pointer p-1.5 text-[10px] text-center font-normal rounded-full border ${weeklyWorkout === option
                                    ? 'bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]'
                                    : 'border-[#475569] bg-white text-[#475569]'
                                    }`}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSubmit}
                disabled={!isFormComplete}
                className={`rounded-md w-full px-2 h-[48px] items-end text-white font-semibold text-sm ${isFormComplete
                    ? 'bg-[#2563EB] cursor-pointer'
                    : 'bg-[#94A3B8] cursor-not-allowed'
                    }`}
            >
                Continue
            </button>
        </div >
    );
}
