'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ProductCard } from './ProductCard';

interface Product {
  _id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  category: string;
}

interface ProductGridProps {
  limit?: number;
  category?: string;
  searchQuery?: string;
}

export function ProductGrid({ limit, category, searchQuery }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = { limit: limit || 12 };
        if (category) params.category = category;
        if (searchQuery) params.q = searchQuery;

        const response = await api.get('/products', { params });
        setProducts(response.data.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit, category, searchQuery]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 animate-pulse"
          >
            <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded mb-2"></div>
            <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No products found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

