"use client";
import React from "react";
import { BoltNewBadge } from "@/components/ui/bolt-new-badge";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";

// ✅ Optional: if you extract styles to a .css file later
// import './solid-background-demo.css';

export function SolidBackgroundDemo() {
  return (
    <div
      className="w-full min-h-screen relative"
      style={{ backgroundColor: "#001123" }}
    >
      {/* Left-side darkening overlay for text readability */}
      <div className="absolute inset-0 split-container pointer-events-none z-5"></div>

      {/* Header Menu */}
      <div className="fixed top-4 right-4 md:top-6 md:right-8 lg:right-12 z-50 flex items-center gap-2 md:gap-4">
        <a
          href="https://dashboard.wastelens.works"
          target="_blank"
          rel="noopener noreferrer"
          className="
            px-3 py-2 md:px-6 md:py-3
            bg-[#cc36a5] text-white
            rounded-lg
            font-bold text-xs md:text-base
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

        <div className="flex items-center">
          <BoltNewBadge
            position="top-right"
            variant="dark"
            size="small"
            className="relative !top-0 !right-0 !bottom-auto !left-auto !fixed-none static"
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 min-h-screen flex flex-col justify-center items-center relative z-10 py-20 lg:py-0 gap-8 lg:gap-0">
        <div className="order-1 text-center lg:text-left w-full lg:flex-1 lg:pr-8 relative z-20">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl text-white font-bold leading-tight">
              <div>Meet</div>
              <div>Waste Lens</div>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mt-4 md:mt-6 text-white font-normal max-w-2xl mx-auto lg:mx-0">
              Snap your trash. Lower your tax or utility bill.
            </p>
          </div>
        </div>

        <div className="order-2 flex justify-center items-center relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl lg:flex-1 lg:justify-end">
          <div className="relative w-full flex justify-center lg:justify-end">
            <div className="relative">
              <div className="phone-container">
                <div className="viewfinder-frame">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                  <div className="cutout-window">
                    <ImageAutoSlider />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-3 lg:order-1 text-center lg:text-left w-full lg:flex-1 lg:pr-8 relative z-20">
          <div className="flex flex-col sm:flex-row items-center lg:items-center justify-center lg:justify-start gap-4 md:gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white rounded-lg flex items-center justify-center p-1">
                <img
                  src="/qrcodeapp.png"
                  alt="Waste Lens App QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="text-white flex flex-col justify-center text-center sm:text-left">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal mb-2">
                Get Waste Lens.
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed">
                Earn Rewards and Incentives
                <br />
                with each snap.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Removed `jsx` from this style tag */}
      <style>{`
        .split-container {
          background: linear-gradient(
            90deg,
            rgba(0,17,35,0.8) 0%,
            rgba(0,17,35,0.8) 50%,
            rgba(0,17,35,0) 50%,
            rgba(0,17,35,0) 100%
          );
        }

        @media (max-width: 1023px) {
          .split-container {
            background: rgba(0,17,35,0.6);
          }
        }

        .phone-container {
          width: 240px;
          height: 435px;
          border-radius: 30px;
          border: 4px solid black;
          position: relative;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
          margin: 0 auto;
        }

        @media (min-width: 640px) {
          .phone-container {
            width: 280px;
            height: 508px;
            border-radius: 35px;
            border: 5px solid black;
          }
        }

        @media (min-width: 1024px) {
          .phone-container {
            width: 320px;
            height: 580px;
            border-radius: 40px;
            border: 6px solid black;
          }
        }

        .phone-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.08);
          z-index: 5;
          pointer-events: none;
        }

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
          width: 20px;
          height: 20px;
          border: 5px solid #e836af;
          position: absolute;
          z-index: 15;
        }

        @media (min-width: 640px) {
          .corner {
            width: 25px;
            height: 25px;
            border: 6px solid #e836af;
          }
        }

        @media (min-width: 1024px) {
          .corner {
            width: 30px;
            height: 30px;
            border: 7px solid #e836af;
          }
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
export default SolidBackgroundDemo;
