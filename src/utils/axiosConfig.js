import axios from 'axios';

// Tạo instance axios với URL mặc định
const axiosInstance = axios.create({
  baseURL: 'https://gr-backend.onrender.com/api',
  timeout: 10000, // timeout 10 giây
  headers: {
    common: {
      'Content-Type': 'application/json'
    }
  }
});

// Lưu trữ các request đang chạy
const pendingRequests = new Map();

// Cache cho các yêu cầu GET
const requestCache = {};

// Khoảng thời gian hết hạn cache (ms)
const CACHE_EXPIRY = 10000; // 10 giây

// Tạo một key duy nhất cho mỗi request
const generateRequestKey = (config) => {
  return `${config.method}:${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
};

// Thêm interceptor để xử lý request
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Tạo key cho request
    const requestKey = generateRequestKey(config);
    
    // Kiểm tra cache cho GET requests
    if (config.method === 'get' && !config.skipCache) {
      const cachedResponse = requestCache[requestKey];
      if (cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_EXPIRY)) {
        // Trả về response từ cache
        const response = {
          data: cachedResponse.data,
          status: 200,
          statusText: 'OK',
          headers: cachedResponse.headers,
          config: config,
          request: { fromCache: true }
        };
        
        return Promise.resolve(response);
      }
    }
    
    // Xử lý request trùng lặp, đặc biệt là cart requests
    if (config.url && config.url.includes('/cart') && !config.allowDuplicate) {
      // Kiểm tra xem có request tương tự đang chạy không
      if (pendingRequests.has(requestKey)) {
        // Hủy request trước đó
        const controller = pendingRequests.get(requestKey);
        controller.abort();
        pendingRequests.delete(requestKey);
        console.log(`Hủy request trước đó: ${requestKey}`);
      }
      
      // Tạo controller mới cho request hiện tại
      const controller = new AbortController();
      config.signal = controller.signal;
      pendingRequests.set(requestKey, controller);
      
      // Lưu requestKey vào config để sử dụng trong response interceptor
      config._requestKey = requestKey;
    } else if (config.allowDuplicate) {
      // Nếu có allowDuplicate, thêm timestamp vào URL để đảm bảo request là duy nhất
      const timestamp = Date.now();
      
      // Thêm timestamp vào URL
      const separator = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}_t=${timestamp}`;
      
      // Không lưu vào pending requests để tránh bị hủy
      console.log(`Cho phép request trùng lặp: ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    // Xóa request khỏi danh sách đang chạy
    if (response.config._requestKey) {
      pendingRequests.delete(response.config._requestKey);
    }
    
    // Lưu response vào cache nếu là GET request và không phải từ cache
    if (response.config.method === 'get' && !response.request?.fromCache && !response.config.skipCache) {
      const requestKey = generateRequestKey(response.config);
      requestCache[requestKey] = {
        data: response.data,
        headers: response.headers,
        timestamp: Date.now()
      };
    }
    
    return response;
  },
  (error) => {
    // Xử lý khi request bị hủy
    if (axios.isCancel(error) || error.name === 'AbortError' || error.name === 'CanceledError') {
      console.log('Request bị hủy:', error.message);
      return Promise.reject(error);
    }
    
    // Xóa request khỏi danh sách đang chạy
    if (error.config && error.config._requestKey) {
      pendingRequests.delete(error.config._requestKey);
    }
    
    // Xử lý lỗi 401 Unauthorized hoặc 403 Forbidden
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Token hết hạn hoặc không hợp lệ');
      
      // Xóa token
      localStorage.removeItem('accessToken');
      
      // Tránh hiển thị quá nhiều thông báo
      if (!window.forbiddenAlertShown) {
        window.forbiddenAlertShown = true;
        
        // Thông báo cho người dùng
        alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        
        // Reset flag sau 2 giây
        setTimeout(() => {
          window.forbiddenAlertShown = false;
        }, 2000);
        
        // Chuyển hướng đến trang đăng nhập
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.response && error.response.status === 429) {
      // Xử lý lỗi rate limit
      console.log('Quá nhiều request, vui lòng thử lại sau');
    } else if (error.code === 'ECONNABORTED') {
      // Xử lý lỗi timeout
      console.log('Request bị timeout, vui lòng thử lại');
    }
    
    return Promise.reject(error);
  }
);

// Hàm để tạo request với tùy chọn bỏ qua cache
export const skipCache = (config) => {
  return {
    ...config,
    skipCache: true
  };
};

// Hàm để tạo request cho phép trùng lặp
export const allowDuplicate = (config) => {
  return {
    ...config,
    allowDuplicate: true
  };
};

// Xóa tất cả cache
export const clearCache = () => {
  Object.keys(requestCache).forEach(key => delete requestCache[key]);
};

// Xóa cache cho các API liên quan đến cart
export const clearCartCache = () => {
  Object.keys(requestCache).forEach(key => {
    if (key.includes('/cart')) {
      delete requestCache[key];
    }
  });
};

export default axiosInstance;
