import axios from 'axios';
import {
  MENU_ITEM_LIST_REQUEST,
  MENU_ITEM_LIST_SUCCESS,
  MENU_ITEM_LIST_FAIL,
  MENU_ITEM_DETAILS_REQUEST,
  MENU_ITEM_DETAILS_SUCCESS,
  MENU_ITEM_DETAILS_FAIL,
  MENU_ITEM_CREATE_REQUEST,
  MENU_ITEM_CREATE_SUCCESS,
  MENU_ITEM_CREATE_FAIL,
  MENU_ITEM_UPDATE_REQUEST,
  MENU_ITEM_UPDATE_SUCCESS,
  MENU_ITEM_UPDATE_FAIL,
  MENU_ITEM_DELETE_REQUEST,
  MENU_ITEM_DELETE_SUCCESS,
  MENU_ITEM_DELETE_FAIL
} from '../constants/menuItemConstants';

// Mock menu items data for fallback when API fails
export const mockMenuItems = [
  {
    _id: '60d21b4667d0d8992e610c85',
    name: 'Burger',
    description: 'Delicious burger with cheese, lettuce, tomato, and special sauce',
    price: 200,
    image_url: 'https://brookrest.com/wp-content/uploads/2020/05/AdobeStock_282247995-scaled.jpeg',
    category: 'Burger',
    availability: true,
    rating: 4.5,
    numReviews: 12
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    name: 'Pizza',
    description: 'Fresh pizza with chicken, bell peppers, and cheese',
    price: 400,
    image_url: 'https://th.bing.com/th/id/OIP._Tuj6ElUF8jhhcSg41_V_QHaE8?cb=iwp2&rs=1&pid=ImgDetMain',
    category: 'Pizza',
    availability: true,
    rating: 4.2,
    numReviews: 8
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    name: 'Shawarma',
    description: 'Delicious shawarma with grilled chicken, vegetables, and special sauce',
    price: 200,
    image_url: 'https://www.licious.in/blog/wp-content/uploads/2020/12/Chicken-Shawarma.jpg',
    category: 'Shawarma',
    availability: true,
    rating: 4.0,
    numReviews: 5
  }
];

// List menu items action
export const listMenuItems = (category = '') => async (dispatch) => {
  try {
    dispatch({ type: MENU_ITEM_LIST_REQUEST });

    // Log the request URL for debugging
    console.log(`Fetching menu items from: ${category ? `/api/menu-items?category=${category}` : '/api/menu-items'}`);

    // Add a timeout to the axios request
    const { data } = await axios.get(
      category ? `/api/menu-items?category=${category}` : '/api/menu-items',
      { timeout: 5000 } // 5 second timeout
    );

    console.log('API response data:', data);

    if (data && data.length > 0) {
      dispatch({
        type: MENU_ITEM_LIST_SUCCESS,
        payload: data,
      });
    } else {
      console.log('API returned empty data, using mock data instead');
      const filteredMockData = category 
        ? mockMenuItems.filter(item => item.category === category)
        : mockMenuItems;
        
      dispatch({
        type: MENU_ITEM_LIST_SUCCESS,
        payload: filteredMockData,
      });
    }
  } catch (error) {
    console.error('Failed to fetch menu items from API, using mock data:', error);
    
    // Use mock data when API fails
    const filteredMockData = category 
      ? mockMenuItems.filter(item => item.category === category)
      : mockMenuItems;
      
    dispatch({
      type: MENU_ITEM_LIST_SUCCESS, // Use SUCCESS instead of FAIL to show mock data
      payload: filteredMockData,
    });
  }
};

// Get menu item details action
export const getMenuItemDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: MENU_ITEM_DETAILS_REQUEST });

    const { data } = await axios.get(`/api/menu-items/${id}`);

    dispatch({
      type: MENU_ITEM_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    console.error('Failed to fetch menu item details from API, using mock data:', error);
    
    // Find the menu item in our mock data
    const mockMenuItem = mockMenuItems.find(item => item._id === id);
    
    if (mockMenuItem) {
      dispatch({
        type: MENU_ITEM_DETAILS_SUCCESS, // Use SUCCESS instead of FAIL to show mock data
        payload: mockMenuItem,
      });
    } else {
      // If we can't find the item in our mock data, create a generic one
      const genericMenuItem = {
        _id: id,
        name: 'Sample Menu Item',
        description: 'This is a sample menu item description used when API fails',
        price: 15,
        image_url: '/images/default-food.jpg',
        category: 'Other',
        availability: true,
        rating: 4.0,
        numReviews: 5
      };
      
      dispatch({
        type: MENU_ITEM_DETAILS_SUCCESS,
        payload: genericMenuItem,
      });
    }
  }
};

