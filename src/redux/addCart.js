/* src/redux/addCart.js */
import axios from '../axiosConfig';

// Action types
export const CART_ACTIONS = {
  // Cart management
  ADD_TO_CART: 'cart/addToCart',
  REMOVE_FROM_CART: 'cart/removeFromCart',
  UPDATE_QUANTITY: 'cart/updateQuantity',
  CLEAR_CART: 'cart/clearCart',
  SET_CART: 'cart/setCart',
  
  // Cart loading states
  LOADING: 'cart/loading',
  ERROR: 'cart/error',
  RESET_ERROR: 'cart/resetError',
  
  // Login status
  SET_LOGIN_STATUS: 'cart/setLoginStatus',
  
  // Sync with server
  SYNC_CART: 'cart/syncCart'
};

// Initial state
const initialState = {
  cartItems: {},
  cartId: [],
  cartCount: 0,
  loading: false,
  error: null,
  isLoggedIn: !!localStorage.getItem('accessToken'),
  lastUpdated: Date.now()
};

// Helper function to calculate cart count
const calculateCartCount = (items) => {
  // Đếm số loại sản phẩm (số key), không phải tổng số lượng
  return Object.keys(items).length;
};

// Helper function to save cart to localStorage
const saveCartToLocalStorage = (cartItems) => {
  try {
    const cartId = Object.keys(cartItems);
    const cartCount = calculateCartCount(cartItems);
    const cartData = { cartItems, cartId, cartCount };
    localStorage.setItem('cartData', JSON.stringify(cartData));
    return cartData;
  } catch (err) {
    console.error('Error saving cart to localStorage:', err);
    return null;
  }
};

// Helper function to get cart from localStorage
const getCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem('cartData');
    if (!cartData) return null;
    
    const parsed = JSON.parse(cartData);
    if (!parsed || typeof parsed !== 'object' || !parsed.cartItems) {
      return null;
    }
    
    // Đảm bảo cartCount được tính lại từ cartItems
    const cartItems = parsed.cartItems || {};
    const cartId = Object.keys(cartItems);
    const cartCount = calculateCartCount(cartItems);
    
    return { cartItems, cartId, cartCount };
  } catch (err) {
    console.error('Error reading cart from localStorage:', err);
    localStorage.removeItem('cartData');
    return null;
  }
};

// Helper function to get authorization header with current token
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.log('Không tìm thấy token trong localStorage');
    return {};
  }
  console.log('Sử dụng token:', token.slice(0, 10) + '...');
  return { Authorization: `Bearer ${token}` };
};

// Reducer
export default function cartReducer(state = initialState, action) {
  switch (action.type) {
    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        cartItems: action.payload.cartItems,
        cartId: action.payload.cartId,
        cartCount: action.payload.cartCount,
        lastUpdated: Date.now()
      };
      
    case CART_ACTIONS.LOADING:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case CART_ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case CART_ACTIONS.RESET_ERROR:
      return {
        ...state,
        error: null
      };
      
    case CART_ACTIONS.SET_LOGIN_STATUS:
      return {
        ...state,
        isLoggedIn: action.payload
      };
      
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        cartItems: {},
        cartId: [],
        cartCount: 0,
        lastUpdated: Date.now()
      };
      
    default:
      return state;
  }
}

// Action creators
export const setCart = (cartData) => ({
  type: CART_ACTIONS.SET_CART,
  payload: cartData
});

export const setLoading = (status = true) => ({
  type: CART_ACTIONS.LOADING,
  payload: status
});

export const setError = (error) => ({
  type: CART_ACTIONS.ERROR,
  payload: error
});

export const resetError = () => ({
  type: CART_ACTIONS.RESET_ERROR
});

export const setLoginStatus = (isLoggedIn) => ({
  type: CART_ACTIONS.SET_LOGIN_STATUS,
  payload: isLoggedIn
});

export const clearCart = () => ({
  type: CART_ACTIONS.CLEAR_CART
});

