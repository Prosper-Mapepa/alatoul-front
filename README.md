# Alatoul Frontend

Modern, clean, and user-friendly frontend for Alatoul - a ride-hailing platform where transportation is available all the time.

## 🚀 Features

- **Beautiful Landing Page** - Modern hero section showcasing key features
- **Ride Booking** - Intuitive interface with fare negotiation
- **User Dashboard** - Trip history, profile management, and statistics
- **Driver Dashboard** - Earnings tracking, ride requests, and online/offline status
- **Trip Tracking** - Real-time trip tracking with live map (placeholder)
- **Safety Features** - Comprehensive safety information and emergency contacts
- **Responsive Design** - Mobile-first design that works on all devices

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── dashboard/         # User dashboard
│   ├── driver/            # Driver dashboard
│   ├── ride/              # Ride booking page
│   ├── tracking/          # Trip tracking page
│   ├── safety/            # Safety features page
│   ├── about/             # About page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components (Navbar, Footer)
├── lib/
│   └── utils.ts           # Utility functions
└── package.json
```

## 🎨 Design Philosophy

- **Clean & Minimal** - Reduced whitespace, focused content
- **User-Friendly** - Intuitive navigation and clear actions
- **Stunning Visuals** - Modern gradients, smooth animations
- **Accessible** - WCAG compliant, keyboard navigation support

## 📱 Pages

- `/` - Landing page with features and hero section
- `/ride` - Book a ride with fare negotiation
- `/dashboard` - User dashboard with trips and profile
- `/driver` - Driver dashboard with earnings and requests
- `/tracking` - Real-time trip tracking
- `/safety` - Safety features and tips
- `/about` - About Alatoul

## 🚦 Development

### Build for Production
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

## 🔜 Next Steps

Once frontend is approved, we'll move on to:
- Backend (NestJS + PostgreSQL)
- Mobile app (React Native Expo)

