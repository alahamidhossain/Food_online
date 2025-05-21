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

// Initialize cart state with default values
const initialCartState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: '',
  coupon: null
};

export const cartReducer = (state = initialCartState, action) => {
  switch (action.type) {
    case CART_ADD_ITEM:
      // Check if this is a replace operation (for loading a user's cart)
      if (action.replace) {
        return {
          ...state,
          cartItems: Array.isArray(action.payload) ? action.payload : [action.payload]
        };
      }
      
      const item = action.payload;
      const existItem = state.cartItems.find(
        (x) => x.menuItem === item.menuItem
      );

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x.menuItem === existItem.menuItem ? item : x
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }
    
    case CART_UPDATE_ITEM_QUANTITY:
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.menuItem === action.payload.menuItem
            ? { ...item, qty: action.payload.qty }
            : item
        ),
      };
    
    case CART_REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.menuItem !== action.payload),
      };
    
    case CART_SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload,
      };
    
    case CART_SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload,
      };
    
    case CART_APPLY_COUPON:
      return {
        ...state,
        coupon: action.payload,
      };
    
    case CART_REMOVE_COUPON:
      return {
        ...state,
        coupon: null,
      };
    
    case CART_CLEAR_ITEMS:
      return {
        ...state,
        cartItems: [],
        shippingAddress: {},
        paymentMethod: '',
        coupon: null
      };
    
    default:
      return state;
  }
};
