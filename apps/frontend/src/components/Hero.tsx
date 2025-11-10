'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-gradient-primary text-white py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            Welcome to Web Sale
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Discover amazing products at unbeatable prices. Shop now and enjoy
            fast, free shipping on orders over $50.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/products?category=Electronics"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Browse Electronics
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

