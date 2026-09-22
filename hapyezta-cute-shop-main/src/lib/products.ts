export interface Product {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  img: string;
  tag?: string;
  category: string;
  description: string;
  stockStatus: "in_stock" | "low_stock" | "sold_out";
  colors: string[];
  details: string[];
  weight?: number; // Weight in grams
}

export const products: Product[] = [];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function calculateShippingCost(totalWeightGrams: number): number {
  if (totalWeightGrams <= 0) return 0;

  // Round up to the nearest multiple of 500g
  let wRounded = Math.ceil(totalWeightGrams / 500) * 500;
  if (wRounded < 500) {
    wRounded = 500;
  }

  if (wRounded <= 5000) {
    // Up to 5kg: starts at 42.48 for 500g, +18.88 for each additional 500g
    return parseFloat((42.48 + 18.88 * ((wRounded - 500) / 500)).toFixed(2));
  } else {
    // Above 5kg: jump to 237.18 at 5.5kg (5500g), then +18.88 for each additional 500g
    return parseFloat((237.18 + 18.88 * ((wRounded - 5500) / 500)).toFixed(2));
  }
}