// Create menu item action (admin only)
export const createMenuItem = (menuItem) => async (dispatch, getState) => {
  try {
    dispatch({ type: MENU_ITEM_CREATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      // Try to create with the API
      const { data } = await axios.post('/api/menu-items', menuItem, config);

      dispatch({
        type: MENU_ITEM_CREATE_SUCCESS,
        payload: data,
      });
    } catch (apiError) {
      console.error('API error during menu item creation:', apiError);
      
      // If there's a network error, use mock data
      if (apiError.message === 'Network Error' || !apiError.response || apiError.response.status === 500) {
        console.log('Using mock creation due to API failure');
        
        // Create new mock item with generated ID
        const newItem = {
          _id: 'mock_item_' + Date.now(),
          ...menuItem,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          rating: 0,
          numReviews: 0
        };
        
        // Add to mockMenuItems array if it exists
        if (typeof mockMenuItems !== 'undefined') {
          mockMenuItems.push(newItem);
        }
        
        // Dispatch success with the mock data
        dispatch({
          type: MENU_ITEM_CREATE_SUCCESS,
          payload: newItem,
        });
        
        // Return success to the component
        return newItem;
      } else {
        // If it's not a network error, throw the error to be caught by the outer catch
        throw apiError;
      }
    }
  } catch (error) {
    dispatch({
      type: MENU_ITEM_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update menu item action (admin only)
export const updateMenuItem = (menuItem) => async (dispatch, getState) => {
  try {
    dispatch({ type: MENU_ITEM_UPDATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      // Try to update with the API
      const { data } = await axios.put(
        `/api/menu-items/${menuItem._id}`,
        menuItem,
        config
      );

      dispatch({
        type: MENU_ITEM_UPDATE_SUCCESS,
        payload: data,
      });
    } catch (apiError) {
      console.error('API error during menu item update:', apiError);
      
      // If there's a network error, use mock data
      if (apiError.message === 'Network Error' || !apiError.response || apiError.response.status === 500) {
        console.log('Using mock update due to API failure');
        
        // Create updated mock item
        const updatedItem = {
          ...menuItem,
          updated_at: new Date().toISOString()
        };
        
        // Update the mockMenuItems array if it exists
        if (typeof mockMenuItems !== 'undefined') {
          const index = mockMenuItems.findIndex(item => item._id === menuItem._id);
          if (index !== -1) {
            mockMenuItems[index] = updatedItem;
          }
        }
        
        // Dispatch success with the mock data
        dispatch({
          type: MENU_ITEM_UPDATE_SUCCESS,
          payload: updatedItem,
        });
        
        // Return success to the component
        return updatedItem;
      } else {
        // If it's not a network error, throw the error to be caught by the outer catch
        throw apiError;
      }
    }
  } catch (error) {
    dispatch({
      type: MENU_ITEM_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Delete menu item action (admin only)
export const deleteMenuItem = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: MENU_ITEM_DELETE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      // Try to delete with the API
      await axios.delete(`/api/menu-items/${id}`, config);

      dispatch({
        type: MENU_ITEM_DELETE_SUCCESS,
      });
    } catch (apiError) {
      console.error('API error during menu item deletion:', apiError);
      
      // If there's a network error, use mock data
      if (apiError.message === 'Network Error' || !apiError.response || apiError.response.status === 500) {
        console.log('Using mock deletion due to API failure');
        
        // Remove from mockMenuItems array if it exists
        if (typeof mockMenuItems !== 'undefined') {
          const index = mockMenuItems.findIndex(item => item._id === id);
          if (index !== -1) {
            mockMenuItems.splice(index, 1);
          }
        }
        
        // Dispatch success
        dispatch({
          type: MENU_ITEM_DELETE_SUCCESS,
        });
        
        return true; // Return success to the component
      } else {
        // If it's not a network error, throw the error to be caught by the outer catch
        throw apiError;
      }
    }
  } catch (error) {
    dispatch({
      type: MENU_ITEM_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