// Thunk: Khởi tạo giỏ hàng
export const initCart = () => async (dispatch) => {
  try {
    const token = localStorage.getItem('accessToken');
    const isLoggedIn = !!token;
    
    dispatch(setLoginStatus(isLoggedIn));
    
    if (isLoggedIn) {
      // Nếu đã đăng nhập, lấy giỏ hàng từ server
      dispatch(fetchCartFromServer());
    } else {
      // Nếu chưa đăng nhập, lấy giỏ hàng từ localStorage
      const localCart = getCartFromLocalStorage();
      if (localCart) {
        dispatch(setCart(localCart));
      }
    }
  } catch (err) {
    console.error('Error initializing cart:', err);
    dispatch(setError('Không thể khởi tạo giỏ hàng'));
  }
};

// Thunk: Lấy giỏ hàng từ server
export const fetchCartFromServer = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const headers = getAuthHeader();
    const response = await axios.get('http://localhost:5000/api/cart', { headers });
    
    if (response.data && Array.isArray(response.data)) {
      const cartItems = {};
      const cartId = [];
      
      response.data.forEach(item => {
        cartItems[item.product_id] = item.quantity;
        cartId.push(item.product_id);
      });
      
      const cartCount = calculateCartCount(cartItems);
      
      dispatch(setCart({ cartItems, cartId, cartCount }));
      
      // Lưu trữ vào localStorage để đồng bộ
      saveCartToLocalStorage(cartItems);
    }
    dispatch(setLoading(false));
  } catch (err) {
    // Kiểm tra lỗi 401/403
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      console.error('Token không hợp lệ hoặc hết hạn');
      dispatch(setLoginStatus(false));
      localStorage.removeItem('accessToken');
    }
    console.error('Error fetching cart from server:', err);
    dispatch(setError('Không thể lấy thông tin giỏ hàng từ server'));
    dispatch(setLoading(false));
  }
};

// Thunk: Thêm sản phẩm vào giỏ hàng
export const addToCart = (productId, quantity = 1) => async (dispatch, getState) => {
  // Đảm bảo productId luôn là string để đồng nhất
  productId = String(productId);
  dispatch(resetError());
  dispatch(setLoading(true));
  
  try {
    const { isLoggedIn, cartItems, cartId } = getState().cart;
    
    // Tạo bản sao cartItems để không ảnh hưởng đến state hiện tại
    const updatedCartItems = { ...cartItems };
    
    // Cập nhật số lượng sản phẩm
    if (updatedCartItems[productId]) {
      updatedCartItems[productId] += quantity;
    } else {
      updatedCartItems[productId] = quantity;
    }
    
    // Cập nhật cartId nếu sản phẩm chưa có trong giỏ hàng
    const updatedCartId = cartId.includes(productId) 
      ? [...cartId] 
      : [...cartId, productId];
    
    const cartCount = calculateCartCount(updatedCartItems);
    
    if (isLoggedIn) {
      try {
        // Đã đăng nhập: Lưu vào database
        const headers = getAuthHeader();
        await axios.post('http://localhost:5000/api/cart', {
          productId: parseInt(productId), 
          quantity 
        }, { headers });
        
        // Fetch lại giỏ hàng từ server để đảm bảo dữ liệu đồng bộ
        await dispatch(fetchCartFromServer());
      } catch (err) {
        console.error('Lỗi khi thêm vào giỏ hàng trong database:', err);
        
        // Nếu lỗi 401, có thể token đã hết hạn
        if (err.response && err.response.status === 401) {
          // Cập nhật trạng thái đăng nhập
          dispatch(setLoginStatus(false));
          localStorage.removeItem('accessToken');
          
          // Vẫn lưu vào localStorage để không mất dữ liệu
          const cartData = { cartItems: updatedCartItems, cartId: updatedCartId, cartCount };
          saveCartToLocalStorage(updatedCartItems);
          dispatch(setCart(cartData));
        } else {
          // Các lỗi khác ném lên để xử lý ở catch bên ngoài
          throw err;
        }
      }
    } else {
      // Chưa đăng nhập: Lưu vào localStorage
      const cartData = { cartItems: updatedCartItems, cartId: updatedCartId, cartCount };
      saveCartToLocalStorage(updatedCartItems);
      dispatch(setCart(cartData));
    }
    
    dispatch(setLoading(false));
  } catch (err) {
    console.error('Error adding to cart:', err);
    dispatch(setError('Không thể thêm sản phẩm vào giỏ hàng'));
    dispatch(setLoading(false));
  }
};

