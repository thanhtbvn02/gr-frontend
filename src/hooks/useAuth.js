import { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { CART_ACTIONS, syncCartAfterLogin } from '../redux/addCart';
import { clearCart } from '../redux/addCart';


export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return Date.now() < decoded.exp * 1000;
  } catch (err) {
    console.error('Lỗi khi giải mã token:', err);
    return false;
  }
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [syncDone, setSyncDone] = useState(false);
  const syncAttemptRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      if (isTokenValid(token)) {
        try {
          const decoded = jwtDecode(token);
          setUser({ token, userId: decoded.userId });
          
          // Đặt trạng thái đã đăng nhập trước
          dispatch({
            type: CART_ACTIONS.SET_LOGIN_STATUS,
            payload: true
          });
          
          // Đồng bộ giỏ hàng chỉ một lần khi khởi động và chỉ khi chưa thực hiện
          if (!syncDone && !syncAttemptRef.current) {
            syncAttemptRef.current = true; // Đánh dấu đã cố gắng đồng bộ
            
            const timer = setTimeout(() => {
              dispatch(syncCartAfterLogin());
              setSyncDone(true);
            }, 1000);
            
            return () => clearTimeout(timer);
          }
        } catch (error) {
          console.error('Lỗi khi xử lý token hợp lệ:', error);
          logout();
        }
      } else {
        localStorage.removeItem('accessToken');
        dispatch({
          type: CART_ACTIONS.SET_LOGIN_STATUS,
          payload: false
        });
      }
    }
  }, [dispatch, syncDone]);

  const login = (token) => {
    try {
      localStorage.setItem('accessToken', token);
      const decoded = jwtDecode(token);
      setUser({ token, userId: decoded.userId });
      
      // Đặt trạng thái đã đăng nhập trước
      dispatch({
        type: CART_ACTIONS.SET_LOGIN_STATUS,
        payload: true
      });
      
      // Đặt lại trạng thái đồng bộ
      setSyncDone(false);
      syncAttemptRef.current = false;
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('cartData');
    setUser(null);
    dispatch({
      type: CART_ACTIONS.SET_LOGIN_STATUS,
      payload: false
    });
    dispatch(clearCart());
    setSyncDone(false);
    syncAttemptRef.current = false;
  };

  return { user, isLoggedIn: !!user, login, logout };
};
