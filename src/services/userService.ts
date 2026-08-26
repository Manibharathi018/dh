import { api } from "@/lib/axios";

export interface UserDTO {
  id: number;
  name: string;
  userName: string;
  isVerified: boolean;
  phoneNumber: string;
  role: string;
}

export const userService = {
  getAllUsers: async (): Promise<UserDTO[]> => {
    const response = await api.get<UserDTO[]>("/admin/users");
    return response.data;
  },

  updateUserRole: async (userId: number, role: string): Promise<UserDTO> => {
    const response = await api.put<UserDTO>(`/admin/users/${userId}/role?role=${role}`);
    return response.data;
  },
};