// Thunk: Cập nhật số lượng sản phẩm
export const updateQuantity = (productId, quantity) => async (dispatch, getState) => {
  // Đảm bảo productId luôn là string để đồng nhất
  productId = String(productId);
  
  if (quantity <= 0) {
    console.log(`Số lượng <= 0, chuyển sang xóa sản phẩm ${productId}`);
    return dispatch(removeFromCart(productId));
  }
  
  dispatch(resetError());
  dispatch(setLoading(true));
  
  try {
    const { isLoggedIn, cartItems, cartId } = getState().cart;
    
    // Cập nhật UI ngay lập tức
    const updatedCartItems = { ...cartItems, [productId]: quantity };
    const cartCount = calculateCartCount(updatedCartItems);
    
    dispatch(setCart({
      cartItems: updatedCartItems,
      cartId,
      cartCount
    }));
    
    // Lưu vào localStorage
    saveCartToLocalStorage(updatedCartItems);
    
    if (isLoggedIn) {
      try {
        // Sử dụng allowDuplicate để đảm bảo request này không bị hủy
        const cartResponse = await axios.get('http://localhost:5000/api/cart', { 
          allowDuplicate: true,
          headers: getAuthHeader() 
        });
        
        if (cartResponse.data && Array.isArray(cartResponse.data)) {
          const cartItem = cartResponse.data.find(item => String(item.product_id) === productId);
          
          if (cartItem) {
            await axios.put(`http://localhost:5000/api/cart/${cartItem.id}`, { quantity }, {
              allowDuplicate: true,
              headers: getAuthHeader()
            });
          } else {
            await axios.post('http://localhost:5000/api/cart', {
              productId: parseInt(productId),
              quantity
            }, {
              allowDuplicate: true,
              headers: getAuthHeader()
            });
          }
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Lỗi khi cập nhật số lượng trong database:', err);
          
          if (err.response && err.response.status === 401) {
            dispatch(setLoginStatus(false));
            localStorage.removeItem('accessToken');
          }
        }
      }
    }
    
    dispatch(setLoading(false));
  } catch (err) {
    console.error('Error updating quantity:', err);
    dispatch(setError('Không thể cập nhật số lượng sản phẩm'));
    dispatch(setLoading(false));
  }
};


// Thunk: Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = (productId) => async (dispatch, getState) => {
  // Đảm bảo productId luôn là string để đồng nhất
  productId = String(productId);
  
  dispatch(resetError());
  dispatch(setLoading(true));
  
  try {
    const { isLoggedIn, cartItems, cartId } = getState().cart;
    
    console.log(`Bắt đầu xóa sản phẩm ${productId} khỏi giỏ hàng`);
    console.log(`Trạng thái trước khi xóa: ${JSON.stringify({cartId, itemCount: Object.keys(cartItems).length})}`);
    
    // Cập nhật UI ngay lập tức
    const updatedCartItems = { ...cartItems };
    delete updatedCartItems[productId];
    
    const updatedCartId = cartId.filter(id => id !== productId);
    const cartCount = calculateCartCount(updatedCartItems);
    
    console.log(`Trạng thái sau khi xóa: ${JSON.stringify({updatedCartId, updatedItemCount: Object.keys(updatedCartItems).length})}`);
    
    // Lưu vào localStorage để đảm bảo UI được cập nhật ngay
    saveCartToLocalStorage(updatedCartItems);
    
    // Cập nhật state trong Redux
    dispatch(setCart({ 
      cartItems: updatedCartItems, 
      cartId: updatedCartId, 
      cartCount 
    }));
    
    if (isLoggedIn) {
      try {
        // Đã đăng nhập: Xóa sản phẩm từ database
        const headers = getAuthHeader();
        
        // Trước tiên lấy thông tin giỏ hàng hiện tại để biết cart item ID
        const cartResponse = await axios.get('http://localhost:5000/api/cart', { 
          headers, 
          allowDuplicate: true  // Thêm allowDuplicate để tránh bị cancel request
        });
        
        if (cartResponse.data && Array.isArray(cartResponse.data)) {
          // Tìm cart item có product_id tương ứng
          const cartItem = cartResponse.data.find(item => String(item.product_id) === productId);
          
          if (cartItem) {
            console.log(`Tìm thấy item trong giỏ hàng: ${cartItem.id}, xóa khỏi database`);
            // Gọi API với cart item ID thay vì product ID
            await axios.delete(`http://localhost:5000/api/cart/${cartItem.id}`, { 
              headers,
              allowDuplicate: true  // Thêm allowDuplicate để tránh bị cancel request
            });
            console.log(`Đã xóa sản phẩm ${productId} khỏi database thành công`);
          } else {
            console.log(`Sản phẩm ID ${productId} không tìm thấy trên server, đã xóa khỏi localStorage`);
          }
        }
      } catch (err) {
        console.error('Lỗi khi xóa sản phẩm khỏi database:', err);
        
        // Nếu lỗi 401, có thể token đã hết hạn
        if (err.response && err.response.status === 401) {
          // Cập nhật trạng thái đăng nhập
          dispatch(setLoginStatus(false));
          localStorage.removeItem('accessToken');
        } else {
          // Hiển thị thông báo nhưng không khôi phục state vì đã cập nhật UI
          console.warn('Không thể xóa sản phẩm khỏi server, nhưng đã xóa khỏi localStorage');
        }
      }
    }
    
    // Thông báo xóa thành công
    console.log(`Đã xóa sản phẩm ${productId} khỏi giỏ hàng thành công`);
    
    // Cập nhật lại cart vào localStorage một lần nữa để đảm bảo
    const currentState = getState().cart;
    if (currentState.cartItems[productId]) {
      console.warn(`Sản phẩm ${productId} vẫn còn trong state sau khi xóa, thử xóa lại`);
      const fixedCartItems = { ...currentState.cartItems };
      delete fixedCartItems[productId];
      const fixedCartId = currentState.cartId.filter(id => id !== productId);
      const fixedCartCount = calculateCartCount(fixedCartItems);
      
      // Cập nhật lại state
      dispatch(setCart({
        cartItems: fixedCartItems,
        cartId: fixedCartId,
        cartCount: fixedCartCount
      }));
      
      // Lưu lại vào localStorage
      saveCartToLocalStorage(fixedCartItems);
    }
    
    dispatch(setLoading(false));
  } catch (err) {
    console.error('Error removing from cart:', err);
    dispatch(setError('Không thể xóa sản phẩm khỏi giỏ hàng'));
    dispatch(setLoading(false));
  }
};

