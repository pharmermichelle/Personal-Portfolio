# Waste Lens - Hero Concept 20

A beautiful, production-ready landing page for Waste Lens - an innovative app that helps users "snap their trash" to lower their tax or utility bills.

## Features

- **Responsive Design**: Optimized for all device sizes
- **Interactive Elements**: Smooth animations and hover effects
- **Auto Image Slider**: Showcases different types of waste with pause-and-snap animations
- **Phone Mockup**: Custom viewfinder-style phone interface with integrated image slider
- **QR Code Integration**: Easy app download access
- **Dashboard Integration**: Direct link to dashboard.wastelens.works

## Hero Concepts

This project contains multiple hero concept versions:

- **Hero Concept 20** (Current): Features integrated image slider within phone cutout window
- **Hero Concept 18**: Previous version with wavy background and separate phone mockups

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Simplex Noise** for background effects

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/waste-lens-hero.git
cd waste-lens-hero
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project is optimized for deployment on:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## Project Structure

```
src/
├── components/
│   └── ui/
│       ├── bolt-new-badge.tsx
│       ├── image-auto-slider.tsx
│       ├── solid-background-demo.tsx
│       ├── hero-concept-20.tsx
│       ├── wavy-background.tsx
│       └── wavy-background-demo.tsx
├── lib/
│   └── utils.ts
├── App.tsx
├── main.tsx
└── index.css
```

## License

This project is licensed under the MIT License.