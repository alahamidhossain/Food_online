import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Reducers
import { 
  userLoginReducer, 
  userRegisterReducer, 
  userDetailsReducer, 
  userUpdateProfileReducer,
  userListReducer,
  userDeleteReducer,
  userUpdateReducer
} from './reducers/userReducers';
import { 
  menuItemListReducer, 
  menuItemDetailsReducer,
  menuItemCreateReducer,
  menuItemUpdateReducer,
  menuItemDeleteReducer
} from './reducers/menuItemReducers';
import { 
  cartReducer 
} from './reducers/cartReducers';
import { 
  orderCreateReducer, 
  orderDetailsReducer, 
  orderPayReducer, 
  orderListMyReducer,
  orderListReducer,
  orderUpdateStatusReducer
} from './reducers/orderReducers';
import {
  couponListReducer,
  couponCreateReducer,
  couponUpdateReducer,
  couponDeleteReducer
} from './reducers/couponReducers';

const reducer = combineReducers({
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,
  userList: userListReducer,
  userDelete: userDeleteReducer,
  userUpdate: userUpdateReducer,
  menuItemList: menuItemListReducer,
  menuItemDetails: menuItemDetailsReducer,
  menuItemCreate: menuItemCreateReducer,
  menuItemUpdate: menuItemUpdateReducer,
  menuItemDelete: menuItemDeleteReducer,
  cart: cartReducer,
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  orderPay: orderPayReducer,
  orderListMy: orderListMyReducer,
  orderList: orderListReducer,
  orderUpdateStatus: orderUpdateStatusReducer,
  couponList: couponListReducer,
  couponCreate: couponCreateReducer,
  couponUpdate: couponUpdateReducer,
  couponDelete: couponDeleteReducer
});

// Get user info from localStorage
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// Helper function to get user-specific localStorage keys
const getUserKey = (key) => {
  if (userInfoFromStorage && userInfoFromStorage._id) {
    return `${key}_${userInfoFromStorage._id}`;
  }
  return `guest${key}`;
};

// Get cart items from localStorage (user-specific)
const cartItemsFromStorage = userInfoFromStorage
  ? localStorage.getItem(getUserKey('cartItems'))
    ? JSON.parse(localStorage.getItem(getUserKey('cartItems')))
    : []
  : localStorage.getItem('guestCartItems')
    ? JSON.parse(localStorage.getItem('guestCartItems'))
    : [];

// Get shipping address from localStorage (user-specific)
const shippingAddressFromStorage = userInfoFromStorage
  ? localStorage.getItem(getUserKey('shippingAddress'))
    ? JSON.parse(localStorage.getItem(getUserKey('shippingAddress')))
    : {}
  : localStorage.getItem('guestShippingAddress')
    ? JSON.parse(localStorage.getItem('guestShippingAddress'))
    : {};

// Get payment method from localStorage (user-specific)
const paymentMethodFromStorage = userInfoFromStorage
  ? localStorage.getItem(getUserKey('paymentMethod'))
    ? JSON.parse(localStorage.getItem(getUserKey('paymentMethod')))
    : ''
  : localStorage.getItem('guestPaymentMethod')
    ? JSON.parse(localStorage.getItem('guestPaymentMethod'))
    : '';

// Get coupon from localStorage (user-specific)
const couponFromStorage = userInfoFromStorage
  ? localStorage.getItem(getUserKey('coupon'))
    ? JSON.parse(localStorage.getItem(getUserKey('coupon')))
    : null
  : localStorage.getItem('guestCoupon')
    ? JSON.parse(localStorage.getItem('guestCoupon'))
    : null;

// Log initial cart state for debugging
console.log('User info from storage:', userInfoFromStorage);
console.log('Cart items from storage:', cartItemsFromStorage);
console.log('Shipping address from storage:', shippingAddressFromStorage);
console.log('Payment method from storage:', paymentMethodFromStorage);

const initialState = {
  cart: { 
    cartItems: cartItemsFromStorage,
    shippingAddress: shippingAddressFromStorage,
    paymentMethod: paymentMethodFromStorage,
    coupon: couponFromStorage
  },
  userLogin: { userInfo: userInfoFromStorage },
};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
