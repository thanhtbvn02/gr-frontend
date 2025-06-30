import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosConfig";

const fetchUsers = async (keyword = "") => {
  let url = "/users";
  if (keyword && keyword.trim() !== "")
    url = `/users/find-by-name-or-email?keyword=${encodeURIComponent(
      keyword.trim()
    )}`;
  const res = await axiosInstance.get(url);
  return res.data.users || res.data;
};

const fetchUserById = async (id) => {
  const res = await axiosInstance.get(`/users/${id}`);
  return res.data;
};

const countUsers = async () => {
  const res = await axiosInstance.get("/users/count/user");
  return res.data;
};

const countAdmins = async () => {
  const res = await axiosInstance.get("/users/count/admin");
  return res.data;
};

const updateAvatar = async (id, formData) => {
  const res = await axiosInstance.post(`/users/${id}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

const updateUser = async (id, data) => {
  const res = await axiosInstance.put(`/users/${id}`, data);
  return res.data;
};

const deleteUser = async (id) => {
  return axiosInstance.delete(`/users/${id}`);
};

const deleteUsers = async (ids) => {
  await Promise.all(ids.map((id) => deleteUser(id)));
};

const registerUser = async ({ username, password, captchaToken }) => {
  const res = await axiosInstance.post(
    "/users/register",
    { username, password, captchaToken },
    { withCredentials: true }
  );
  return res.data;
};

const loginUser = async ({ username, password }) => {
  const res = await axiosInstance.post("/users/login", {
    username,
    password,
  });
  return res.data;
};

const logoutUser = async () => {
  const res = await axiosInstance.post("/users/logout");
  return res.data;
};

const forgotPassword = async (email) => {
  const res = await axiosInstance.post("/users/forgot-password", { email });
  return res.data;
};

const resetPassword = async (code) => {
  const res = await axiosInstance.post("/users/reset-password", { code });
  return res.data;
};

const updateEmail = async ({ id, email }) => {
  const res = await axiosInstance.post(`/users/${id}`, { email });
  return res.data;
};

const changePassword = async ({ id, oldPassword, newPassword }) => {
  const res = await axiosInstance.put(`/users/${id}/change-password`, {
    oldPassword,
    newPassword,
  });
  return res.data;
};

export default function useUser() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = React.useState("");

  const userQuery = useQuery({
    queryKey: ["users", keyword],
    queryFn: () => fetchUsers(keyword),
    keepPreviousData: true,
  });

  const deleteUsersMutation = useMutation({
    mutationFn: deleteUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: ({ id, formData }) => updateAvatar(id, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const registerMutation = useMutation({ mutationFn: registerUser });
  const loginMutation = useMutation({ mutationFn: loginUser });
  const forgotPasswordMutation = useMutation({ mutationFn: forgotPassword });
  const resetPasswordMutation = useMutation({ mutationFn: resetPassword });
  const updateEmailMutation = useMutation({ mutationFn: updateEmail });
  const changePasswordMutation = useMutation({ mutationFn: changePassword });
  const logoutMutation = useMutation({ mutationFn: logoutUser });
  const countUsersMutation = useMutation({ mutationFn: countUsers });
  const countAdminsMutation = useMutation({ mutationFn: countAdmins });

  return {
    users: userQuery.data || [],
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    refetch: userQuery.refetch,
    keyword,
    setKeyword,
    getUserById: fetchUserById,

    updateUser: updateUserMutation.mutateAsync,
    updateAvatar: updateAvatarMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    deleteUsers: deleteUsersMutation.mutateAsync,

    isDeleting: deleteUsersMutation.isLoading,
    isDeletingOne: deleteUserMutation.isLoading,
    isUpdating: updateUserMutation.isLoading,
    isUpdatingAvatar: updateAvatarMutation.isLoading,
    errorDelete: deleteUsersMutation.error,
    errorDeleteOne: deleteUserMutation.error,
    errorUpdate: updateUserMutation.error,
    errorUpdateAvatar: updateAvatarMutation.error,

    registerUser: registerMutation.mutateAsync,
    isRegistering: registerMutation.isLoading,
    errorRegister: registerMutation.error,
    dataRegister: registerMutation.data,

    loginUser: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isLoading,
    errorLogin: loginMutation.error,
    dataLogin: loginMutation.data,

    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgetting: forgotPasswordMutation.isLoading,
    errorForgot: forgotPasswordMutation.error,
    dataForgot: forgotPasswordMutation.data,

    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isLoading,
    errorReset: resetPasswordMutation.error,
    dataReset: resetPasswordMutation.data,

    updateEmail: updateEmailMutation.mutateAsync,
    isUpdatingEmail: updateEmailMutation.isLoading,
    errorUpdateEmail: updateEmailMutation.error,
    dataUpdateEmail: updateEmailMutation.data,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isLoading,
    errorChangePassword: changePasswordMutation.error,
    dataChangePassword: changePasswordMutation.data,

    logoutUser: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isLoading,
    errorLogout: logoutMutation.error,
    dataLogout: logoutMutation.data,

    countUsers: countUsersMutation.mutateAsync,
    isCountingUsers: countUsersMutation.isLoading,
    errorCountUsers: countUsersMutation.error,
    dataCountUsers: countUsersMutation.data,

    countAdmins: countAdminsMutation.mutateAsync,
    isCountingAdmins: countAdminsMutation.isLoading,
    errorCountAdmins: countAdminsMutation.error,
    dataCountAdmins: countAdminsMutation.data,
  };
}
