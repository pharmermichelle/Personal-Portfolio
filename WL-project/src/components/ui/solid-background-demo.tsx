"use client";
import React from "react";

import { PhoneSliderMockup } from "@/components/ui/phone-slider-mockup";
import "./solid-background-demo.css";
import { CityLetterForm } from "@/components/city-letter-form";

export function SolidBackgroundDemo() {
  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "#001123" }}
    >
      {/* Left-side darkening overlay */}
      <div className="absolute inset-0 split-container pointer-events-none z-5" />

      {/* Dashboard Login Button - Top Right */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex items-center gap-3">
        {/* Dashboard Login Button */}
        <a
          href="https://dashboard.wastelens.works"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 md:px-6 md:py-3 bg-[#cc36a5] text-white border border-[#001123] rounded-lg font-bold text-xs md:text-base transition-all hover:bg-white hover:text-[#cc36a5] hover:border-[#cc36a5] hover:scale-105 hover:shadow-lg hover:shadow-pink-400/25 active:scale-95 focus:outline-none"
        >
          Dashboard Login
        </a>
        
        {/* Waste Lens Logo Button */}
        <a
          href="https://ecoactivators.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-12 md:h-12 transition-all hover:scale-105 active:scale-95 focus:outline-none rounded-lg"
        >
          <img
            src="/Waste-lens-logo.PNG"
            alt="Waste Lens Logo"
            className="w-full h-full object-contain rounded-lg"
          />
        </a>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-20 sm:pt-24 md:pt-32 lg:pt-36 pb-4 flex flex-col items-center justify-center relative z-10 min-h-[calc(100vh-120px)]">
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 lg:gap-8">
          {/* Text & QR Section */}
          <div className="hidden lg:flex flex-col items-start text-left w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl relative z-20 
                          bg-gradient-to-r from-[#001123] via-[#001123]/95 to-[#001123]/80 
                          px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 rounded-xl sm:rounded-2xl backdrop-blur-sm gap-3 sm:gap-4 md:gap-5">
            <h1 className="text-2xl sm:text-4xl md:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-3 sm:mb-4 md:mb-6">
              <div>Meet</div>
              <div>
                Waste Lens
              </div>
            </h1>
            <p className="text-xs sm:text-base md:text-base xl:text-lg font-semibold text-white mb-2 sm:mb-3 md:mb-4 whitespace-nowrap">
              Snap your trash. Earn rewards. Lower your bills.
            </p>
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-7 border-2 sm:border-3 md:border-4 border-[#cc36a5] animate-fadeInUp animation-delay-300 w-full">
              <img
                src="/qrcodeapp.png"
                alt="Waste Lens App QR Code"
                className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 object-contain rounded flex-shrink-0"
              />
              <div className="text-[#001123] text-xs sm:text-sm md:text-base flex-1 py-1 sm:py-2 md:py-2.5 pr-1 sm:pr-2 md:pr-2.5">
                <p className="text-[#cc36a5] mb-1 text-sm sm:text-base md:text-lg font-bold">Get Waste Lens</p>
                <p>
                  Earn Rewards and Incentives
                  <br />
                  with each snap. *
                </p>
              </div>
            </div>
            <div className="text-xs md:text-sm text-white/70 -mt-2 sm:-mt-3 md:-mt-4 w-full">
              <p className="italic mb-1">
                * Earn rewards, even if your city hasn't implemented Waste Lens.
              </p>
              <CityLetterForm className="text-xs md:text-sm text-white/70" />
            </div>
          </div>

          {/* Phone Mockup - Centered between text and right edge */}
          <div className="hidden lg:flex flex-1 justify-center items-start lg:mt-32 relative z-10">
            <PhoneSliderMockup className="w-full max-w-[280px] max-h-[320px] md:max-h-[360px] lg:max-h-[400px] scale-75 sm:scale-90 lg:scale-75" />
          </div>

          {/* Mobile: Headers First */}
          <div className="flex flex-col items-center text-center w-full lg:hidden mb-6">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
              <div>Meet</div>
              <div>Waste Lens</div>
            </h1>
            <p className="text-sm sm:text-lg font-semibold text-white whitespace-nowrap">
              Snap your trash. Earn rewards. Lower your bills.
            </p>
          </div>

          {/* Mobile: Phone Mockup Second */}
          <div className="w-full max-w-[280px] sm:max-w-xs flex justify-center lg:hidden mb-6">
            <PhoneSliderMockup className="w-full max-h-[280px] sm:max-h-[320px] scale-75 sm:scale-90" />
          </div>

          {/* Mobile: QR Box Third */}
          <div className="flex flex-col items-center w-full lg:hidden mb-6">
            <div className="flex items-center gap-3 sm:gap-4 bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 border-2 sm:border-3 border-[#cc36a5] w-full max-w-sm">
              <img
                src="/qrcodeapp.png"
                alt="Waste Lens App QR Code"
                className="w-16 sm:w-20 h-16 sm:h-20 object-contain rounded flex-shrink-0"
              />
              <div className="text-[#001123] text-xs sm:text-sm flex-1 py-1 sm:py-2 pr-1 sm:pr-2">
                <p className="text-[#cc36a5] mb-1 text-sm sm:text-base font-bold">Get Waste Lens</p>
                <p>
                  Earn Rewards and Incentives
                  <br />
                  with each snap. *
                </p>
              </div>
            </div>
            <div className="text-xs text-white/70 mt-2 w-full max-w-sm text-center">
              <p className="italic mb-1">
                * Earn rewards, even if your city hasn't implemented Waste Lens.
              </p>
              <CityLetterForm className="text-xs text-white/70" />
            </div>
          </div>

        </div>
      </div>

      {/* Footer - Placed Outside the Centered Hero Section */}
      <footer className="w-full border-t border-white/10 pt-3 sm:pt-4 pb-3 sm:pb-4 text-center text-xs sm:text-sm text-white/70 z-20 relative mt-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-xs sm:text-sm">&copy; 2025 Waste Lens™</p>
          <div className="flex gap-2 sm:gap-4">
            <a
              href="/TermsofService_still needs updating.docx.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-white transition-colors text-xs sm:text-sm"
            >
              Terms
            </a>
            <a
              href="/PrivacyPolicy_still needs updating.docx.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-white transition-colors text-xs sm:text-sm"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}