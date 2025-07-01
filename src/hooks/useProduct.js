import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosConfig";

const fetchProducts = async ({ offset = 0, limit = 8 }) => {
  const res = await axiosInstance.get(
    `/products/paginated?offset=${offset}&limit=${limit}&include_image=true`
  );
  return res.data.products;
};

const fetchProductById = async (id) => {
  const res = await axiosInstance.get(`/products/${id}`);
  return res.data;
};

const createProduct = async (data) => {
  const res = await axiosInstance.post("/products", data);
  return res.data;
};

const updateProduct = async ({ id, data }) => {
  const res = await axiosInstance.put(`/products/${id}`, data);
  return res.data;
};

const deleteProduct = async (id) => {
  return axiosInstance.delete(`/products/${id}`);
};

const deleteProducts = async (ids) => {
  await Promise.all(ids.map((id) => deleteProduct(id)));
};

const countProducts = async () => {
  const res = await axiosInstance.get("/products/count");
  return res.data.count;
};

const fetchProductsByCategory = async ({
  categoryId,
  offset = 0,
  limit = 8,
}) => {
  const res = await axiosInstance.get(
    `/products/category/${categoryId}/paginated?offset=${offset}&limit=${limit}`
  );
  return Array.isArray(res.data) ? res.data : res.data.products || [];
};

const searchProductPaginated = async ({ keyword, offset = 0, limit = 8 }) => {
  const res = await axiosInstance.get(
    `/products/search/paginated?query=${keyword}&offset=${offset}&limit=${limit}`
  );
  return Array.isArray(res.data) ? res.data : res.data.products || [];
};

export default function useProduct({ offset = 0, limit = 8, keyword } = {}) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products", offset, limit],
    queryFn: () => fetchProducts({ offset, limit }),
    keepPreviousData: true,
  });

  const searchProductQuery = useQuery({
    queryKey: ["searchProduct", keyword],
    queryFn: () => searchProductPaginated({ keyword }),
  });

  const deleteProductsMutation = useMutation({
    mutationFn: deleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const countProductsMutation = useMutation({ mutationFn: countProducts });

  return {
    products: productsQuery.data || [],
    searchProducts: searchProductQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    refetch: productsQuery.refetch,

    getProductById: fetchProductById,

    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    deleteProducts: deleteProductsMutation.mutateAsync,

    isDeleting: deleteProductsMutation.isLoading,
    isDeletingOne: deleteProductMutation.isLoading,
    isUpdating: updateProductMutation.isLoading,
    isCreating: createProductMutation.isLoading,
    errorDelete: deleteProductsMutation.error,
    errorDeleteOne: deleteProductMutation.error,
    errorUpdate: updateProductMutation.error,
    errorCreate: createProductMutation.error,

    countProducts: countProductsMutation.mutateAsync,
    isCounting: countProductsMutation.isLoading,
    errorCount: countProductsMutation.error,
    dataCount: countProductsMutation.data,

    fetchProductsByCategory,
    searchProductPaginated,
    fetchProducts,
  };
}
