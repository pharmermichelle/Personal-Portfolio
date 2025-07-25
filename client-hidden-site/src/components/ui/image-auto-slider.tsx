import React from 'react';

export const ImageAutoSlider = () => {
  // Images for the infinite scroll - using local images from /public folder
  const images = [
    "/Trash-1-FoodWaste.jpg",
    "/Trash-2-PlasticGlass.jpg",
    "/Trash-3-PizzaBox.jpg",
    "/Trash-4-CoffeePods.jpg",
    "/Trash-5-Batteries.jpg",
    "/Trash-6-Electronics.jpg",
    "/Trash-7-Textiles.jpg",
    "/Trash-8-Aluminum.jpg",
    "/Trash-9-Tires.jpg"
  ];

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <>
      <style>{`
        @keyframes scroll-right-with-pause {
          0% {
            transform: translateX(0);
          }
          8.33% {
            transform: translateX(-5.55%);
            animation-timing-function: ease-out;
          }
          11.11% {
            transform: translateX(-5.55%);
            animation-timing-function: ease-in;
          }
          19.44% {
            transform: translateX(-11.11%);
            animation-timing-function: ease-out;
          }
          22.22% {
            transform: translateX(-11.11%);
            animation-timing-function: ease-in;
          }
          30.55% {
            transform: translateX(-16.66%);
            animation-timing-function: ease-out;
          }
          33.33% {
            transform: translateX(-16.66%);
            animation-timing-function: ease-in;
          }
          41.66% {
            transform: translateX(-22.22%);
            animation-timing-function: ease-out;
          }
          44.44% {
            transform: translateX(-22.22%);
            animation-timing-function: ease-in;
          }
          52.77% {
            transform: translateX(-27.77%);
            animation-timing-function: ease-out;
          }
          55.55% {
            transform: translateX(-27.77%);
            animation-timing-function: ease-in;
          }
          63.88% {
            transform: translateX(-33.33%);
            animation-timing-function: ease-out;
          }
          66.66% {
            transform: translateX(-33.33%);
            animation-timing-function: ease-in;
          }
          74.99% {
            transform: translateX(-38.88%);
            animation-timing-function: ease-out;
          }
          77.77% {
            transform: translateX(-38.88%);
            animation-timing-function: ease-in;
          }
          86.10% {
            transform: translateX(-44.44%);
            animation-timing-function: ease-out;
          }
          88.88% {
            transform: translateX(-44.44%);
            animation-timing-function: ease-in;
          }
          97.21% {
            transform: translateX(-50%);
            animation-timing-function: ease-out;
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes snap-flash {
          0% {
            box-shadow: 0 0 0 0 rgba(204, 54, 165, 0);
            filter: brightness(1);
          }
          50% {
            box-shadow: 0 0 30px 10px rgba(204, 54, 165, 0.8);
            filter: brightness(1.6);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(204, 54, 165, 0);
            filter: brightness(1);
          }
        }

        .infinite-scroll {
          animation: scroll-right-with-pause 36s linear infinite;
        }

        .image-item {
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .image-item:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        /* Enhanced snap animation for centered images - aligned with pause timing */
        .image-item:nth-child(1) {
          animation: snap-flash 0.5s ease-in-out 4s;
        }
        .image-item:nth-child(2) {
          animation: snap-flash 0.5s ease-in-out 8s;
        }
        .image-item:nth-child(3) {
          animation: snap-flash 0.5s ease-in-out 12s;
        }
        .image-item:nth-child(4) {
          animation: snap-flash 0.5s ease-in-out 16s;
        }
        .image-item:nth-child(5) {
          animation: snap-flash 0.5s ease-in-out 20s;
        }
        .image-item:nth-child(6) {
          animation: snap-flash 0.5s ease-in-out 24s;
        }
        .image-item:nth-child(7) {
          animation: snap-flash 0.5s ease-in-out 28s;
        }
        .image-item:nth-child(8) {
          animation: snap-flash 0.5s ease-in-out 32s;
        }
        .image-item:nth-child(9) {
          animation: snap-flash 0.5s ease-in-out 36s;
        }
        .image-item:nth-child(10) {
          animation: snap-flash 0.5s ease-in-out 40s;
        }
        .image-item:nth-child(11) {
          animation: snap-flash 0.5s ease-in-out 44s;
        }
        .image-item:nth-child(12) {
          animation: snap-flash 0.5s ease-in-out 48s;
        }
        .image-item:nth-child(13) {
          animation: snap-flash 0.5s ease-in-out 52s;
        }
        .image-item:nth-child(14) {
          animation: snap-flash 0.5s ease-in-out 56s;
        }
        .image-item:nth-child(15) {
          animation: snap-flash 0.5s ease-in-out 60s;
        }
        .image-item:nth-child(16) {
          animation: snap-flash 0.5s ease-in-out 64s;
        }
        .image-item:nth-child(17) {
          animation: snap-flash 0.5s ease-in-out 68s;
        }
        .image-item:nth-child(18) {
          animation: snap-flash 0.5s ease-in-out 72s;
        }

        .scroll-container {
          mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }

        /* Responsive image sizing */
        .image-item {
          width: 180px;
          height: 200px;
        }

        @media (min-width: 640px) {
          .image-item {
            width: 210px;
            height: 230px;
          }
        }

        @media (min-width: 1024px) {
          .image-item {
            width: 264px;
            height: 278px;
          }
        }
      `}</style>
      
      {/* Auto slider now positioned to fill the cutout window */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="scroll-container w-full h-full relative">
          <div className="infinite-scroll flex gap-2 sm:gap-3 lg:gap-4 w-max h-full items-center">
            {duplicatedImages.map((image, index) => (
              <div
                key={index}
                className="image-item flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl"
              >
                <img
                  src={image}
                  alt={`Waste snap ${(index % images.length) + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};