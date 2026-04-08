declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export const PIXEL_ID = "1275466108111185";

export function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

// Eventos estándar para ParillaBurgers
export const MetaEvents = {
  viewContent: (itemName: string, price: number) =>
    fbq("track", "ViewContent", { content_name: itemName, value: price, currency: "COP" }),

  addToCart: (total: number, numItems: number) =>
    fbq("track", "AddToCart", { value: total, currency: "COP", num_items: numItems }),

  initiateCheckout: (total: number, numItems: number) =>
    fbq("track", "InitiateCheckout", { value: total, currency: "COP", num_items: numItems }),

  purchase: (orderNumber: string, total: number) =>
    fbq("track", "Purchase", { value: total, currency: "COP", content_ids: [orderNumber] }),
};
