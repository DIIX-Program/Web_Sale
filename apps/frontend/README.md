# Web Sale Frontend

Next.js frontend for the Web Sale e-commerce platform.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🛒 Shopping cart with persistent storage
- 💳 Stripe payment integration
- 🔐 User authentication
- 📱 Fully responsive design
- ⚡ Fast performance with Next.js 14

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your API URL and Stripe key
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utility functions and API client
└── store/           # Zustand state management
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Deployment

The frontend can be deployed to Vercel, Netlify, or any platform that supports Next.js.

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

## License

MIT

