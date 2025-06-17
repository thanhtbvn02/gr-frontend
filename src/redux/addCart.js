import axiosInstance from "../utils/axiosConfig";

export const CART_ACTIONS = {
  ADD_TO_CART: "cart/addToCart",
  REMOVE_FROM_CART: "cart/removeFromCart",
  UPDATE_QUANTITY: "cart/updateQuantity",
  CLEAR_CART: "cart/clearCart",
  SET_CART: "cart/setCart",
  SET_SELECTED_ITEMS: "cart/setSelectedItems",

  LOADING: "cart/loading",
  ERROR: "cart/error",
  RESET_ERROR: "cart/resetError",

  SET_LOGIN_STATUS: "cart/setLoginStatus",

  SYNC_CART: "cart/syncCart",
};

const initialState = {
  cartItems: {},
  cartId: [],
  cartCount: 0,
  loading: false,
  error: null,
  isLoggedIn: !!localStorage.getItem("accessToken"),
  selectedItems: [],
  lastUpdated: Date.now(),
};

const calculateCartCount = (items) => {
  return Object.values(items).reduce((total, quantity) => total + quantity, 0);
};

const saveCartToLocalStorage = (cartItems) => {
  try {
    const cartId = Object.keys(cartItems);
    const cartCount = calculateCartCount(cartItems);
    const cartData = { cartItems, cartId, cartCount };
    localStorage.setItem("cartData", JSON.stringify(cartData));
    return cartData;
  } catch (err) {
    console.error("Error saving cart to localStorage:", err);
    return null;
  }
};

const getCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem("cartData");
    if (!cartData) return null;

    const parsed = JSON.parse(cartData);
    if (!parsed || typeof parsed !== "object" || !parsed.cartItems) {
      return null;
    }

    const cartItems = parsed.cartItems || {};
    const cartId = Object.keys(cartItems);
    const cartCount = calculateCartCount(cartItems);

    return { cartItems, cartId, cartCount };
  } catch (err) {
    console.error("Error reading cart from localStorage:", err);
    localStorage.removeItem("cartData");
    return null;
  }
};

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.log("Không tìm thấy token trong localStorage");
    return {};
  }
  console.log("Sử dụng token:", token.slice(0, 10) + "...");
  return { Authorization: `Bearer ${token}` };
};

export default function cartReducer(state = initialState, action) {
  switch (action.type) {
    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        cartItems: action.payload.cartItems,
        cartId: action.payload.cartId,
        cartCount: action.payload.cartCount,
        lastUpdated: Date.now(),
      };

    case CART_ACTIONS.SET_SELECTED_ITEMS:
      return {
        ...state,
        selectedItems: action.payload,
      };

    case CART_ACTIONS.LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CART_ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CART_ACTIONS.RESET_ERROR:
      return {
        ...state,
        error: null,
      };

    case CART_ACTIONS.SET_LOGIN_STATUS:
      return {
        ...state,
        isLoggedIn: action.payload,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        cartItems: {},
        cartId: [],
        cartCount: 0,
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
}

export const setCart = (cartData) => ({
  type: CART_ACTIONS.SET_CART,
  payload: cartData,
});

export const setLoading = (status = true) => ({
  type: CART_ACTIONS.LOADING,
  payload: status,
});

export const setError = (error) => ({
  type: CART_ACTIONS.ERROR,
  payload: error,
});

export const resetError = () => ({
  type: CART_ACTIONS.RESET_ERROR,
});

export const setLoginStatus = (isLoggedIn) => ({
  type: CART_ACTIONS.SET_LOGIN_STATUS,
  payload: isLoggedIn,
});

export const clearCart = () => ({
  type: CART_ACTIONS.CLEAR_CART,
});

export const setSelectedItems = (selectedIds) => ({
  type: CART_ACTIONS.SET_SELECTED_ITEMS,
  payload: selectedIds,
});

export const initCart = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("accessToken");
    const isLoggedIn = !!token;

    dispatch(setLoginStatus(isLoggedIn));

    if (isLoggedIn) {
      dispatch(fetchCartFromServer());
    } else {
      const localCart = getCartFromLocalStorage();
      if (localCart) {
        dispatch(setCart(localCart));
      }
    }
  } catch (err) {
    console.error("Error initializing cart:", err);
    dispatch(setError("Không thể khởi tạo giỏ hàng"));
  }
};

