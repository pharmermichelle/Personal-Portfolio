"use client";
import React from "react";
import { BoltNewBadge } from "@/components/ui/bolt-new-badge";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";

export function HeroConcept20() {
  return (
    <div className="w-full h-screen relative" style={{ backgroundColor: '#001123' }}>
      {/* Left-side darkening overlay for text readability */}
      <div className="absolute inset-0 split-container pointer-events-none z-5"></div>

      {/* Header Menu - Dashboard Login and BoltNewBadge positioned together */}
      <div className="fixed top-4 right-8 md:top-6 md:right-12 lg:right-16 z-50 flex items-center gap-4">
        {/* Dashboard Login Link */}
        <a
          href="https://dashboard.wastelens.works"
          target="_blank"
          rel="noopener noreferrer"
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
            inline-block
            text-center
            no-underline
          "
        >
          Dashboard Login
        </a>

        {/* BoltNewBadge - Positioned to the right of Dashboard Login, vertically centered */}
        <div className="flex items-center">
          <BoltNewBadge 
            position="top-right" 
            variant="dark" 
            size="medium" 
            className="relative !top-0 !right-0 !bottom-auto !left-auto !fixed-none static"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex flex-col lg:flex-row justify-center items-center lg:items-center relative z-10">
        {/* Left Side - Text Content (in front of darkened slider images) */}
        <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0 lg:pr-8 relative z-20">
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

        {/* Right Side - Custom Phone Mockup */}
        <div className="flex-1 flex justify-center lg:justify-end items-center relative max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Phone positioned to align exactly with auto slider center */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
              {/* Custom Phone Container */}
              <div className="phone-container">
                <div className="viewfinder-frame">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                  {/* This is the transparent window where auto slider images show through */}
                  <div className="cutout-window">
                    {/* Auto Slider positioned within the cutout window */}
                    <ImageAutoSlider />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Left-side darkening overlay for hero section text readability */
        .split-container {
          background: linear-gradient(
            90deg,
            rgba(0,17,35,0.8) 0%,
            rgba(0,17,35,0.8) 50%,
            rgba(0,17,35,0) 50%,
            rgba(0,17,35,0) 100%
          );
        }

        /* Responsive breakpoint for split effect */
        @media (max-width: 1023px) {
          .split-container {
            /* On mobile/tablet, show uniform darkening for readability */
            background: rgba(0,17,35,0.6);
          }
        }

        .phone-container {
          width: 320px;
          height: 580px;
          border-radius: 40px;
          border: 6px solid black;
          position: relative;
          background: rgba(255, 255, 255, 0.08); /* light fill */
          overflow: hidden;
          margin-top: 85px;
        }

        /* Mask effect using a layer over the phone - Reduced opacity */
        .phone-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.08); /* reduced from 0.2 to 0.08 */
          z-index: 5;
          pointer-events: none;
        }
        
        /* Cutout window stays above the fill */
        .cutout-window {
          position: absolute;
          top: 12%;
          left: 10%;
          width: 80%;
          height: 48%;
          background: transparent;
          z-index: 10;
          box-shadow: 0 0 0 9999px rgba(255, 255, 255, 0.85);
          border-radius: none;
          overflow: hidden;
        }
        
        .corner {
          width: 30px;
          height: 30px;
          border: 7px solid #e836af;
          position: absolute;
          z-index: 15;
        }
        .top-left {
          top: 15%;
          left: 14%;
          border-right: none;
          border-bottom: none;
        }
        .top-right {
          top: 15%;
          right: 14%;
          border-left: none;
          border-bottom: none;
        }
        .bottom-left {
          top: 50%;
          left: 14%;
          border-right: none;
          border-top: none;
        }
        .bottom-right {
          top: 50%;
          right: 14%;
          border-left: none;
          border-top: none;
        }
      `}</style>
    </div>
  );
}