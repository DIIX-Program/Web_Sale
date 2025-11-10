'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, Plus, Minus, Truck, Shield } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ProductGrid } from '@/components/ProductGrid';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  variants: Array<{
    sku: string;
    option: string;
    stock: number;
    price?: number;
  }>;
  category: string;
  tags: string[];
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/slug/${slug}`);
        setProduct(response.data.data.product);
        if (response.data.data.product.variants.length > 0) {
          setSelectedVariant(response.data.data.product.variants[0].sku);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    const variant = product.variants.find((v) => v.sku === selectedVariant);
    const price = variant?.price || product.price;
    const availableStock = variant?.stock || product.stock;

    if (quantity > availableStock) {
      toast.error('Insufficient stock');
      return;
    }

    addItem({
      productId: product._id,
      title: product.title,
      image: product.images[0],
      price,
      quantity,
      variant: variant?.option,
      sku: selectedVariant || undefined,
    });

    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-300 dark:bg-gray-700 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-300 dark:bg-gray-700 h-8 rounded"></div>
              <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded"></div>
              <div className="bg-gray-300 dark:bg-gray-700 h-4 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">Product not found</p>
      </div>
    );
  }

  const variant = product.variants.find((v) => v.sku === selectedVariant);
  const price = variant?.price || product.price;
  const availableStock = variant?.stock || product.stock;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <Image
              src={product.images[selectedImage] || product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === index
                    ? 'border-primary-600'
                    : 'border-transparent'
                }`}
              >
                <Image src={image} alt={`${product.title} ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold font-heading mb-4">{product.title}</h1>
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="ml-2 text-lg">
                {product.rating.toFixed(1)} ({product.reviewsCount} reviews)
              </span>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              ${price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="ml-2 text-xl text-gray-500 line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description}</p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Variant</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.sku}
                    onClick={() => setSelectedVariant(v.sku)}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      selectedVariant === v.sku
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {v.option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {availableStock} in stock
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={availableStock === 0}
            className="w-full bg-gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-4"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
          </button>

          {/* Features */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>Secure payment with Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold font-heading mb-6">Related Products</h2>
        <ProductGrid category={product.category} limit={4} />
      </div>
    </div>
  );
}

