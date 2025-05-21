import axios from 'axios';
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_UPDATE_ITEM_QUANTITY,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_CLEAR_ITEMS,
  CART_APPLY_COUPON,
  CART_REMOVE_COUPON
} from '../constants/cartConstants';
import { mockMenuItems } from './menuItemActions';

// Helper function to get user-specific localStorage keys
const getUserKey = (key) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo._id) {
    return `${key}_${userInfo._id}`;
  }
  return key;
};

// Add item to cart action
export const addToCart = (id, quantity, specialInstructions = '') => async (dispatch, getState) => {
  try {
    // Try to get menu item from API
    let menuItemData;
    try {
      const { data } = await axios.get(`/api/menu-items/${id}`);
      menuItemData = data;
    } catch (apiError) {
      console.error('API error when fetching menu item for cart:', apiError);
      
      // If API fails, check if we have mock data
      if (typeof mockMenuItems !== 'undefined') {
        menuItemData = mockMenuItems.find(item => item._id === id);
      }
      
      // If we still don't have data, use a fallback
      if (!menuItemData) {
        // Get menu item details from state if available
        const { menuItemDetails } = getState();
        if (menuItemDetails && menuItemDetails.menuItem && menuItemDetails.menuItem._id === id) {
          menuItemData = menuItemDetails.menuItem;
        } else {
          // Create a generic item as last resort
          menuItemData = {
            _id: id,
            name: 'Menu Item',
            image_url: '/images/default-food.jpg',
            price: 0,
          };
        }
      }
    }

    // Dispatch the add to cart action
    dispatch({
      type: CART_ADD_ITEM,
      payload: {
        menuItem: menuItemData._id,
        name: menuItemData.name,
        image: menuItemData.image_url,
        price: menuItemData.price,
        qty: quantity,
        specialInstructions,
      },
    });

    const { userLogin } = getState();
    if (userLogin.userInfo) {
      // Save cart items with user-specific key
      localStorage.setItem(getUserKey('cartItems'), JSON.stringify(getState().cart.cartItems));
      
      // Also sync with server
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userLogin.userInfo.token}`,
          },
        };
        
        await axios.post('/api/cart', { cartItems: getState().cart.cartItems }, config);
      } catch (error) {
        console.error('Failed to sync cart with server:', error);
        // Continue anyway, as we've saved to localStorage
      }
    } else {
      // Guest cart
      localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};

// Update cart item quantity action
export const updateCartItemQuantity = (id, qty) => (dispatch, getState) => {
  dispatch({
    type: CART_UPDATE_ITEM_QUANTITY,
    payload: {
      menuItem: id,
      qty,
    },
  });

  const { userLogin } = getState();
  if (userLogin.userInfo) {
    localStorage.setItem(getUserKey('cartItems'), JSON.stringify(getState().cart.cartItems));
    
    // Sync with server
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userLogin.userInfo.token}`,
        },
      };
      
      axios.post('/api/cart/sync', { cartItems: getState().cart.cartItems }, config);
    } catch (syncError) {
      console.error('Error syncing cart with server:', syncError);
    }
  } else {
    localStorage.setItem('guestCartItems', JSON.stringify(getState().cart.cartItems));
  }
};

// Remove item from cart action
export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: id,
  });

  const { userLogin } = getState();
  if (userLogin.userInfo) {
    localStorage.setItem(getUserKey('cartItems'), JSON.stringify(getState().cart.cartItems));
    
    // Sync with server
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userLogin.userInfo.token}`,
        },
      };
      
      axios.post('/api/cart/sync', { cartItems: getState().cart.cartItems }, config);
    } catch (syncError) {
      console.error('Error syncing cart with server:', syncError);
    }
  } else {
    localStorage.setItem('guestCartItems', JSON.stringify(getState().cart.cartItems));
  }
};

// Save shipping address action
export const saveShippingAddress = (data) => (dispatch, getState) => {
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: data,
  });

  const { userLogin } = getState();
  if (userLogin.userInfo) {
    localStorage.setItem(getUserKey('shippingAddress'), JSON.stringify(data));
  } else {
    localStorage.setItem('guestShippingAddress', JSON.stringify(data));
  }
};

// Save payment method action
export const savePaymentMethod = (data) => (dispatch, getState) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  });

  const { userLogin } = getState();
  if (userLogin.userInfo) {
    localStorage.setItem(getUserKey('paymentMethod'), JSON.stringify(data));
  } else {
    localStorage.setItem('guestPaymentMethod', JSON.stringify(data));
  }
};

// Apply coupon action
export const applyCoupon = (couponCode) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState();

    if (!userInfo) {
      throw new Error('You must be logged in to apply a coupon');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Use the validate endpoint with POST method instead of GET by ID
    const { data } = await axios.post(
      '/api/coupons/validate',
      { code: couponCode },
      config
    );

    if (data && data.valid) {
      const couponData = {
        code: couponCode,
        discountPercent: data.discount_percent,
      };
      
      dispatch({
        type: CART_APPLY_COUPON,
        payload: couponData,
      });

      localStorage.setItem(getUserKey('coupon'), JSON.stringify(couponData));
    } else {
      throw new Error(data.message || 'Invalid or expired coupon');
    }
  } catch (error) {
    console.error('Error applying coupon:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Remove coupon action
export const removeCoupon = () => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_COUPON,
  });

  const { userLogin } = getState();
  if (userLogin.userInfo) {
    localStorage.removeItem(getUserKey('coupon'));
  } else {
    localStorage.removeItem('guestCoupon');
  }
};

// Clear cart items action
export const clearCart = () => (dispatch, getState) => {
  dispatch({
    type: CART_CLEAR_ITEMS,
  });

  const { userLogin } = getState();
  if (userLogin.userInfo) {
    localStorage.removeItem(getUserKey('cartItems'));
    localStorage.removeItem(getUserKey('shippingAddress'));
    localStorage.removeItem(getUserKey('paymentMethod'));
    localStorage.removeItem(getUserKey('coupon'));
    
    // Also clear from server
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userLogin.userInfo.token}`,
        },
      };
      
      axios.delete('/api/cart', config);
    } catch (clearError) {
      console.error('Error clearing cart on server:', clearError);
    }
  } else {
    localStorage.removeItem('guestCartItems');
    localStorage.removeItem('guestShippingAddress');
    localStorage.removeItem('guestPaymentMethod');
    localStorage.removeItem('guestCoupon');
  }
};

