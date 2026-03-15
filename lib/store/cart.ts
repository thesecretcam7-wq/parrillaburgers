import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, MenuItem } from "@/lib/types";

type CartStore = {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.item.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.item.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { item, quantity: 1 }] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.item.id === itemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (sum, i) => sum + i.item.price * i.quantity,
          0
        ),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "parrillaburger-cart" }
  )
);
