import React, { createContext, useContext, useState, useEffect } from "react";
import { products as initialProducts, Product } from "@/lib/products";
import c1 from "@/assets/c1.jpg";
import c2 from "@/assets/c2.jpg";
import c3 from "@/assets/c3.jpg";
import c4 from "@/assets/c4.jpg";
import c5 from "@/assets/c5.jpg";
import c6 from "@/assets/c6.jpg";
import c7 from "@/assets/c7.jpg";
import c8 from "@/assets/c8.jpg";

import hero from "@/assets/hero.jpg";
import heroSlide1 from "@/assets/hero_slide_1.png";
import heroSlide2 from "@/assets/hero_slide_2.png";
import heroSlide3 from "@/assets/hero_slide_3.png";

import {
  getStoreData,
  addProductFn,
  updateProductFn,
  deleteProductFn,
  addCategoryFn,
  updateCategoryFn,
  deleteCategoryFn,
  updateHeroImagesFn,
} from "@/lib/api/db.functions";

export interface Category {
  name: string;
  img: string;
  color: string;
}

const initialCategories: Category[] = [];

const initialHeroImages: string[] = [];

interface ProductContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, "id"> & { id?: string }) => void;
  updateProduct: (product: Product) => void;
  addCategory: (category: Category) => void;
  deleteProduct: (id: string) => void;
  deleteCategory: (name: string) => void;
  updateCategory: (oldName: string, updatedCategory: Category) => void;
  heroImages: string[];
  updateHeroImages: (images: string[]) => void;
  dbError: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from Neon PostgreSQL database on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getStoreData();
        setProducts(data.products);
        setCategories(data.categories);
        setHeroImages(data.heroImages);
        setDbError(null);
      } catch (error) {
        console.error("Failed to load store data from database, falling back to mock data:", error);
        setDbError(error instanceof Error ? error.message : String(error));
        setProducts([]);
        setCategories([]);
        setHeroImages([]);
      }
      setIsInitialized(true);
    }
    loadData();
  }, []);

  const addProduct = async (newProduct: Omit<Product, "id"> & { id?: string }) => {
    const baseId = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = newProduct.id || `${baseId}-${Math.floor(1000 + Math.random() * 9000)}`;
    const productWithId = { ...newProduct, id } as Product;
    
    // Optimistic update
    setProducts((prev) => [...prev, productWithId]);
    
    try {
      await addProductFn({
        data: {
          ...newProduct,
          id,
          stockStatus: newProduct.stockStatus,
          colors: newProduct.colors,
          details: newProduct.details,
        }
      });
    } catch (err) {
      console.error("Failed to save product to database:", err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to save product to database: ${errMsg}\n\nPlease try again! 🌸`);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );

    try {
      await updateProductFn({
        data: {
          ...updatedProduct,
          stockStatus: updatedProduct.stockStatus,
        }
      });
    } catch (err) {
      console.error("Failed to update product in database:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to update product in database: ${errMsg}\n\nPlease try again! 🌸`);
      try {
        const data = await getStoreData();
        setProducts(data.products);
      } catch (_) {}
    }
  };

  const addCategory = async (newCategory: Category) => {
    // Optimistic update
    setCategories((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === newCategory.name.toLowerCase())) {
        return prev;
      }
      return [...prev, newCategory];
    });

    try {
      await addCategoryFn({ data: newCategory });
    } catch (err) {
      console.error("Failed to add category to database:", err);
      setCategories((prev) => prev.filter((c) => c.name !== newCategory.name));
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to add category to database: ${errMsg}\n\nPlease try again! 🌸`);
    }
  };

  const deleteProduct = async (id: string) => {
    // Optimistic update
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteProductFn({ data: { id } });
    } catch (err) {
      console.error("Failed to delete product from database:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete product: ${errMsg}\n\nPlease try again! 🌸`);
      try {
        const data = await getStoreData();
        setProducts(data.products);
      } catch (_) {}
    }
  };

  const deleteCategory = async (name: string) => {
    // Optimistic update
    setCategories((prev) => {
      const remaining = prev.filter((c) => c.name !== name);
      const defaultCat = remaining[0]?.name || "Cute Stationery";
      setProducts((productsPrev) =>
        productsPrev.map((p) =>
          p.category.toLowerCase() === name.toLowerCase() ? { ...p, category: defaultCat } : p
        )
      );
      return remaining;
    });

    try {
      await deleteCategoryFn({ data: { name } });
    } catch (err) {
      console.error("Failed to delete category from database:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to delete category: ${errMsg}\n\nPlease try again! 🌸`);
      try {
        const data = await getStoreData();
        setCategories(data.categories);
        setProducts(data.products);
      } catch (_) {}
    }
  };

  const updateCategory = async (oldName: string, updatedCategory: Category) => {
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.name.toLowerCase() === oldName.toLowerCase() ? updatedCategory : c))
    );
    setProducts((prev) =>
      prev.map((p) =>
        p.category.toLowerCase() === oldName.toLowerCase()
          ? { ...p, category: updatedCategory.name }
          : p
      )
    );

    try {
      await updateCategoryFn({ data: { oldName, updatedCategory } });
    } catch (err) {
      console.error("Failed to update category in database:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to update category: ${errMsg}\n\nPlease try again! 🌸`);
      try {
        const data = await getStoreData();
        setCategories(data.categories);
        setProducts(data.products);
      } catch (_) {}
    }
  };

  const updateHeroImages = async (newImages: string[]) => {
    // Optimistic update
    setHeroImages(newImages);

    try {
      await updateHeroImagesFn({ data: newImages });
    } catch (err) {
      console.error("Failed to update hero images in database:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to update hero images: ${errMsg}\n\nPlease try again! 🌸`);
      try {
        const data = await getStoreData();
        setHeroImages(data.heroImages);
      } catch (_) {}
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        addCategory,
        deleteProduct,
        deleteCategory,
        updateCategory,
        heroImages,
        updateHeroImages,
        dbError,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    if (typeof window === "undefined") {
      return {
        products: [],
        categories: [],
        heroImages: [],
        addProduct: () => {},
        updateProduct: () => {},
        addCategory: () => {},
        deleteProduct: () => {},
        deleteCategory: () => {},
        updateCategory: () => {},
        updateHeroImages: () => {},
        dbError: null,
      };
    }
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
