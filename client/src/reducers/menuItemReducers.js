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
  MENU_ITEM_CREATE_RESET,
  MENU_ITEM_UPDATE_REQUEST,
  MENU_ITEM_UPDATE_SUCCESS,
  MENU_ITEM_UPDATE_FAIL,
  MENU_ITEM_UPDATE_RESET,
  MENU_ITEM_DELETE_REQUEST,
  MENU_ITEM_DELETE_SUCCESS,
  MENU_ITEM_DELETE_FAIL
} from '../constants/menuItemConstants';

export const menuItemListReducer = (state = { menuItems: [] }, action) => {
  switch (action.type) {
    case MENU_ITEM_LIST_REQUEST:
      return { loading: true, menuItems: [] };
    case MENU_ITEM_LIST_SUCCESS:
      return { loading: false, menuItems: action.payload };
    case MENU_ITEM_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const menuItemDetailsReducer = (state = { menuItem: { reviews: [] } }, action) => {
  switch (action.type) {
    case MENU_ITEM_DETAILS_REQUEST:
      return { loading: true, ...state };
    case MENU_ITEM_DETAILS_SUCCESS:
      return { loading: false, menuItem: action.payload };
    case MENU_ITEM_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const menuItemCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case MENU_ITEM_CREATE_REQUEST:
      return { loading: true };
    case MENU_ITEM_CREATE_SUCCESS:
      return { loading: false, success: true, menuItem: action.payload };
    case MENU_ITEM_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case MENU_ITEM_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const menuItemUpdateReducer = (state = { menuItem: {} }, action) => {
  switch (action.type) {
    case MENU_ITEM_UPDATE_REQUEST:
      return { loading: true };
    case MENU_ITEM_UPDATE_SUCCESS:
      return { loading: false, success: true, menuItem: action.payload };
    case MENU_ITEM_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case MENU_ITEM_UPDATE_RESET:
      return { menuItem: {} };
    default:
      return state;
  }
};

export const menuItemDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case MENU_ITEM_DELETE_REQUEST:
      return { loading: true };
    case MENU_ITEM_DELETE_SUCCESS:
      return { loading: false, success: true };
    case MENU_ITEM_DELETE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