// Load user cart from localStorage or server
export const loadUserCart = () => async (dispatch, getState) => {
  const { userLogin } = getState();
  
  if (userLogin.userInfo) {
    // Logged in user - try to get cart from server first
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userLogin.userInfo.token}`,
        },
      };
      
      const { data } = await axios.get('/api/cart', config);
      
      if (data && data.length > 0) {
        // Convert server cart format to client format
        const cartItems = data.map(item => ({
          menuItem: item.menu_item_id._id,
          name: item.menu_item_id.name,
          image: item.menu_item_id.image_url,
          price: item.menu_item_id.price,
          qty: item.quantity,
          specialInstructions: item.special_instructions || ''
        }));
        
        dispatch({
          type: CART_ADD_ITEM,
          payload: cartItems,
          replace: true, // Add a flag to replace the entire cart
        });
        
        return;
      }
      
      // If server cart is empty, try localStorage
      const cartItems = localStorage.getItem(getUserKey('cartItems'))
        ? JSON.parse(localStorage.getItem(getUserKey('cartItems')))
        : [];
      
      if (cartItems.length > 0) {
        dispatch({
          type: CART_ADD_ITEM,
          payload: cartItems,
          replace: true,
        });
        
        // Sync with server
        try {
          await axios.post('/api/cart/sync', { cartItems }, config);
        } catch (syncError) {
          console.error('Error syncing cart with server:', syncError);
        }
      }
    } catch (error) {
      console.error('Error loading user cart:', error);
    }
  } else {
    // Guest user - load from localStorage
    const cartItems = localStorage.getItem('guestCartItems')
      ? JSON.parse(localStorage.getItem('guestCartItems'))
      : [];
    
    if (cartItems.length > 0) {
      dispatch({
        type: CART_ADD_ITEM,
        payload: cartItems,
        replace: true,
      });
    }
  }
};

// Handle user login - transfer guest cart to user cart
export const transferGuestCart = () => async (dispatch, getState) => {
  const guestCartItems = localStorage.getItem('guestCartItems')
    ? JSON.parse(localStorage.getItem('guestCartItems'))
    : [];
  
  if (guestCartItems.length > 0) {
    const { userLogin } = getState();
    
    if (userLogin.userInfo) {
      // Set the cart items in Redux
      dispatch({
        type: CART_ADD_ITEM,
        payload: guestCartItems,
        replace: true,
      });
      
      // Save to user-specific localStorage
      localStorage.setItem(getUserKey('cartItems'), JSON.stringify(guestCartItems));
      
      // Clear guest cart
      localStorage.removeItem('guestCartItems');
      
      // Sync with server
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userLogin.userInfo.token}`,
          },
        };
        
        await axios.post('/api/cart/sync', { cartItems: guestCartItems }, config);
      } catch (syncError) {
        console.error('Error syncing cart with server:', syncError);
      }
    }
  }
  
  // Transfer other guest data
  const guestShippingAddress = localStorage.getItem('guestShippingAddress')
    ? JSON.parse(localStorage.getItem('guestShippingAddress'))
    : null;
  
  if (guestShippingAddress) {
    dispatch({
      type: CART_SAVE_SHIPPING_ADDRESS,
      payload: guestShippingAddress,
    });
    
    localStorage.setItem(getUserKey('shippingAddress'), JSON.stringify(guestShippingAddress));
    localStorage.removeItem('guestShippingAddress');
  }
  
  const guestPaymentMethod = localStorage.getItem('guestPaymentMethod')
    ? JSON.parse(localStorage.getItem('guestPaymentMethod'))
    : null;
  
  if (guestPaymentMethod) {
    dispatch({
      type: CART_SAVE_PAYMENT_METHOD,
      payload: guestPaymentMethod,
    });
    
    localStorage.setItem(getUserKey('paymentMethod'), JSON.stringify(guestPaymentMethod));
    localStorage.removeItem('guestPaymentMethod');
  }
};