export const fetchCartFromServer = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const headers = getAuthHeader();
    const response = await axiosInstance.get("http://localhost:5000/api/cart", {
      headers,
    });

    if (response.data && Array.isArray(response.data)) {
      const cartItems = {};
      const cartId = [];

      response.data.forEach((item) => {
        cartItems[item.product_id] = item.quantity;
        cartId.push(item.product_id);
      });

      const cartCount = calculateCartCount(cartItems);

      dispatch(setCart({ cartItems, cartId, cartCount }));

      saveCartToLocalStorage(cartItems);
    }
    dispatch(setLoading(false));
  } catch (err) {
    if (
      err.response &&
      (err.response.status === 401 || err.response.status === 403)
    ) {
      console.error("Token không hợp lệ hoặc hết hạn");
      dispatch(setLoginStatus(false));
      localStorage.removeItem("accessToken");
    }
    console.error("Error fetching cart from server:", err);
    dispatch(setError("Không thể lấy thông tin giỏ hàng từ server"));
    dispatch(setLoading(false));
  }
};

export const addToCart =
  (productId, quantity = 1) =>
  async (dispatch, getState) => {
    productId = String(productId);
    dispatch(resetError());
    dispatch(setLoading(true));

    try {
      const { isLoggedIn, cartItems, cartId } = getState().cart;

      const updatedCartItems = { ...cartItems };

      if (updatedCartItems[productId]) {
        updatedCartItems[productId] += quantity;
      } else {
        updatedCartItems[productId] = quantity;
      }

      const updatedCartId = cartId.includes(productId)
        ? [...cartId]
        : [...cartId, productId];

      const cartCount = calculateCartCount(updatedCartItems);

      if (isLoggedIn) {
        try {
          const headers = getAuthHeader();
          await axiosInstance.post(
            "http://localhost:5000/api/cart",
            {
              productId: parseInt(productId),
              quantity,
            },
            { headers }
          );

          await dispatch(fetchCartFromServer());
        } catch (err) {
          console.error("Lỗi khi thêm vào giỏ hàng trong database:", err);

          if (err.response && err.response.status === 401) {
            dispatch(setLoginStatus(false));
            localStorage.removeItem("accessToken");

            const cartData = {
              cartItems: updatedCartItems,
              cartId: updatedCartId,
              cartCount,
            };
            saveCartToLocalStorage(updatedCartItems);
            dispatch(setCart(cartData));
          } else {
            throw err;
          }
        }
      } else {
        const cartData = {
          cartItems: updatedCartItems,
          cartId: updatedCartId,
          cartCount,
        };
        saveCartToLocalStorage(updatedCartItems);
        dispatch(setCart(cartData));
      }

      dispatch(setLoading(false));
    } catch (err) {
      console.error("Error adding to cart:", err);
      dispatch(setError("Không thể thêm sản phẩm vào giỏ hàng"));
      dispatch(setLoading(false));
    }
  };

export const updateQuantity =
  (productId, quantity) => async (dispatch, getState) => {
    productId = String(productId);

    if (quantity <= 0) {
      console.log(`Số lượng <= 0, chuyển sang xóa sản phẩm ${productId}`);
      return dispatch(removeFromCart(productId));
    }

    dispatch(resetError());
    dispatch(setLoading(true));

    try {
      const { isLoggedIn, cartItems, cartId } = getState().cart;

      const updatedCartItems = { ...cartItems, [productId]: quantity };
      const cartCount = calculateCartCount(updatedCartItems);

      dispatch(
        setCart({
          cartItems: updatedCartItems,
          cartId,
          cartCount,
        })
      );

      saveCartToLocalStorage(updatedCartItems);

      if (isLoggedIn) {
        try {
          const cartResponse = await axiosInstance.get(
            "http://localhost:5000/api/cart",
            {
              allowDuplicate: true,
              headers: getAuthHeader(),
            }
          );

          if (cartResponse.data && Array.isArray(cartResponse.data)) {
            const cartItem = cartResponse.data.find(
              (item) => String(item.product_id) === productId
            );

            if (cartItem) {
              await axiosInstance.put(
                `http://localhost:5000/api/cart/${cartItem.id}`,
                { quantity },
                {
                  allowDuplicate: true,
                  headers: getAuthHeader(),
                }
              );
            } else {
              await axiosInstance.post(
                "http://localhost:5000/api/cart",
                {
                  productId: parseInt(productId),
                  quantity,
                },
                {
                  allowDuplicate: true,
                  headers: getAuthHeader(),
                }
              );
            }
          }
        } catch (err) {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            console.error("Lỗi khi cập nhật số lượng trong database:", err);

            if (err.response && err.response.status === 401) {
              dispatch(setLoginStatus(false));
              localStorage.removeItem("accessToken");
            }
          }
        }
      }

      dispatch(setLoading(false));
    } catch (err) {
      console.error("Error updating quantity:", err);
      dispatch(setError("Không thể cập nhật số lượng sản phẩm"));
      dispatch(setLoading(false));
    }
  };

