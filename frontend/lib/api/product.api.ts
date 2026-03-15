import { Product, ProductsApi } from "@/types";
import { apiFetch } from "../apiFetch";

export const getProducts = async (
  category?: string,
  sort?: string,
  filter?: string,
  page = 1,
  limit = 12,
): Promise<ProductsApi> => {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (sort && sort !== "default") params.set("sort", sort);
  if (filter && filter !== "default") params.set("filter", filter);
  params.set("page", String(page));
  params.set("limit", String(limit));

  return apiFetch(`/api/products?${params.toString()}`, {
    method: "GET",
  });
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const res = await apiFetch<{ product: Product }>(`/api/products/${slug}`, {
    method: "GET",
  });

  return res.product;
};

export const getCategories = async (): Promise<string[]> => {
  const res = await apiFetch<{ categories: string[] }>(
    "/api/products/categories",
    {
      method: "GET",
    },
  );

  return res.categories;
};
