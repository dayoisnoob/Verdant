import { AddressApi } from "@/types";
import { apiFetch } from "../apiFetch";
import { AddressFormData } from "@/validations";

export const addUserAddress = async (
  data: AddressFormData,
): Promise<AddressApi> => {
  const res = await apiFetch<{ address: AddressApi }>("/api/address", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res.address;
};

export const getUserAddresses = async (): Promise<AddressApi[]> => {
  const res = await apiFetch<{ addresses: AddressApi[] }>("/api/address", {
    method: "GET",
  });

  return res.addresses;
};

export const setDefaultAddress = async (addressId: string) => {
  return apiFetch(`/api/address/${addressId}/set-default`, {
    method: "PATCH",
  });
};

export const updateUserAddress = async ({
  addressId,
  data,
}: {
  addressId: string;
  data: AddressFormData;
}) => {
  return apiFetch(`/api/address/${addressId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const removeAddress = async (addressId: string) => {
  return apiFetch(`/api/address/${addressId}`, {
    method: "DELETE",
  });
};
