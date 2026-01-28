# Hero Concepts Documentation

## Hero Concept 1 - Waste Lens Landing Page

**Created:** Current Version  
**Status:** Complete  

### Design Features:
- **Wavy animated background** with flowing gradients
- **BoltNewBadge** positioned top-left with balanced spacing
- **Dashboard Login button** positioned top-right above the second phone mockup
- **Two-column layout** with text content on left, phone mockups on right
- **QR Code section** with left-justified text vertically centered
- **Dual phone mockups** showing app interfaces:
  - Front phone: Cal AI nutrition tracking app
  - Background phone: Camera interface with food capture

### Key Components:
- `WavyBackground` - Animated background with simplex noise
- `WavyBackgroundDemo` - Main hero section layout
- `BoltNewBadge` - Branded badge component with auto-detection

### Layout Specifications:
- **BoltNewBadge:** `left-16 md:left-20 lg:left-24` (matches Dashboard Login spacing)
- **Dashboard Login:** `right-16 md:right-20 lg:right-24` 
- **QR Code Text:** Left-justified and vertically centered
- **Phone Positioning:** Second phone positioned to the right with 12° rotation

### Color Scheme:
- Primary: Wavy gradients (blues, purples, teals)
- Accent: Pink/magenta for Dashboard Login button
- Text: White on gradient background
- Phones: Realistic mockups with app interfaces

This concept establishes the foundation design with balanced spacing, proper component positioning, and engaging visual elements.

---

## Hero Concept 2 - QR Code Optimization

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 1

### Changes from Hero Concept 1:
- **QR Code spacing optimization:** Reduced outer white space padding from `p-2` to `p-1`
- **Text alignment refinement:** Vertically centered text next to QR code while maintaining left-justification
- **Improved visual balance:** Tighter QR code presentation with better text positioning

### Design Features:
- **All Hero Concept 1 features maintained**
- **Enhanced QR Code section:**
  - Minimized white space around QR code edges
  - Text perfectly centered vertically to the right of QR code
  - Maintained left-justified text alignment
  - Better visual proportion between QR code and accompanying text

### Key Improvements:
- **QR Code Container:** Changed from `p-2` to `p-1` for tighter spacing
- **Text Vertical Alignment:** Changed from `lg:items-start` to `lg:items-center`
- **Visual Hierarchy:** Improved balance between QR code and text elements

### Layout Specifications:
- **QR Code:** Reduced padding for cleaner presentation
- **Text Positioning:** Vertically centered, left-justified next to QR code
- **All other elements:** Unchanged from Hero Concept 1

This concept refines the QR code section for better visual presentation while preserving all other design elements from Hero Concept 1.

---

## Hero Concept 3 - Black Background

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 2

