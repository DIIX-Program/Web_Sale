import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
  sku?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, sku?: string) => void;
  updateQuantity: (productId: string, quantity: number, sku?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.sku === item.sku
        );

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.sku === item.sku
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId, sku) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.sku === sku)
          ),
        });
      },
      updateQuantity: (productId, quantity, sku) => {
        if (quantity <= 0) {
          get().removeItem(productId, sku);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.sku === sku
              ? { ...i, quantity }
              : i
          ),
        });
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

