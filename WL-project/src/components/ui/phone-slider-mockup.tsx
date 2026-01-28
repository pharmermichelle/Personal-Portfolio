import React, { useRef, useEffect } from 'react';

interface PhoneSliderMockupProps {
  className?: string;
}

export const PhoneSliderMockup: React.FC<PhoneSliderMockupProps> = ({
  className = '',
}) => {
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

  const trackRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const cutoutRef = useRef<HTMLDivElement>(null);
  const lastCenteredImageRef = useRef<string>('');
  const isPausedRef = useRef<boolean>(false);
  const pauseStartTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number;
    const track = trackRef.current;
    const flash = flashRef.current;

    const animate = () => {
      if (track) {
        const currentTime = Date.now();
        
        // Only move if not paused
        if (!isPausedRef.current) {
          offsetRef.current -= 0.8;
        }
        
        track.style.transform = `translateX(${offsetRef.current}px)`;
        const firstSlide = track.firstElementChild as HTMLElement;
        const totalWidth = track.scrollWidth / 2;

        const cutoutRect = cutoutRef.current?.getBoundingClientRect();
        const phoneCenter = cutoutRect?.left! + cutoutRect?.width! / 2;
        const trackChildren = track.children;
        let closestSlide = null;
        let closestDistance = Infinity;

        // Find the image element closest to the center
        for (let i = 0; i < trackChildren.length; i++) {
          const slide = trackChildren[i] as HTMLElement;
          const rect = slide.getBoundingClientRect();
          const slideCenter = rect.left + rect.width / 2;
          const distance = Math.abs(phoneCenter - slideCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSlide = slide;
          }
        }

        // Only pause if we haven't already paused for this exact DOM node
        const slideId = (closestSlide as HTMLElement)?.dataset?.centerid ?? '';
        if (closestDistance < 6 && slideId !== lastCenteredImageRef.current) {
          lastCenteredImageRef.current = slideId;
          
          isPausedRef.current = true;
          pauseStartTimeRef.current = Date.now();
          
          const imageLeft = closestSlide.getBoundingClientRect().left;
          const imageWidth = closestSlide.getBoundingClientRect().width;
          const centerDelta = (imageLeft + imageWidth / 2) - phoneCenter;

          // Fix offset persistently
          offsetRef.current -= centerDelta;
          track.style.transform = `translateX(${offsetRef.current}px)`;
          
          setTimeout(() => {
            if (flashRef.current) {
              flashRef.current.style.opacity = '1';
              setTimeout(() => {
                if (flashRef.current) flashRef.current.style.opacity = '0';
              }, 150);
            }
          }, 100);
        }
        
        if (isPausedRef.current && currentTime - pauseStartTimeRef.current >= 800) {
          isPausedRef.current = false;
        }
        
        if (Math.abs(offsetRef.current) >= totalWidth) {
          offsetRef.current = 0;
          track.style.transition = 'none';
          track.style.transform = `translateX(${offsetRef.current}px)`;
          void track.offsetWidth;
          track.style.transition = '';
        }


      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className={`relative w-full flex items-center justify-center overflow-visible ${className}`}>
      <div className="relative z-10 mx-auto scale-[1] sm:scale-[1.8] lg:scale-[1.6] w-[500px] h-[800px] sm:w-[600px] sm:h-[1200px] lg:w-[700px] lg:h-[1400px] -translate-y-8 sm:-translate-y-12 lg:-translate-y-16">

        {/* Flash overlay inside cutoutRef visually */}
        <div
          ref={cutoutRef}
          className="absolute top-[35%] sm:top-[40%] left-1/2 w-[192px] h-[192px] pointer-events-none z-10"
          style={{ transform: 'translateX(calc(-50% - 2rem))' }}
          aria-hidden="true"
        >
          <div
            ref={flashRef}
            className="w-full h-full bg-white rounded-xl opacity-0 transition-opacity duration-150 ease-out"
            style={{ mixBlendMode: 'overlay' }}
          />
        </div>

{/* Slider stays behind the PNG - moved much further down on mobile */}
<div className="absolute inset-0 z-0 flex items-start justify-center pt-[285px] sm:pt-[285px]">
  {/* Container that allows left overflow but hides right */}
  <div
    className="absolute top-[37%] sm:top-[40%] left-0 w-[calc(100%+500px)] overflow-hidden transform -translate-x-[430px]"
    style={{ height: '192px' }}
  >
    <div ref={trackRef} className="flex gap-2 items-center">
      {[...images, ...images].map((image, index) => (
        <img
          key={index}
          src={image}
          data-centerid={`slide-${index % images.length}`}
          alt={`Slide ${index + 1}`}
          className="h-[90px] sm:h-[140px] w-auto rounded-xl object-cover object-center"
          className="h-[120px] sm:h-[140px] w-auto rounded-xl object-cover object-center"
          loading="lazy"
        />
      ))}
    </div>
  </div>
</div>



        {/* PNG overlay with transparent screen */}
<img
  src="/phone-window.png"
  alt="Phone mockup"
  className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none translate-y-2 sm:-translate-y-2 -translate-x-8"
  draggable={false}
/>

      </div>
    </div>
  );
};