import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/products";

interface FavoritesContextType {
  favoriteItems: Product[];
  isFavoritesOpen: boolean;
  toggleFavorite: (product: Product) => void;
  isFavorite: (name: string) => boolean;
  openFavorites: () => void;
  closeFavorites: () => void;
  setIsFavoritesOpen: (open: boolean) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState<Product[]>([]);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load favorites from localStorage on mount safely
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("hapyezta-favorites");
      if (storedFavorites) {
        setFavoriteItems(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("hapyezta-favorites", JSON.stringify(favoriteItems));
    } catch (error) {
      console.error("Failed to save favorites to localStorage:", error);
    }
  }, [favoriteItems, isInitialized]);

  const toggleFavorite = (product: Product) => {
    setFavoriteItems((prevItems) => {
      const exists = prevItems.some((item) => item.name === product.name);
      if (exists) {
        // Remove from favorites
        return prevItems.filter((item) => item.name !== product.name);
      } else {
        // Add to favorites
        return [...prevItems, product];
      }
    });
  };

  const isFavorite = (name: string) => {
    return favoriteItems.some((item) => item.name === name);
  };

  const openFavorites = () => setIsFavoritesOpen(true);
  const closeFavorites = () => setIsFavoritesOpen(false);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteItems,
        isFavoritesOpen,
        toggleFavorite,
        isFavorite,
        openFavorites,
        closeFavorites,
        setIsFavoritesOpen,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