// Thunk: Đồng bộ giỏ hàng sau khi đăng nhập
export const syncCartAfterLogin = () => async (dispatch, getState) => {
  dispatch(resetError());
  dispatch(setLoading(true));
  
  try {
    console.log('Bắt đầu đồng bộ giỏ hàng sau khi đăng nhập');
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('Không tìm thấy accessToken trong localStorage');
      dispatch(setError('Không thể đồng bộ giỏ hàng: Thiếu token xác thực'));
      dispatch(setLoading(false));
      return;
    }
    
    // Lấy giỏ hàng từ localStorage
    const localCart = getCartFromLocalStorage();
    console.log('Dữ liệu giỏ hàng từ localStorage:', localCart);
    
    if (localCart && localCart.cartItems && Object.keys(localCart.cartItems).length > 0) {
      console.log('Đồng bộ', Object.keys(localCart.cartItems).length, 'sản phẩm lên server');
      
      const headers = getAuthHeader();
      
      // Có sản phẩm trong localStorage, đồng bộ lên server
      for (const [productId, quantity] of Object.entries(localCart.cartItems)) {
        try {
          console.log(`Thêm sản phẩm ID: ${productId}, Số lượng: ${quantity}`);
          await axios.post('http://localhost:5000/api/cart', { 
            productId: parseInt(productId), 
            quantity: parseInt(quantity) 
          }, { headers });
        } catch (error) {
          console.error(`Lỗi khi đồng bộ sản phẩm ${productId}:`, error);
          // Tiếp tục với sản phẩm tiếp theo nếu có lỗi
        }
      }
    } else {
      console.log('Không có sản phẩm cần đồng bộ từ localStorage');
    }
    
    // Sau khi đồng bộ, lấy giỏ hàng từ server
    await dispatch(fetchCartFromServer());
    
    // Cập nhật trạng thái đăng nhập
    dispatch(setLoginStatus(true));
    dispatch(setLoading(false));
    console.log('Đồng bộ hoàn tất');
  } catch (err) {
    console.error('Error syncing cart after login:', err);
    dispatch(setError('Không thể đồng bộ giỏ hàng sau khi đăng nhập'));
    dispatch(setLoading(false));
  }
};
