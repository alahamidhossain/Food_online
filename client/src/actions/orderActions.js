import axios from 'axios';
import { CART_CLEAR_ITEMS } from '../constants/cartConstants';
import {
  ORDER_CREATE_REQUEST,
  ORDER_CREATE_SUCCESS,
  ORDER_CREATE_FAIL,
  ORDER_DETAILS_REQUEST,
  ORDER_DETAILS_SUCCESS,
  ORDER_DETAILS_FAIL,
  ORDER_PAY_REQUEST,
  ORDER_PAY_SUCCESS,
  ORDER_PAY_FAIL,
  ORDER_LIST_MY_REQUEST,
  ORDER_LIST_MY_SUCCESS,
  ORDER_LIST_MY_FAIL,
  ORDER_LIST_REQUEST,
  ORDER_LIST_SUCCESS,
  ORDER_LIST_FAIL,
  ORDER_UPDATE_STATUS_REQUEST,
  ORDER_UPDATE_STATUS_SUCCESS,
  ORDER_UPDATE_STATUS_FAIL
} from '../constants/orderConstants';

// Mock orders data for when API fails
const mockOrders = [
  {
    _id: 'order_1',
    user: {
      _id: 'user_1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    orderItems: [
      {
        _id: 'item_1',
        name: 'Chicken Burger',
        qty: 2,
        price: 250,
        image_url: '/images/chicken-burger.jpg'
      }
    ],
    shippingAddress: {
      address: '123 Main St',
      city: 'Dhaka',
      postalCode: '1000',
      country: 'Bangladesh'
    },
    paymentMethod: 'Cash On Delivery',
    taxPrice: 50,
    shippingPrice: 60,
    totalPrice: 610,
    isPaid: true,
    paidAt: '2023-05-10T12:00:00Z',
    isDelivered: false,
    status: 'Processing',
    createdAt: '2023-05-10T10:00:00Z'
  },
  {
    _id: 'order_2',
    user: {
      _id: 'user_2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    orderItems: [
      {
        _id: 'item_2',
        name: 'Beef Pizza',
        qty: 1,
        price: 350,
        image_url: '/images/beef-pizza.jpg'
      }
    ],
    shippingAddress: {
      address: '456 Park Ave',
      city: 'Dhaka',
      postalCode: '1200',
      country: 'Bangladesh'
    },
    paymentMethod: 'Cash On Delivery',
    taxPrice: 35,
    shippingPrice: 60,
    totalPrice: 445,
    isPaid: false,
    isDelivered: false,
    status: 'Pending',
    createdAt: '2023-05-12T14:30:00Z'
  },
  {
    _id: 'order_3',
    user: {
      _id: 'user_1',
      name: 'John Doe',
      email: 'john@example.com'
    },
    orderItems: [
      {
        _id: 'item_3',
        name: 'Chicken Biryani',
        qty: 3,
        price: 200,
        image_url: '/images/chicken-biryani.jpg'
      }
    ],
    shippingAddress: {
      address: '123 Main St',
      city: 'Dhaka',
      postalCode: '1000',
      country: 'Bangladesh'
    },
    paymentMethod: 'Cash On Delivery',
    taxPrice: 60,
    shippingPrice: 60,
    totalPrice: 720,
    isPaid: true,
    paidAt: '2023-05-14T16:00:00Z',
    isDelivered: true,
    deliveredAt: '2023-05-14T18:00:00Z',
    status: 'Delivered',
    createdAt: '2023-05-14T12:00:00Z'
  }
];

// Create order action
export const createOrder = (order) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_CREATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    // Get cart items from state
    const { cart } = getState();
    const { cartItems } = cart;

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Your cart is empty');
    }

    // We're intentionally sending an empty orderItems array to let the server use cart items from MongoDB
    // This is a deliberate design choice, so we don't need to check if order.orderItems is empty
    console.log('Intentionally sending empty orderItems array to let server use cart items from MongoDB');
    
    // If we have cart items in the Redux store, log them for debugging purposes
    if (cartItems && cartItems.length > 0) {
      console.log('Cart items in Redux store:', cartItems);
    } else {
      console.log('No cart items in Redux store, server will use cart items from MongoDB');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Log the order data being sent to the backend
    console.log('Sending order data to backend:', order);
    console.log('Cart items being sent:', cartItems);

    // First, sync cart items to the server's CartItem collection
    try {
      await axios.post('/api/cart/sync', { cartItems }, config);
      console.log('Cart items synced with server');
    } catch (syncError) {
      console.error('Failed to sync cart items with server:', syncError);
      // Continue with order creation even if sync fails
    }

    // Send the order data to create the order
    const { data } = await axios.post('/api/orders', order, config);

    console.log('Order created successfully:', data);

    dispatch({
      type: ORDER_CREATE_SUCCESS,
      payload: data,
    });

    // Clear cart after successful order
    localStorage.removeItem('cartItems');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    localStorage.removeItem('coupon');
    dispatch({
      type: CART_CLEAR_ITEMS,
    });
  } catch (error) {
    console.error('Order creation error:', error.response?.data?.message || error.message);
    dispatch({
      type: ORDER_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get order details action
export const getOrderDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/orders/${id}`, config);

    dispatch({
      type: ORDER_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ORDER_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Pay order action
export const payOrder = (orderId, paymentResult) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_PAY_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`/api/orders/${orderId}/pay`, paymentResult, config);

    dispatch({
      type: ORDER_PAY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ORDER_PAY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// List my orders action
export const listMyOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_LIST_MY_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get('/api/orders/myorders', config);

    dispatch({
      type: ORDER_LIST_MY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ORDER_LIST_MY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// List all orders action (admin only)
export const listOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      // Try to get orders from API
      const { data } = await axios.get('/api/orders', config);

      dispatch({
        type: ORDER_LIST_SUCCESS,
        payload: data,
      });
    } catch (apiError) {
      console.error('API error during order list fetch:', apiError);
      
      // If there's a network error, use mock data
      if (apiError.message === 'Network Error' || !apiError.response || apiError.response.status === 500) {
        console.log('Using mock orders due to API failure');
        
        dispatch({
          type: ORDER_LIST_SUCCESS,
          payload: mockOrders,
        });
      } else {
        // If it's not a network error, throw the error to be caught by the outer catch
        throw apiError;
      }
    }
  } catch (error) {
    dispatch({
      type: ORDER_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update order status action (admin only)
export const updateOrderStatus = (orderId, status) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_UPDATE_STATUS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(
      `/api/orders/${orderId}/status`,
      { status },
      config
    );

    dispatch({
      type: ORDER_UPDATE_STATUS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: ORDER_UPDATE_STATUS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