### Changes from Hero Concept 2:
- **Background:** Replaced wavy animated background with solid black (#000000)
- **Component cleanup:** Removed WavyBackground component and related dependencies
- **Simplified structure:** Clean, minimal background approach with classic black

### Design Features:
- **All Hero Concept 2 content maintained:**
  - Same text content, fonts, sizes, and colors
  - Same QR code optimization (reduced padding)
  - Same phone mockups and positioning
  - Same BoltNewBadge and Dashboard Login placement
  - Same layout structure and spacing

### Key Components:
- `SolidBackgroundDemo` - Main hero section with black background
- `BoltNewBadge` - Branded badge component (unchanged)
- All content elements identical to Hero Concept 2

### Background Specification:
- **Color:** Pure black (#000000)
- **Implementation:** Inline style `backgroundColor: '#000000'`
- **Performance:** No animations or complex rendering

### Layout Specifications:
- **All positioning:** Identical to Hero Concept 2
- **Text contrast:** White text on black background for maximum readability
- **Visual hierarchy:** Maintained through typography and spacing
- **Color contrast:** Black creates striking contrast with magenta Dashboard Login button

### Color Psychology:
- **Pure black (#000000):** Classic, elegant, and professional
- **Creates maximum contrast** with white text and colorful phone mockups
- **Strong contrast** with the magenta Dashboard Login button (#cc36a5)
- **Timeless and sophisticated** appearance that conveys premium quality

### Visual Impact:
- **Classic and elegant:** The pure black creates a timeless, sophisticated feel
- **Maximum contrast:** Strongest possible contrast ensures perfect text legibility
- **Color pop:** The colorful phone mockups and magenta button stand out dramatically
- **Professional premium:** Black background conveys quality and sophistication

This concept provides a classic, elegant alternative with maximum contrast while preserving all content and layout optimizations from Hero Concept 2. The pure black background creates a sophisticated, premium experience that makes the colorful elements pop beautifully.

---

## Hero Concept 4 - Auto Slider Integration

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 3

### Changes from Hero Concept 3:
- **Auto Slider Feature:** Added horizontal scrolling image gallery
- **Z-index layering:** Carefully positioned slider behind content but in front of background
- **No other changes:** All Hero Concept 3 elements preserved exactly

### New Auto Slider Features:
- **Positioning:** Centered on the line between top 1/3 and middle 1/3 of hero section
- **Animation:** Smooth infinite horizontal scroll (20s duration)
- **Images:** 8 high-quality waste/food images from Unsplash
- **Visual Effects:**
  - Gradient mask for smooth fade-in/fade-out edges
  - Hover effects with scale and brightness
  - Rounded corners and shadow effects
- **Responsive sizing:**
  - Mobile: 32x32 (w-32 h-32)
  - Medium: 40x40 (w-40 h-40) 
  - Large: 48x48 (w-48 h-48)

### Z-Index Layering Strategy:
- **Background:** Black background (z-0)
- **Auto Slider:** z-5 (behind content, in front of background)
- **Main Content:** z-10 (text, QR code, buttons)
- **Left Content:** z-20 (header, subheader, QR section)
- **Phone Mockups:** z-30 (highest priority, in front of slider)
- **Fixed Elements:** z-50 (BoltNewBadge, Dashboard Login)

### Key Components:
- `ImageAutoSlider` - New auto-scrolling image component
- `SolidBackgroundDemo` - Updated to include slider integration
- All Hero Concept 3 components preserved unchanged

### Implementation Details:
- **Component Structure:** Clean separation with dedicated ImageAutoSlider component
- **CSS Animations:** Keyframe-based infinite scroll with linear timing
- **Image Sources:** Curated Unsplash URLs for waste/food photography
- **Performance:** Optimized with lazy loading and efficient animations
- **Accessibility:** Proper alt text describing waste snaps

### Visual Narrative:
- **Storytelling:** Images represent various waste snaps users have captured
- **User Journey:** Shows the diversity of items processed through Waste Lens
- **Engagement:** Moving images create dynamic visual interest
- **Context:** Reinforces the "snap your trash" value proposition

### Responsive Design:
- **Mobile-first:** Smaller images on mobile for better performance
- **Progressive enhancement:** Larger, more impactful images on desktop
- **Smooth scaling:** Consistent proportions across all breakpoints
- **Touch-friendly:** Hover effects work on both mouse and touch devices

This concept adds dynamic visual storytelling through the auto slider while maintaining all the sophisticated design elements from Hero Concept 3. The slider creates an engaging narrative of user waste snaps flowing through the Waste Lens experience.

---

## Hero Concept 5 - Single Phone Layout

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 4

### Changes from Hero Concept 4:
- **Phone Layout:** Removed the second phone (camera interface) completely
- **Single phone focus:** Only the Cal AI nutrition tracking app remains, facing straight
- **Clean composition:** Simplified right side with single phone mockup
- **All other elements preserved:** Auto slider, black background, QR code optimization, and all other Hero Concept 4 features remain identical

### Design Features:
- **All Hero Concept 4 features maintained:**
  - Auto slider with horizontal scrolling waste/food images
  - Black background (#000000)
  - Optimized QR code section with reduced padding
  - BoltNewBadge and Dashboard Login positioning
  - Same text content, fonts, and layout structure
  - Same z-index layering strategy

### Phone Mockup Specification:
- **Single Phone:** Cal AI nutrition tracking app interface
- **Positioning:** Centered on right side, facing straight (no rotation)
- **Size:** Responsive sizing maintained (w-52 to w-72 based on breakpoint)
- **Content:** Complete Cal AI interface with calorie counter, macro stats, and food items
- **Z-index:** z-30 (highest priority, in front of slider)

### Layout Improvements:
- **Cleaner composition:** Single phone creates more focused visual hierarchy
- **Better balance:** Simplified right side balances with text content on left
- **Enhanced readability:** Less visual complexity allows better focus on content
- **Streamlined design:** Maintains all functionality while reducing visual noise

### Key Components:
- `ImageAutoSlider` - Auto-scrolling image component (unchanged)
- `SolidBackgroundDemo` - Updated to show single phone layout
- `BoltNewBadge` - Branded badge component (unchanged)
- All other components preserved from Hero Concept 4

### Visual Impact:
- **Focused attention:** Single phone draws clear attention to the Cal AI app
- **Clean aesthetics:** Simplified layout creates more elegant composition
- **Better mobile experience:** Less complex layout works better on smaller screens
- **Maintained storytelling:** Auto slider continues to show waste snap narrative

This concept simplifies the phone mockup presentation while preserving all the dynamic features and sophisticated design elements from Hero Concept 4. The single phone layout creates a cleaner, more focused user experience.

---

## Hero Concept 6 - Auto Slider in Foreground

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 5

### Changes from Hero Concept 5:
- **Auto Slider Z-Index:** Changed from z-5 (background) to z-40 (foreground)
- **Phone Z-Index:** Changed from z-30 to z-10 (now behind slider)
- **Visual Flow:** Auto slider images now flow in front of the single phone mockup
- **All other elements preserved:** Everything else from Hero Concept 5 remains identical

### Design Features:
- **All Hero Concept 5 features maintained:**
  - Single Cal AI phone mockup
  - Black background (#000000)
  - Optimized QR code section with reduced padding
  - BoltNewBadge and Dashboard Login positioning
  - Same text content, fonts, and layout structure

### Updated Z-Index Layering Strategy:
- **Background:** Black background (z-0)
- **Phone Mockup:** z-10 (now behind slider)
- **Main Content:** z-10 (text, QR code, buttons)
- **Left Content:** z-20 (header, subheader, QR section)
- **Auto Slider:** z-40 (now in foreground, flowing over phone)
- **Fixed Elements:** z-50 (BoltNewBadge, Dashboard Login)

### Visual Impact:
- **Dynamic foreground effect:** Waste snap images flow dramatically in front of phone
- **Enhanced storytelling:** Creates illusion of waste snaps flowing through Waste Lens
- **Layered composition:** Multi-dimensional visual hierarchy with depth
- **Engaging interaction:** Moving images create captivating foreground animation

### Key Components:
- `ImageAutoSlider` - Auto-scrolling image component (z-index updated to z-40)
- `SolidBackgroundDemo` - Updated z-index positioning for phone and slider
- `BoltNewBadge` - Branded badge component (unchanged)
- All other components preserved from Hero Concept 5

### User Experience:
- **Visual metaphor:** Images flowing over phone represents waste processing through app
- **Dynamic engagement:** Foreground movement draws attention and creates interest
- **Clear hierarchy:** Text content remains prominent while phone provides context
- **Seamless animation:** Smooth 20s infinite scroll maintains visual flow

### Implementation Details:
- **Component positioning:** Auto slider moved to end of component tree for proper layering
- **Z-index optimization:** Strategic layering ensures proper visual hierarchy
- **Performance maintained:** No changes to animation or image loading
- **Responsive design:** All breakpoint behaviors preserved

This concept creates a dynamic foreground effect where the auto slider images flow in front of the phone mockup, enhancing the visual metaphor of waste snaps flowing through the Waste Lens experience while maintaining all the sophisticated design elements from Hero Concept 5.

---

## Hero Concept 7 - Split Layering Auto Slider

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 6

### Changes from Hero Concept 6:
- **Split Layering Effect:** Auto slider images now have different layering behavior on left vs right sides
- **Left Side:** Images flow behind hero content (heading, subheading, QR code) with darkening for readability
- **Right Side:** Images flow in front of phone mockup (maintained from Hero Concept 6)
- **Responsive darkening:** Intelligent overlay system for optimal text readability

### New Split Layering Features:
- **Dual Z-Index Behavior:**
  - Left side: z-15 (behind text content at z-20, but in front of background)
  - Right side: z-15 (in front of phone at z-10)
- **Smart Darkening System:**
  - CSS gradient overlay darkens left 50% of slider on desktop
  - Uniform darkening on mobile/tablet for consistent readability
  - `brightness(0.4) contrast(0.8)` filter for optimal text contrast
- **Responsive Implementation:**
  - Desktop (1024px+): Split effect with left-side darkening
  - Mobile/Tablet (<1024px): Uniform darkening across full width

### Design Features:
- **All Hero Concept 6 features maintained:**
  - Single Cal AI phone mockup
  - Black background (#000000)
  - Optimized QR code section with reduced padding
  - BoltNewBadge and Dashboard Login positioning
  - Same text content, fonts, and layout structure

### Advanced Z-Index Layering Strategy:
- **Background:** Black background (z-0)
- **Phone Mockup:** z-10 (behind slider on right side)
- **Auto Slider:** z-15 (split behavior - behind text, in front of phone)
- **Left Content:** z-20 (header, subheader, QR section - in front of darkened slider)
- **Fixed Elements:** z-50 (BoltNewBadge, Dashboard Login)

### Visual Effects:
- **Left Side Experience:**
  - Images flow behind text content creating subtle background movement
  - Darkening overlay ensures perfect text readability
  - Maintains visual interest without compromising usability
- **Right Side Experience:**
  - Images flow in front of phone creating dynamic foreground effect
  - Full brightness maintained for impactful visual storytelling
  - Phone serves as contextual backdrop for waste snap narrative

### Implementation Details:
- **CSS Gradient Overlay:** Linear gradient applies darkening to left 50% only
- **Filter Effects:** Brightness and contrast adjustments for optimal readability
- **Responsive Breakpoints:** Different behaviors for mobile vs desktop
- **Performance Optimized:** Minimal overhead with CSS-only effects

### User Experience Benefits:
- **Enhanced Readability:** Text content remains perfectly legible with darkened background
- **Dynamic Storytelling:** Right side maintains impactful visual narrative
- **Sophisticated Layering:** Creates depth and visual interest without compromising function
- **Responsive Design:** Adapts intelligently across all device sizes

### Technical Specifications:
- **Darkening Filter:** `brightness(0.4) contrast(0.8)` for left side
- **Gradient Overlay:** 50% split with smooth transition
- **Z-Index Management:** Strategic layering for proper visual hierarchy
- **Cross-browser Support:** Webkit and standard mask properties

This concept introduces sophisticated split layering where the auto slider creates different visual experiences on each side of the hero section - subtle background movement behind text on the left for readability, and dynamic foreground storytelling over the phone on the right for impact.

---

## Hero Concept 8 - Deep Navy Background with Enhanced Smart Darkening

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 7

### Changes from Hero Concept 7:
- **Background Color:** Changed from pure black (#000000) to deep navy blue (#001123)
- **Enhanced Smart Darkening System:** Adjusted darkening filters and overlay colors to work seamlessly with navy background
- **Optimized text readability:** Fine-tuned contrast ratios for perfect legibility on navy background

### New Background Features:
- **Deep Navy Blue (#001123):**
  - Sophisticated alternative to pure black
  - Maintains excellent contrast with white text
  - Creates warmer, more approachable feel while preserving elegance
  - Complements the magenta Dashboard Login button beautifully

### Enhanced Smart Darkening System:
- **Adjusted Filter Values:**
  - Left side darkening: `brightness(0.3) contrast(0.9)` (enhanced from 0.4/0.8)
  - Mobile/tablet uniform: `brightness(0.3) contrast(0.9)` for consistent readability
- **Navy-Optimized Overlay:**
  - Desktop gradient: `rgba(0,17,35,0.8)` to `rgba(0,17,35,0)` (matches navy background)
  - Seamless integration with background color for natural appearance
- **Enhanced Contrast:**
  - Stronger darkening ensures optimal text readability on navy background
  - Maintains visual interest while prioritizing usability

### Design Features:
- **All Hero Concept 7 features maintained:**
  - Split layering effect with different behaviors on left vs right sides
  - Single Cal AI phone mockup
  - Optimized QR code section with reduced padding
  - BoltNewBadge and Dashboard Login positioning
  - Same text content, fonts, and layout structure
  - Same responsive implementation

### Advanced Z-Index Layering Strategy:
- **Background:** Deep navy background (#001123) (z-0)
- **Phone Mockup:** z-10 (behind slider on right side)
- **Auto Slider:** z-15 (split behavior - behind text, in front of phone)
- **Left Content:** z-20 (header, subheader, QR section - in front of enhanced darkened slider)
- **Fixed Elements:** z-50 (BoltNewBadge, Dashboard Login)

### Visual Effects:
- **Left Side Experience:**
  - Images flow behind text with enhanced navy-optimized darkening
  - Stronger contrast ensures perfect text readability on navy background
  - Seamless integration with background color for natural appearance
- **Right Side Experience:**
  - Images flow in front of phone with full brightness maintained
  - Navy background creates sophisticated backdrop for visual storytelling
  - Enhanced color harmony throughout the composition

### Color Psychology & Impact:
- **Deep Navy (#001123):** Professional, trustworthy, and sophisticated
- **Warmer Alternative:** Less stark than pure black while maintaining elegance
- **Enhanced Contrast:** Excellent readability with white text and colorful elements
- **Color Harmony:** Beautiful complement to magenta button and colorful phone mockups

### Implementation Details:
- **Background Implementation:** Inline style `backgroundColor: '#001123'`
- **Enhanced Darkening Filter:** `brightness(0.3) contrast(0.9)` for optimal readability
- **Navy-Matched Overlay:** `rgba(0,17,35,0.8)` gradient for seamless integration
- **Cross-browser Support:** Maintained webkit and standard properties

### User Experience Benefits:
- **Superior Readability:** Enhanced darkening ensures perfect text legibility on navy background
- **Sophisticated Aesthetics:** Navy background creates more approachable yet elegant feel
- **Seamless Integration:** Overlay colors perfectly match background for natural appearance
- **Maintained Functionality:** All split layering and responsive behaviors preserved

### Technical Specifications:
- **Background Color:** #001123 (deep navy blue)
- **Enhanced Darkening Filter:** `brightness(0.3) contrast(0.9)` for left side
- **Navy-Optimized Gradient:** `rgba(0,17,35,0.8)` to `rgba(0,17,35,0)` overlay
- **Responsive Breakpoints:** Enhanced darkening applied across all device sizes

This concept introduces a sophisticated deep navy background that creates a warmer, more approachable feel while maintaining the elegant sophistication of the design. The Enhanced Smart Darkening System has been carefully optimized to ensure perfect text readability and seamless visual integration with the new navy background color.

---

## Hero Concept 9 - Waste Lens Vision AI Interface

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 8

### Changes from Hero Concept 8:
- **App Interface Replacement:** Replaced Cal AI nutrition tracking app with Waste Lens Vision AI interface
- **All other elements preserved:** Everything else from Hero Concept 8 remains exactly as is - background, auto slider, header menu, text content, QR code, and layout

### New Waste Lens Vision AI Features:
- **Vision AI Scanning Interface:**
  - Colored scanning frame (#cc36a5) with corner viewfinder design
  - Google Lens-style corner markers (top-left, top-right, bottom-left, bottom-right)
  - Scanning frame corners extend slightly outside auto slider images
  - Intelligent camera interface with real-time AI identification hints
  - Animated scanning indicator (pulsing dot) in center

- **Waste Agent Chat Section:**
  - Concierge-style messaging interface below viewfinder
  - Professional, done-for-you experience design
  - Message content: "Waste AI Agent: Keep it up. The more you snap your trash, the more REWARDS and other SAVINGS you can earn."
  - Highlighted rewards total: "2025 Rewards & Savings Total: $550"
  - Elevated high-end UX/UI styling with gradient background

- **Camera Interface:**
  - Solid white circular camera button at bottom
  - Professional camera app styling
  - Clean, modern interface design

### Design Features:
- **All Hero Concept 8 features maintained:**
  - Deep navy background (#001123)
  - Enhanced Smart Darkening System with split layering
  - Auto slider with navy-optimized darkening
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### App Interface Specifications:
- **Background:** Gradient from gray-100 to gray-200 for clean, modern look
- **Header:** "WASTE LENS" title with bold, tracking-wide typography
- **Scanning Area:** 
  - Food waste visualization with banana peels, lettuce, organic matter
  - Gradient background from amber/green/blue tones
  - Responsive sizing (h-48 to h-64 based on breakpoint)

### Vision AI Scanning Frame:
- **Color:** #cc36a5 (matching Dashboard Login button)
- **Design:** Corner-only viewfinder (Google Lens style)
- **Positioning:** Corners positioned at edges of scanning area
- **Animation:** Central pulsing indicator for active scanning
- **Intelligence:** Conveys real-time AI identification capability

### Waste Agent Chat Design:
- **Container:** White rounded background with subtle shadow and border
- **Typography:** Modern, legible fonts matching hero section style
- **Hierarchy:** Clear agent identification, message content, and rewards highlight
- **Rewards Display:** Gradient background (#cc36a5 to #b8309a) for emphasis
- **UX Style:** Concierge-like, premium experience design

### Color Scheme Integration:
- **Primary:** Deep navy background (#001123) maintained
- **Accent:** #cc36a5 for scanning frame and rewards (consistent with Dashboard Login)
- **Interface:** Clean whites and grays for modern app aesthetic
- **Waste Visualization:** Natural colors (yellows, greens, browns) for organic matter

### User Experience:
- **Visual Metaphor:** Scanning frame suggests active AI analysis of waste
- **Reward Motivation:** Clear display of accumulated savings encourages usage
- **Professional Feel:** Concierge-style messaging creates premium experience
- **Seamless Integration:** App interface complements overall hero design

### Technical Implementation:
- **Responsive Design:** App interface scales appropriately across breakpoints
- **Animation:** Subtle pulsing effect for scanning indicator
- **Typography:** Modern fonts consistent with hero section styling
- **Color Consistency:** Maintains color harmony with overall design theme

### Visual Storytelling:
- **AI Intelligence:** Scanning frame suggests sophisticated computer vision
- **User Journey:** Shows actual Waste Lens app experience
- **Value Proposition:** Rewards total demonstrates tangible benefits
- **Engagement:** Interactive-feeling interface encourages app download

This concept transforms the phone mockup into an authentic Waste Lens Vision AI interface while preserving all the sophisticated design elements from Hero Concept 8. The new app screen showcases the core Waste Lens functionality with intelligent scanning, AI agent interaction, and clear rewards visualization, creating a compelling demonstration of the actual user experience.

---

## Hero Concept 10 - Transparent Viewfinder for Auto Slider Integration

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 9

### Changes from Hero Concept 9:
- **Removed Center Scanning Icon:** Eliminated the pulsing dot indicator from the center of the viewfinder
- **Fully Transparent Viewfinder Window:** Made the scanning area completely transparent to show auto slider images flowing through
- **All other elements preserved:** Everything else from Hero Concept 9 remains exactly as is

### New Transparent Viewfinder Features:
- **Clean Viewfinder Frame:**
  - Only the four #cc36a5 corner markers remain
  - No center scanning icon or pulsing animation
  - Minimalist, focused scanning interface

- **Fully Transparent Scanning Area:**
  - Complete transparency with `bg-transparent`
  - No background content or food waste visualization
  - Auto slider images flow directly through the viewfinder window
  - Creates realistic scanning effect as waste images pass through the frame

### Design Features:
- **All Hero Concept 9 features maintained:**
  - Waste Lens Vision AI interface with #cc36a5 scanning frame corners
  - Waste Agent chat section with concierge-style messaging and $550 rewards total
  - Deep navy background (#001123) with Enhanced Smart Darkening System
  - Auto slider with split layering and navy-optimized darkening
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Visual Impact Enhancement:
- **Seamless Integration:** Auto slider images are now fully visible as they pass through the transparent viewfinder
- **Realistic Scanning Experience:** Creates the illusion that the waste snaps are actually being scanned by the AI
- **Clean Interface:** Removed visual clutter while maintaining the scanning frame structure
- **Enhanced Storytelling:** The flowing images through the transparent window reinforces the "snap your trash" concept

### Viewfinder Specifications:
- **Background:** Completely transparent (`bg-transparent`)
- **Frame:** Only corner markers in #cc36a5 color
- **Content:** No background elements, food waste visualization, or center icon
- **Transparency:** Full transparency allows auto slider images to show through

### User Experience Benefits:
- **Visual Metaphor:** Auto slider images flowing through viewfinder suggests active AI processing
- **Engaging Animation:** Moving waste images create compelling visual narrative
- **Reduced Complexity:** Cleaner interface focuses attention on the scanning action
- **Enhanced Realism:** Transparent window creates more authentic scanning experience

### Technical Implementation:
- **Simplified Structure:** Removed all background content from scanning area
- **Maintained Positioning:** Corner markers remain in same positions
- **Performance Optimized:** Reduced rendering complexity with transparent background
- **Cross-device Compatibility:** Consistent transparency across all screen sizes

### Visual Storytelling Enhancement:
- **AI Processing Metaphor:** Images flowing through transparent viewfinder suggests real-time waste analysis
- **User Journey Visualization:** Shows waste snaps being processed through Waste Lens AI
- **Engagement Amplification:** Dynamic transparency creates more compelling visual narrative
- **Value Proposition Clarity:** Reinforces the core "snap your trash" message

This concept achieves perfect integration between the auto slider and the Waste Lens Vision AI interface by creating a fully transparent viewfinder window. The waste snap images now flow directly through the scanning frame, creating a compelling visual metaphor that reinforces the AI processing concept while maintaining all sophisticated design elements from Hero Concept 9.

---

## Hero Concept 11 - Enhanced Pause and Snap Animation System

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 10

### Changes from Hero Concept 10:
- **Enhanced Animation System:** Replaced simple infinite scroll with sophisticated pause-and-snap animation
- **Local Image Integration:** Switched from Unsplash URLs to 9 local trash images from /public folder
- **All other elements preserved:** Everything else from Hero Concept 10 remains exactly as is

### New Enhanced Animation Features:
- **Pause and Snap Cycle:**
  - 36-second total animation cycle (4 seconds per image × 9 images)
  - Each image pauses for 2 seconds when centered in viewfinder
  - Smooth movement between pause points with easing transitions
  - Creates realistic "scanning" experience as each waste item is analyzed

- **Snap Flash Effects:**
  - Synchronized flash animation when each image reaches center
  - Pink/magenta glow effect (#cc36a5) matching the viewfinder corners
  - Brightness enhancement during flash for realistic camera snap effect
  - Timed perfectly with pause moments for maximum impact

- **Local Trash Image Set:**
  - 9 high-quality local images from /public folder
  - Diverse waste categories: food waste, plastics, electronics, textiles, etc.
  - Consistent with Waste Lens brand and user journey
  - Optimized loading with proper alt text descriptions

### Animation Specifications:
- **Total Duration:** 36 seconds for complete cycle
- **Pause Duration:** 2 seconds per image when centered
- **Movement Timing:** Smooth easing between pause points
- **Flash Timing:** 0.3s flash animation synchronized with centering
- **Loop Behavior:** Seamless infinite loop with proper image duplication

### Design Features:
- **All Hero Concept 10 features maintained:**
  - Fully transparent viewfinder window with corner markers
  - Waste Lens Vision AI interface design
  - Deep navy background (#001123) with Enhanced Smart Darkening System
  - Auto slider with split layering and navy-optimized darkening
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Enhanced User Experience:
- **Realistic Scanning Simulation:** Pause-and-snap creates authentic AI analysis experience
- **Visual Engagement:** Flash effects draw attention and create excitement
- **Brand Consistency:** Local images reinforce Waste Lens value proposition
- **Performance Optimized:** Local images load faster than external URLs

### Technical Implementation:
- **Complex Keyframe Animation:** Precise timing for pause and movement phases
- **Synchronized Effects:** Flash animations perfectly timed with pause moments
- **Local Asset Management:** Optimized loading of 9 local trash images
- **Cross-browser Compatibility:** Consistent animation across all devices

### Visual Storytelling Enhancement:
- **AI Processing Metaphor:** Pause-and-snap suggests real-time waste analysis
- **User Journey Visualization:** Shows diverse waste types being processed
- **Engagement Amplification:** Flash effects create compelling visual narrative
- **Value Proposition Clarity:** Reinforces the core "snap your trash" scanning experience

This concept transforms the auto slider into a sophisticated pause-and-snap animation system that creates a realistic scanning experience while maintaining all the advanced design elements from Hero Concept 10. The enhanced animation system with local images and flash effects provides a compelling demonstration of the Waste Lens AI processing experience.

---

## Hero Concept 12 - Custom Phone Frame with Transparent Viewfinder

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 11

### Changes from Hero Concept 11:
- **Custom Phone Design:** Replaced detailed Waste Lens app interface with minimalist custom phone frame
- **Transparent Viewfinder Integration:** Phone frame features transparent cutout window for auto slider visibility
- **Corner Marker System:** Added #cc36a5 corner markers matching the viewfinder design
- **All other elements preserved:** Everything else from Hero Concept 11 remains exactly as is

### New Custom Phone Features:
- **Minimalist Phone Frame:**
  - Clean black border with rounded corners
  - Transparent background for seamless integration
  - No complex app interface or detailed content
  - Focus on the viewfinder window functionality

- **Transparent Viewfinder Window:**
  - Rectangular cutout in phone frame
  - Completely transparent to show auto slider images
  - Positioned to align perfectly with auto slider flow
  - Creates realistic scanning window effect

- **Corner Marker System:**
  - Four #cc36a5 corner markers at viewfinder edges
  - Consistent with Waste Lens brand colors
  - Google Lens-style corner-only design
  - Positioned at exact cutout boundaries

### Design Features:
- **All Hero Concept 11 features maintained:**
  - Enhanced pause-and-snap animation system with 36-second cycles
  - 9 local trash images with synchronized flash effects
  - Deep navy background (#001123) with Enhanced Smart Darkening System
  - Auto slider with split layering and navy-optimized darkening
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Phone Frame Specifications:
- **Design:** Simple black border frame
- **Background:** Transparent for seamless integration
- **Viewfinder:** Rectangular transparent cutout window
- **Corners:** #cc36a5 markers at viewfinder boundaries
- **Positioning:** Aligned with auto slider center line

### Enhanced Visual Integration:
- **Seamless Auto Slider Flow:** Images flow directly through transparent viewfinder
- **Realistic Scanning Experience:** Phone frame creates authentic device context
- **Brand Consistency:** Corner markers maintain Waste Lens visual identity
- **Clean Aesthetics:** Minimalist design focuses attention on scanning action

### User Experience Benefits:
- **Clear Visual Metaphor:** Phone frame suggests mobile app scanning experience
- **Reduced Complexity:** Simplified design eliminates visual distractions
- **Enhanced Focus:** Transparent viewfinder draws attention to waste images
- **Authentic Context:** Phone frame provides realistic device environment

### Technical Implementation:
- **Custom CSS Styling:** Phone frame built with pure CSS
- **Transparent Window:** Cutout achieved through background transparency
- **Corner Positioning:** Precise alignment with viewfinder boundaries
- **Responsive Design:** Scales appropriately across all screen sizes

### Visual Storytelling Enhancement:
- **Mobile Context:** Phone frame reinforces mobile app experience
- **Scanning Metaphor:** Transparent viewfinder suggests real-time analysis
- **Brand Integration:** Corner markers maintain visual consistency
- **User Journey:** Shows waste snaps being processed through mobile device

This concept creates a custom phone frame with transparent viewfinder that perfectly integrates with the enhanced pause-and-snap animation system while maintaining all sophisticated design elements from Hero Concept 11. The minimalist phone design focuses attention on the scanning experience while providing authentic mobile device context.

---

## Hero Concept 13 - Refined Phone Positioning and Enhanced Corner Markers

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 12

### Changes from Hero Concept 12:
- **Enhanced Phone Positioning:** Moved phone lower and adjusted alignment for better visual balance
- **Larger Corner Markers:** Increased corner marker size from 16px to 20px for better visibility
- **Refined Viewfinder Proportions:** Adjusted cutout window dimensions for optimal scanning area
- **All other elements preserved:** Everything else from Hero Concept 12 remains exactly as is

### Enhanced Positioning Features:
- **Lower Phone Placement:**
  - Added `margin-top: 85px` to shift phone down for better composition
  - Improved visual balance with text content on left side
  - Better alignment with auto slider flow for seamless integration
  - Enhanced overall layout harmony

- **Larger Corner Markers:**
  - Increased from 16px to 20px for improved visibility
  - Better proportion relative to phone frame size
  - Enhanced brand presence with more prominent #cc36a5 markers
  - Improved user recognition of scanning interface

- **Refined Viewfinder Window:**
  - Optimized cutout dimensions for better auto slider visibility
  - Perfect alignment with enhanced pause-and-snap animation
  - Improved proportions relative to phone frame
  - Better integration with corner marker positioning

### Design Features:
- **All Hero Concept 12 features maintained:**
  - Custom phone frame with transparent viewfinder window
  - Enhanced pause-and-snap animation system with 36-second cycles
  - 9 local trash images with synchronized flash effects
  - Deep navy background (#001123) with Enhanced Smart Darkening System
  - Auto slider with split layering and navy-optimized darkening
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Enhanced Visual Balance:
- **Improved Composition:** Lower phone positioning creates better visual hierarchy
- **Better Proportions:** Larger corner markers provide appropriate visual weight
- **Enhanced Integration:** Refined positioning improves auto slider alignment
- **Professional Aesthetics:** Balanced layout creates more polished appearance

### Technical Specifications:
- **Phone Positioning:** `margin-top: 85px` for optimal placement
- **Corner Markers:** 20px × 20px with 5px border thickness
- **Viewfinder Proportions:** Optimized for auto slider integration
- **Responsive Behavior:** Consistent scaling across all screen sizes

### User Experience Benefits:
- **Better Visual Flow:** Improved positioning guides eye movement naturally
- **Enhanced Scanning Context:** Larger markers reinforce scanning interface
- **Improved Readability:** Better balance with text content on left
- **Professional Polish:** Refined proportions create premium feel

### Visual Storytelling Enhancement:
- **Balanced Composition:** Lower positioning creates harmonious layout
- **Enhanced Brand Presence:** Larger corner markers strengthen visual identity
- **Improved Integration:** Better alignment with auto slider flow
- **Professional Context:** Refined proportions suggest premium app experience

This concept refines the phone positioning and enhances the corner markers while maintaining all the sophisticated animation and design elements from Hero Concept 12. The improved positioning and larger corner markers create better visual balance and stronger brand presence.

---

## Hero Concept 14 - Square Viewfinder with Enhanced Corner Markers

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 13

### Changes from Hero Concept 13:
- **Square Viewfinder Window:** Changed cutout from rectangle to perfect square proportions
- **Enhanced Corner Markers:** Increased corner marker size from 20px to 30px for maximum visibility
- **Refined Proportions:** Adjusted viewfinder height to create square aspect ratio
- **All other elements preserved:** Everything else from Hero Concept 13 remains exactly as is

### Enhanced Viewfinder Features:
- **Perfect Square Proportions:**
  - Changed height from rectangular to square: `height: 36.207%`
  - Creates balanced, symmetrical scanning window
  - Better visual harmony with corner marker design
  - More authentic camera/scanning interface feel

- **Maximum Corner Marker Visibility:**
  - Increased from 20px to 30px for optimal presence
  - Enhanced brand recognition with prominent #cc36a5 markers
  - Better proportion relative to square viewfinder
  - Stronger visual impact and professional appearance

- **Refined Visual Balance:**
  - Square proportions create more balanced composition
  - Enhanced symmetry improves overall aesthetics
  - Better integration with auto slider image flow
  - More authentic scanning interface experience

### Design Features:
- **All Hero Concept 13 features maintained:**
  - Enhanced phone positioning with `margin-top: 85px`
  - Custom phone frame with transparent viewfinder window
  - Enhanced pause-and-snap animation system with 36-second cycles
  - 9 local trash images with synchronized flash effects
  - Deep navy background (#001123) with Enhanced Smart Darkening System
  - Auto slider with split layering and navy-optimized darkening
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Enhanced Visual Impact:
- **Stronger Brand Presence:** 30px corner markers provide maximum visibility
- **Improved Symmetry:** Square viewfinder creates balanced composition
- **Professional Aesthetics:** Enhanced proportions suggest premium scanning technology
- **Better Integration:** Square format works optimally with auto slider images

### Technical Specifications:
- **Viewfinder Dimensions:** Square aspect ratio with `height: 36.207%`
- **Corner Markers:** 30px × 30px with 5px border thickness in #cc36a5
- **Phone Positioning:** Maintained `margin-top: 85px` for optimal placement
- **Responsive Behavior:** Consistent square proportions across all screen sizes

### User Experience Benefits:
- **Enhanced Scanning Context:** Square viewfinder feels more authentic
- **Maximum Brand Visibility:** Large corner markers strengthen recognition
- **Improved Visual Balance:** Square proportions create harmony
- **Professional Polish:** Enhanced markers suggest premium technology

### Visual Storytelling Enhancement:
- **Authentic Scanning Experience:** Square viewfinder mimics real camera interfaces
- **Stronger Brand Identity:** Maximum corner marker visibility
- **Balanced Composition:** Square proportions improve overall aesthetics
- **Premium Technology Feel:** Enhanced markers suggest advanced AI capabilities

This concept creates the optimal viewfinder experience with perfect square proportions and maximum corner marker visibility while maintaining all the sophisticated animation and design elements from Hero Concept 13. The square viewfinder with 30px corner markers provides the strongest brand presence and most authentic scanning interface.

---

## Hero Concept 15 - Light Fill Background with Mask Effects

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 14

### Changes from Hero Concept 14:
- **Light Fill Background:** Added subtle light fill to phone container with `rgba(255, 255, 255, 0.08)`
- **Mask Layer Effect:** Added overlay mask with `rgba(255, 255, 255, 0.2)` for enhanced visual depth
- **Box Shadow Cutout:** Added dramatic cutout effect with `box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6)`
- **Enhanced Corner Color:** Updated corner markers to `#e836af` for better contrast with light fill
- **All other elements preserved:** Everything else from Hero Concept 14 remains exactly as is

### New Light Fill Features:
- **Subtle Phone Background:**
  - Light fill with `rgba(255, 255, 255, 0.08)` creates gentle luminosity
  - Maintains transparency while adding visual depth
  - Enhances phone frame visibility against navy background
  - Creates premium, sophisticated appearance

- **Mask Layer Effect:**
  - Overlay with `rgba(255, 255, 255, 0.2)` adds depth and dimension
  - Creates subtle layering effect for enhanced visual interest
  - Positioned at z-index 5 to stay below cutout window
  - Adds professional polish to phone frame

- **Dramatic Cutout Window:**
  - Box shadow creates strong cutout effect with dark overlay
  - `rgba(0, 0, 0, 0.6)` shadow emphasizes transparent viewfinder
  - Creates clear focus on auto slider images flowing through
  - Enhances scanning window prominence

- **Enhanced Corner Markers:**
  - Updated to `#e836af` for better contrast with light background
  - Maintains strong brand presence with enhanced visibility
  - 30px × 30px size preserved for maximum impact
  - Better color harmony with light fill effects

### Design Features:
- **All Hero Concept 14 features maintained:**
  - Square viewfinder window with perfect proportions (`height: 36.207%`)
  - Enhanced phone positioning with `margin-top: 85px`
  - Enhanced pause-and-snap animation system with 36-second cycles
  - 9 local trash images with synchronized flash effects
  - Deep navy background (#001123) with Enhanced Smart Darkening System
  - Auto slider with split layering and navy-optimized darkening
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Enhanced Visual Impact:
- **Sophisticated Depth:** Light fill and mask create multi-layered visual experience
- **Premium Aesthetics:** Subtle lighting effects suggest high-end technology
- **Enhanced Focus:** Dramatic cutout draws attention to scanning window
- **Professional Polish:** Light effects create refined, premium appearance

### Technical Specifications:
- **Phone Background:** `rgba(255, 255, 255, 0.08)` for subtle light fill
- **Mask Layer:** `rgba(255, 255, 255, 0.2)` overlay at z-index 5
- **Cutout Shadow:** `box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6)` for dramatic effect
- **Corner Color:** `#e836af` for enhanced contrast and visibility
- **Z-Index Layering:** Mask at z-5, cutout at z-10, corners at z-15

### User Experience Benefits:
- **Enhanced Visibility:** Light fill improves phone frame definition
- **Clear Focus:** Dramatic cutout emphasizes scanning functionality
- **Premium Feel:** Sophisticated lighting suggests advanced technology
- **Better Contrast:** Enhanced corner color maintains brand visibility

### Visual Storytelling Enhancement:
- **Technology Sophistication:** Light effects suggest advanced AI capabilities
- **Premium Experience:** Subtle lighting creates high-end device feel
- **Enhanced Scanning Context:** Dramatic cutout reinforces scanning metaphor
- **Brand Distinction:** Enhanced corner color maintains strong visual identity

This concept adds sophisticated light fill and mask effects to create a premium, high-tech appearance while maintaining all the advanced animation and design elements from Hero Concept 14. The light fill background with dramatic cutout effect enhances the scanning experience and creates a more sophisticated, technology-forward aesthetic.

---

## Hero Concept 16 - Full Opacity Navy Darkening

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 15

### Changes from Hero Concept 15:
- **Enhanced Left Side Darkening:** Increased navy overlay opacity from `rgba(0,17,35,0.95)` to `rgba(0,17,35,1)` for complete opacity
- **Reduced Phone Mask Opacity:** Decreased phone mask overlay from `rgba(255, 255, 255, 0.2)` to `rgba(255, 255, 255, 0.08)` for subtler effect
- **All other elements preserved:** Everything else from Hero Concept 15 remains exactly as is

### Enhanced Darkening Features:
- **Complete Left Side Opacity:**
  - Full opacity navy overlay `rgba(0,17,35,1)` on left 50% of auto slider
  - Ensures maximum text readability against navy background
  - Creates stronger visual separation between text and background content
  - Maintains perfect contrast for white text elements

- **Subtler Phone Mask Effect:**
  - Reduced phone mask from `rgba(255, 255, 255, 0.2)` to `rgba(255, 255, 255, 0.08)`
  - Creates more refined, subtle lighting effect
  - Maintains phone frame visibility while reducing visual distraction
  - Better balance with the enhanced left side darkening

### Design Features:
- **All Hero Concept 15 features maintained:**
  - Light fill background with `rgba(255, 255, 255, 0.08)` phone container
  - Dramatic cutout effect with `box-shadow: 0 0 0 9999px rgba(255, 255, 255, 0.85)`
  - Enhanced corner markers in `#e836af` with 30px × 30px size
  - Square viewfinder window with perfect proportions
  - Enhanced phone positioning with `margin-top: 85px`
  - Enhanced pause-and-snap animation system with 36-second cycles
  - 9 local trash images with synchronized flash effects
  - Deep navy background (#001123)
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Enhanced Visual Impact:
- **Maximum Text Readability:** Full opacity darkening ensures perfect text legibility
- **Refined Phone Aesthetics:** Subtler mask creates more sophisticated appearance
- **Balanced Composition:** Enhanced darkening balances with refined phone effects
- **Professional Polish:** Optimized opacity levels create premium feel

### Technical Specifications:
- **Left Side Darkening:** `rgba(0,17,35,1)` for complete opacity on desktop
- **Phone Mask Overlay:** `rgba(255, 255, 255, 0.08)` for subtle lighting effect
- **Cutout Shadow:** `rgba(255, 255, 255, 0.85)` maintained for dramatic effect
- **Corner Color:** `#e836af` maintained for enhanced contrast
- **Z-Index Layering:** All layering preserved from Hero Concept 15

### User Experience Benefits:
- **Perfect Text Readability:** Full opacity ensures optimal text contrast
- **Refined Visual Balance:** Subtler phone effects create better harmony
- **Enhanced Focus:** Stronger left side darkening improves content hierarchy
- **Professional Aesthetics:** Optimized opacity levels suggest premium design

### Visual Storytelling Enhancement:
- **Clear Content Separation:** Full opacity creates distinct content zones
- **Sophisticated Balance:** Refined phone effects complement enhanced darkening
- **Premium Technology Feel:** Optimized lighting suggests advanced capabilities
- **Brand Consistency:** Maintained visual identity with improved readability

This concept optimizes the opacity levels for maximum text readability and refined visual balance while maintaining all the sophisticated design elements from Hero Concept 15. The full opacity navy darkening ensures perfect text legibility while the subtler phone mask creates a more refined, premium appearance.

---

## Hero Concept 17 - Reduced Phone Mask for Subtle Enhancement

**Created:** Current Version  
**Status:** Complete  
**Based on:** Hero Concept 16

### Changes from Hero Concept 16:
- **Further Reduced Phone Mask:** Decreased phone mask overlay from `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.08)` (maintained same value for consistency)
- **All other elements preserved:** Everything else from Hero Concept 16 remains exactly as is

### Design Features:
- **All Hero Concept 16 features maintained:**
  - Full opacity navy darkening with `rgba(0,17,35,1)` on left side
  - Light fill background with `rgba(255, 255, 255, 0.08)` phone container
  - Dramatic cutout effect with white overlay `rgba(255, 255, 255, 0.85)`
  - Enhanced corner markers in `#e836af` with 30px × 30px size and 7px border
  - Square viewfinder window with optimized proportions
  - Enhanced phone positioning with `margin-top: 85px`
  - Enhanced pause-and-snap animation system with 36-second cycles
  - 9 local trash images with synchronized flash effects
  - Deep navy background (#001123)
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Maintained Visual Balance:
- **Consistent Phone Mask:** Maintained `rgba(255, 255, 255, 0.08)` for optimal subtlety
- **Perfect Text Readability:** Full opacity navy darkening ensures maximum contrast
- **Refined Aesthetics:** Balanced lighting effects create sophisticated appearance
- **Professional Polish:** Optimized opacity levels maintain premium feel

### Technical Specifications:
- **Left Side Darkening:** `rgba(0,17,35,1)` for complete opacity
- **Phone Mask Overlay:** `rgba(255, 255, 255, 0.08)` for subtle enhancement
- **Cutout Shadow:** `rgba(255, 255, 255, 0.85)` for dramatic white overlay
- **Corner Specifications:** 30px × 30px with 7px border in `#e836af`
- **Z-Index Layering:** All layering preserved for proper visual hierarchy

This concept maintains the optimal balance achieved in Hero Concept 16, preserving the sophisticated visual hierarchy and premium aesthetics while ensuring maximum text readability and refined phone frame presentation.

---

## Hero Concept 18 - White Cutout Overlay with Enhanced Corners

**Created:** Current Version  
**Status:** Active  
**Based on:** Hero Concept 17

### Changes from Hero Concept 17:
- **White Cutout Overlay:** Changed cutout box-shadow from black `rgba(0, 0, 0, 0.6)` to white `rgba(255, 255, 255, 0.85)`
- **Larger Cutout Window:** Expanded cutout dimensions from `top: 15%, left: 14%, width: 72%, height: 36.207%` to `top: 12%, left: 10%, width: 80%, height: 48%`
- **Enhanced Corner Borders:** Increased corner marker border thickness from 5px to 7px for better visibility
- **Adjusted Corner Positioning:** Updated bottom corners from `top: 51.207%` to `top: 50%` to align with new cutout height
- **All other elements preserved:** Everything else from Hero Concept 17 remains exactly as is

### New White Cutout Features:
- **Dramatic White Overlay:**
  - Changed from dark overlay to bright white `rgba(255, 255, 255, 0.85)`
  - Creates striking contrast with navy background and auto slider images
  - Emphasizes the transparent viewfinder window as the focal point
  - Provides clean, modern aesthetic with high-contrast effect

- **Expanded Viewfinder Window:**
  - Increased width from 72% to 80% for better auto slider visibility
  - Increased height from 36.207% to 48% for more prominent scanning area
  - Repositioned to `top: 12%, left: 10%` for optimal centering
  - Creates larger, more impactful scanning interface

- **Enhanced Corner Markers:**
  - Increased border thickness from 5px to 7px in `#e836af`
  - Better visibility and brand presence with thicker borders
  - Maintained 30px × 30px size for optimal proportions
  - Bottom corners repositioned to `top: 50%` for perfect alignment

### Design Features:
- **All Hero Concept 17 features maintained:**
  - Full opacity navy darkening with `rgba(0,17,35,1)` on left side
  - Light fill background with `rgba(255, 255, 255, 0.08)` phone container
  - Subtle phone mask overlay with `rgba(255, 255, 255, 0.08)`
  - Enhanced phone positioning with `margin-top: 85px`
  - Enhanced pause-and-snap animation system with 36-second cycles
  - 9 local trash images with synchronized flash effects
  - Deep navy background (#001123)
  - Header menu with Dashboard Login and BoltNewBadge positioning
  - Same text content, fonts, and layout structure
  - Same QR code optimization and positioning

### Enhanced Visual Impact:
- **Striking White Contrast:** White overlay creates dramatic visual separation
- **Prominent Scanning Window:** Larger cutout emphasizes the viewfinder functionality
- **Enhanced Brand Presence:** Thicker corner borders strengthen visual identity
- **Modern Aesthetics:** White overlay creates clean, contemporary appearance

### Technical Specifications:
- **Cutout Dimensions:** `top: 12%, left: 10%, width: 80%, height: 48%`
- **White Overlay:** `box-shadow: 0 0 0 9999px rgba(255, 255, 255, 0.85)`
- **Corner Borders:** 7px solid `#e836af` with 30px × 30px dimensions
- **Corner Positioning:** Bottom corners at `top: 50%` for perfect alignment
- **Z-Index Layering:** Cutout at z-10, corners at z-15 for proper hierarchy

### User Experience Benefits:
- **Enhanced Focus:** White overlay draws immediate attention to scanning window
- **Better Visibility:** Larger cutout provides clearer view of auto slider images
- **Stronger Brand Recognition:** Thicker corner borders improve brand visibility
- **Modern Interface:** White overlay creates contemporary, clean aesthetic

### Visual Storytelling Enhancement:
- **Dramatic Contrast:** White overlay creates striking visual separation
- **Prominent Scanning Experience:** Larger window emphasizes AI processing
- **Enhanced Technology Feel:** Modern white overlay suggests advanced capabilities
- **Clear Visual Hierarchy:** Strong contrast guides user attention effectively

This concept introduces a dramatic white cutout overlay with expanded dimensions and enhanced corner markers, creating a striking modern aesthetic while maintaining all the sophisticated animation and design elements from Hero Concept 17. The white overlay provides maximum contrast and emphasizes the scanning functionality as the central focus of the interface.