export const removeFromCart = (productId) => async (dispatch, getState) => {
  productId = String(productId);

  dispatch(resetError());
  dispatch(setLoading(true));

  try {
    const { isLoggedIn, cartItems, cartId } = getState().cart;

    console.log(`Bắt đầu xóa sản phẩm ${productId} khỏi giỏ hàng`);
    console.log(
      `Trạng thái trước khi xóa: ${JSON.stringify({
        cartId,
        itemCount: Object.keys(cartItems).length,
      })}`
    );

    const updatedCartItems = { ...cartItems };
    delete updatedCartItems[productId];

    const updatedCartId = cartId.filter((id) => id !== productId);
    const cartCount = calculateCartCount(updatedCartItems);

    console.log(
      `Trạng thái sau khi xóa: ${JSON.stringify({
        updatedCartId,
        updatedItemCount: Object.keys(updatedCartItems).length,
      })}`
    );

    saveCartToLocalStorage(updatedCartItems);

    dispatch(
      setCart({
        cartItems: updatedCartItems,
        cartId: updatedCartId,
        cartCount,
      })
    );

    if (isLoggedIn) {
      try {
        const headers = getAuthHeader();

        const cartResponse = await axiosInstance.get(
          "http://localhost:5000/api/cart",
          {
            headers,
            allowDuplicate: true,
          }
        );

        if (cartResponse.data && Array.isArray(cartResponse.data)) {
          const cartItem = cartResponse.data.find(
            (item) => String(item.product_id) === productId
          );

          if (cartItem) {
            console.log(
              `Tìm thấy item trong giỏ hàng: ${cartItem.id}, xóa khỏi database`
            );
            await axiosInstance.delete(
              `http://localhost:5000/api/cart/${cartItem.id}`,
              {
                headers,
                allowDuplicate: true,
              }
            );
            console.log(
              `Đã xóa sản phẩm ${productId} khỏi database thành công`
            );
          } else {
            console.log(
              `Sản phẩm ID ${productId} không tìm thấy trên server, đã xóa khỏi localStorage`
            );
          }
        }
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm khỏi database:", err);

        if (err.response && err.response.status === 401) {
          dispatch(setLoginStatus(false));
          localStorage.removeItem("accessToken");
        } else {  
          console.warn(
            "Không thể xóa sản phẩm khỏi server, nhưng đã xóa khỏi localStorage"
          );
        }
      }
    }

    console.log(`Đã xóa sản phẩm ${productId} khỏi giỏ hàng thành công`);

    const currentState = getState().cart;
    if (currentState.cartItems[productId]) {
      console.warn(
        `Sản phẩm ${productId} vẫn còn trong state sau khi xóa, thử xóa lại`
      );
      const fixedCartItems = { ...currentState.cartItems };
      delete fixedCartItems[productId];
      const fixedCartId = currentState.cartId.filter((id) => id !== productId);
      const fixedCartCount = calculateCartCount(fixedCartItems);

      dispatch(
        setCart({
          cartItems: fixedCartItems,
          cartId: fixedCartId,
          cartCount: fixedCartCount,
        })
      );

      saveCartToLocalStorage(fixedCartItems);
    }

    dispatch(setLoading(false));
  } catch (err) {
    console.error("Error removing from cart:", err);
    dispatch(setError("Không thể xóa sản phẩm khỏi giỏ hàng"));
    dispatch(setLoading(false));
  }
};

export const syncCartAfterLogin = () => async (dispatch, getState) => {
  dispatch(resetError());
  dispatch(setLoading(true));

  try {
    console.log("Bắt đầu đồng bộ giỏ hàng sau khi đăng nhập");
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("Không tìm thấy accessToken trong localStorage");
      dispatch(setError("Không thể đồng bộ giỏ hàng: Thiếu token xác thực"));
      dispatch(setLoading(false));
      return;
    }

    const localCart = getCartFromLocalStorage();
    console.log("Dữ liệu giỏ hàng từ localStorage:", localCart);

    if (
      localCart &&
      localCart.cartItems &&
      Object.keys(localCart.cartItems).length > 0
    ) {
      console.log(
        "Đồng bộ",
        Object.keys(localCart.cartItems).length,
        "sản phẩm lên server"
      );

      const headers = getAuthHeader();

      for (const [productId, quantity] of Object.entries(localCart.cartItems)) {
        try {
          console.log(`Thêm sản phẩm ID: ${productId}, Số lượng: ${quantity}`);
          await axiosInstance.post(
            "http://localhost:5000/api/cart",
            {
              productId: parseInt(productId),
              quantity: parseInt(quantity),
            },
            { headers }
          );
        } catch (error) {
          console.error(`Lỗi khi đồng bộ sản phẩm ${productId}:`, error);
        }
      }
    } else {
      console.log("Không có sản phẩm cần đồng bộ từ localStorage");
    }

    await dispatch(fetchCartFromServer());

    dispatch(setLoginStatus(true));
    dispatch(setLoading(false));
    console.log("Đồng bộ hoàn tất");
  } catch (err) {
    console.error("Error syncing cart after login:", err);
    dispatch(setError("Không thể đồng bộ giỏ hàng sau khi đăng nhập"));
    dispatch(setLoading(false));
  }
};
