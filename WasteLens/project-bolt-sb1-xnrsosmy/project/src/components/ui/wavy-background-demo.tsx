"use client";
import React from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { BoltNewBadge } from "@/components/ui/bolt-new-badge";

export function WavyBackgroundDemo() {
  return (
    <WavyBackground className="w-full">
      {/* BoltNewBadge - TOP LEFT with matching spacing */}
      <BoltNewBadge 
        position="top-left" 
        variant="dark" 
        size="medium" 
        className="left-16 md:left-20 lg:left-24"
      />

      {/* Dashboard Login Button - Positioned above screen 2 */}
      <div className="fixed top-4 right-16 md:top-6 md:right-20 lg:right-24 z-50">
        <button
          className="
            px-4 py-2 md:px-6 md:py-3
            bg-[#cc36a5] text-white
            rounded-lg
            font-bold text-sm md:text-base
            transition-all duration-300 ease-out
            hover:bg-[#b8309a] hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2
            whitespace-nowrap
          "
          onClick={() => {
            alert('Dashboard Login - Coming Soon!');
          }}
        >
          Dashboard Login
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex flex-col lg:flex-row justify-center items-center lg:items-center">
        {/* Left Side - Text Content */}
        <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0 lg:pr-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-8xl text-white font-bold leading-tight">
              <div>Meet</div>
              <div>Waste Lens</div>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mt-6 text-white font-normal max-w-2xl mx-auto lg:mx-0">
              Snap your trash. Lower your tax or utility bill.
            </p>
          </div>

          {/* QR Code and Text Section */}
          <div className="flex flex-col sm:flex-row items-center lg:items-center justify-center lg:justify-start gap-6 mt-8">
            {/* QR Code - Reduced white space padding */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg flex items-center justify-center p-1">
                <img 
                  src="/qrcodeapp.png" 
                  alt="Waste Lens App QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Text next to QR Code - LEFT JUSTIFIED AND VERTICALLY CENTERED */}
            <div className="text-white flex flex-col justify-center text-left">
              <p className="text-base md:text-lg lg:text-xl font-normal mb-2">Get Waste Lens.</p>
              <p className="text-base md:text-lg lg:text-xl font-normal leading-relaxed">
                Earn Rewards and Incentives<br />
                with each snap.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - App Mockups */}
        <div className="flex-1 flex justify-center lg:justify-end items-center relative max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
            {/* Second Phone (Background, Angled) - POSITIONED TO THE RIGHT */}
            <div className="absolute top-4 -right-8 md:top-6 md:-right-6 lg:top-8 lg:-right-4 transform rotate-12 z-10">
              <div className="w-48 h-96 md:w-56 md:h-[28rem] lg:w-64 lg:h-[32rem] bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-orange-400 via-yellow-500 to-orange-600 rounded-[1.5rem] relative overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 py-2 text-white text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
                      <div className="w-4 h-2 bg-white rounded-sm opacity-80"></div>
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* Camera Interface */}
                  <div className="relative h-full">
                    {/* Food Image */}
                    <div className="absolute inset-4 bg-gradient-to-br from-amber-200 to-orange-300 rounded-xl overflow-hidden">
                      <div className="w-full h-full relative">
                        {/* Pancake Stack Representation */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-20 h-3 bg-yellow-600 rounded-full mb-1"></div>
                          <div className="w-20 h-3 bg-yellow-500 rounded-full mb-1"></div>
                          <div className="w-20 h-3 bg-yellow-600 rounded-full mb-1"></div>
                          <div className="w-20 h-3 bg-yellow-500 rounded-full mb-1"></div>
                          <div className="w-20 h-3 bg-yellow-600 rounded-full"></div>
                          {/* Blueberries */}
                          <div className="absolute -top-2 left-2 w-2 h-2 bg-blue-800 rounded-full"></div>
                          <div className="absolute -top-1 right-3 w-2 h-2 bg-blue-900 rounded-full"></div>
                          <div className="absolute top-1 left-4 w-2 h-2 bg-blue-800 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Camera Controls */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                      <div className="w-8 h-8 bg-white bg-opacity-30 rounded-lg"></div>
                      <div className="w-12 h-12 bg-white rounded-full border-4 border-white border-opacity-50"></div>
                      <div className="w-8 h-8 bg-white bg-opacity-30 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* First Phone (Foreground, Straight) */}
            <div className="relative z-20">
              <div className="w-52 h-[26rem] md:w-60 md:h-[30rem] lg:w-72 lg:h-[36rem] bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[1.5rem] relative overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 py-3 text-black text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-black rounded-sm opacity-60"></div>
                      <div className="w-4 h-2 bg-black rounded-sm opacity-80"></div>
                      <div className="w-4 h-2 bg-black rounded-sm"></div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                      <span className="font-semibold text-lg">Cal AI</span>
                    </div>
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  </div>

                  {/* Today/Yesterday tabs */}
                  <div className="px-4 py-2">
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold border-b-2 border-black pb-1">Today</span>
                      <span className="text-gray-500">Yesterday</span>
                    </div>
                  </div>

                  {/* Calorie Counter */}
                  <div className="px-4 py-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">1250</div>
                      <div className="text-gray-500 text-sm mb-4">calories</div>
                      
                      {/* Progress Circle */}
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none"/>
                          <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="none"
                                  strokeDasharray="251.2" strokeDashoffset="75.36"/>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-semibold">70%</span>
                        </div>
                      </div>

                      {/* Macro Stats */}
                      <div className="flex justify-between text-center">
                        <div>
                          <div className="text-lg font-semibold">41g</div>
                          <div className="text-xs text-gray-500">Protein</div>
                          <div className="w-8 h-1 bg-red-400 rounded mx-auto mt-1"></div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">89g</div>
                          <div className="text-xs text-gray-500">Fat</div>
                          <div className="w-8 h-1 bg-yellow-400 rounded mx-auto mt-1"></div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">45g</div>
                          <div className="text-xs text-gray-500">Carbs</div>
                          <div className="w-8 h-1 bg-blue-400 rounded mx-auto mt-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recently Calculated */}
                  <div className="px-4">
                    <h3 className="font-semibold mb-3">Recently calculated</h3>
                    
                    {/* Food Item 1 */}
                    <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Green Salad</div>
                        <div className="text-xs text-gray-500">8:30am</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">120</div>
                        <div className="flex gap-1 mt-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Food Item 2 */}
                    <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Sweet Corn Pancake</div>
                        <div className="text-xs text-gray-500">7:30am</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">340</div>
                        <div className="flex gap-1 mt-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-around py-3 bg-white border-t border-gray-100">
                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                    <div className="w-8 h-8 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WavyBackground>
  );
}