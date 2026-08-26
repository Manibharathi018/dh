import { api } from "@/lib/axios";

// Frontend type
export interface AddressDTO {
  id?: number;
  doorNumber?: string;
  street: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string; // Maps to pinCode
  country?: string;
  isDefault?: boolean; // Maps to defaultAddress
}

// Map from backend to frontend
const transformAddress = (data: any): AddressDTO => {
  return {
    id: data.id,
    doorNumber: data.doorNumber,
    street: data.street,
    city: data.city,
    district: data.district,
    state: data.state,
    postalCode: data.pinCode,
    isDefault: data.defaultAddress,
    country: "India",
  };
};

// Map from frontend to backend
const toBackendAddress = (addr: AddressDTO): any => {
  return {
    doorNumber: addr.doorNumber || "",
    street: addr.street,
    city: addr.city,
    district: addr.district || "",
    state: addr.state,
    pinCode: addr.postalCode,
    defaultAddress: addr.isDefault || false,
  };
};

export const addressService = {
  getMyAddresses: async () => {
    const response = await api.get<any[]>("/addresses/my");
    return response.data.map(transformAddress);
  },

  addAddress: async (address: AddressDTO) => {
    const response = await api.post<any>("/addresses", toBackendAddress(address));
    return transformAddress(response.data);
  },

  updateAddress: async (addressId: number, address: AddressDTO) => {
    const response = await api.put<any>(`/addresses/${addressId}`, toBackendAddress(address));
    return transformAddress(response.data);
  },

  deleteAddress: async (addressId: number) => {
    await api.delete(`/addresses/${addressId}`);
  },

  setDefaultAddress: async (addressId: number) => {
    const response = await api.put<any>(`/addresses/${addressId}/default`);
    return transformAddress(response.data);
  },
};
