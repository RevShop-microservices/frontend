import { createContext, useContext, useState, useCallback } from "react";
import { getCart, addToCartAPI, removeFromCartAPI, clearCartAPI, updateCartAPI } from "../api/cartApi";
import { toast } from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async (userId) => {
    if (!userId) return;
    setCartLoading(true);
    try {
      const res = await getCart(userId);
      setCartItems(res.data?.items || res.data || []);
    } catch {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const addToCart = async (userId, product) => {
    // Optimistic local update
    setCartItems((prev) => {
      const exists = prev.find((i) => i.productId === product.id);
      if (exists) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: product.id, product, quantity: 1 }];
    });

    if (userId) {
      try {
        await addToCartAPI(userId, { productId: product.id, quantity: 1 });
      } catch {
        toast.error("Failed to sync cart");
      }
    }
  };

  const removeFromCart = async (userId, productId) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
    if (userId) {
      try {
        await removeFromCartAPI(userId, productId);
      } catch {
        toast.error("Failed to remove item");
      }
    }
  };

  const updateQuantity = async (userId, productId, quantity) => {
    if (quantity < 1) return removeFromCart(userId, productId);
    setCartItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
    if (userId) {
      try {
        await updateCartAPI(userId, { productId, quantity });
      } catch {
        toast.error("Failed to update quantity");
      }
    }
  };

  const clearCart = async (userId) => {
    setCartItems([]);
    if (userId) {
      try {
        await clearCartAPI(userId);
      } catch {
        toast.error("Failed to clear cart");
      }
    }
  };

  const cartCount = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + (i.product?.price || i.price || 0) * (i.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, cartTotal, cartLoading, fetchCart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
