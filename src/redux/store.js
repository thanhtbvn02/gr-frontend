// import { createStore, combineReducers, applyMiddleware } from 'redux';
// import { thunk } from 'redux-thunk';
// import { CART_ACTIONS } from './addCart';

// // Hàm lấy giỏ hàng từ localStorage
// const getCartFromLocalStorage = () => {
//   try {
//     const cartState = localStorage.getItem('cartState');
//     // Kiểm tra kỹ lưỡng giá trị trước khi parse
//     if (cartState && cartState !== 'undefined' && cartState !== 'null' && cartState.trim() !== '') {
//       const parsedCart = JSON.parse(cartState);
//       // Kiểm tra cấu trúc dữ liệu để đảm bảo hợp lệ
//       if (parsedCart && typeof parsedCart === 'object' && 
//           Array.isArray(parsedCart.cartId) && 
//           typeof parsedCart.cartItems === 'object') {
//         return parsedCart;
//       } else {
//         console.warn('Cấu trúc giỏ hàng không hợp lệ, đặt lại giỏ hàng');
//         localStorage.removeItem('cartState');
//       }
//     }
//   } catch (error) {
//     console.error('Lỗi khi đọc giỏ hàng từ localStorage:', error);
//     // Xóa localStorage nếu có lỗi để tránh lỗi tiếp tục xảy ra
//     localStorage.removeItem('cartState');
//   }
//   return null;
// };

// // Trạng thái khởi tạo cho giỏ hàng
// const initialCartState = {
//   cartCount: 0,
//   cartId: [],
//   cartItems: {},
//   isLoggedIn: !!localStorage.getItem('accessToken'),
//   loading: false,
//   error: null,
//   lastFetch: 0,
//   isSyncing: false
// };

// // Lấy state từ localStorage hoặc dùng initialState
// const cachedState = getCartFromLocalStorage();
// const baseCartState = cachedState ? 
//   { ...initialCartState, ...cachedState, isLoggedIn: !!localStorage.getItem('accessToken') } 
//   : initialCartState;

// // Reducer giỏ hàng
// const cartReducer = (state = baseCartState, action) => {
//   switch (action.type) {
//     // Actions từ addCart.js
//     case CART_ACTIONS.SET_CART_ITEMS:
//     case 'cart/setCartItems':
//       return {
//         ...state,
//         cartId: action.payload.cartId,
//         cartItems: action.payload.cartItems,
//         cartCount: action.payload.cartCount
//       };
    
//     case 'cart/addToCart/pending':
//     case 'cart/decreaseQuantity/pending':
//     case 'cart/removeItem/pending':
//     case 'cart/fetchCart/pending':
//     case 'cart/setLoading':
//       return {
//         ...state,
//         loading: action.payload !== undefined ? action.payload : true
//       };
    
//     case 'cart/addToCart/fulfilled':
//     case 'cart/decreaseQuantity/fulfilled':
//     case 'cart/removeItem/fulfilled':
//     case 'cart/fetchCart/fulfilled': 
//       return {
//         ...state,
//         loading: false
//       };
    
//     case 'cart/addToCart/rejected':
//     case 'cart/decreaseQuantity/rejected': 
//     case 'cart/removeItem/rejected':
//     case 'cart/fetchCart/rejected':
//     case 'cart/setError':
//       return {
//         ...state,
//         loading: false,
//         error: action.payload
//       };
    
//     case 'cart/resetError':
//       return {
//         ...state,
//         error: null
//       };
    
//     case CART_ACTIONS.SET_LOGIN_STATUS:
//       return {
//         ...state,
//         isLoggedIn: action.payload
//       };
    
//     case CART_ACTIONS.CLEAR_CART:
//       return {
//         ...state,
//         cartCount: 0,
//         cartId: [],
//         cartItems: {},
//         lastFetch: 0
//       };
    
//     case 'cart/updateLastFetch':
//       return {
//         ...state,
//         lastFetch: action.payload
//       };
    
//     case 'cart/resetLastFetch':
//       return {
//         ...state,
//         lastFetch: 0
//       };
    
//     case 'cart/syncWithServer/pending':
//     case 'cart/setSyncing':
//       return {
//         ...state,
//         isSyncing: action.payload !== undefined ? action.payload : true
//       };
    
//     case 'cart/syncWithServer/fulfilled':
//     case 'cart/syncWithServer/rejected':
//       return {
//         ...state,
//         isSyncing: false
//       };
    
//     default:
//       return state;
//   }
// };

// // Kết hợp các reducers 
// const rootReducer = combineReducers({
//   cart: cartReducer,
//   // Thêm các reducers khác ở đây nếu cần
// });

// // Tạo store
// const store = createStore(
//   rootReducer,
//   applyMiddleware(thunk)
// );

// export default store; 
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { thunk } from 'redux-thunk';
import cartReducer from './addCart';

const rootReducer = combineReducers({
  cart: cartReducer
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;