import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    common: {
      "Content-Type": "application/json",
    },
  },
});

const pendingRequests = new Map();

const generateRequestKey = (config) => {
  return `${config.method}:${config.url}${
    config.params ? JSON.stringify(config.params) : ""
  }`;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const requestKey = generateRequestKey(config);

    if (config.url && config.url.includes("/cart") && !config.allowDuplicate) {
      if (pendingRequests.has(requestKey)) {
        const controller = pendingRequests.get(requestKey);
        controller.abort();
        pendingRequests.delete(requestKey);
        console.log(`Hủy request trước đó: ${requestKey}`);
      }

      const controller = new AbortController();
      config.signal = controller.signal;
      pendingRequests.set(requestKey, controller);

      config._requestKey = requestKey;
    } else if (config.allowDuplicate) {
      const timestamp = Date.now();
      const separator = config.url.includes("?") ? "&" : "?";
      config.url = `${config.url}${separator}_t=${timestamp}`;
      console.log(`Cho phép request trùng lặp: ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config._requestKey) {
      pendingRequests.delete(response.config._requestKey);
    }
    return response;
  },
  (error) => {
    if (
      axios.isCancel(error) ||
      error.name === "AbortError" ||
      error.name === "CanceledError"
    ) {
      console.log("Request bị hủy:", error.message);
      return Promise.reject(error);
    }

    if (error.config && error.config._requestKey) {
      pendingRequests.delete(error.config._requestKey);
    }

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.log("Token hết hạn hoặc không hợp lệ");
      localStorage.removeItem("accessToken");
      if (!window.forbiddenAlertShown) {
        window.forbiddenAlertShown = true;
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        setTimeout(() => {
          window.forbiddenAlertShown = false;
        }, 2000);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    } else if (error.response && error.response.status === 429) {
      console.log("Quá nhiều request, vui lòng thử lại sau");
    } else if (error.code === "ECONNABORTED") {
      console.log("Request bị timeout, vui lòng thử lại");
    }

    return Promise.reject(error);
  }
);

export const allowDuplicate = (config) => {
  return {
    ...config,
    allowDuplicate: true,
  };
};

export default axiosInstance;
