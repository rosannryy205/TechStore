import { httpRequest } from "@/services/api/httpClient";

export const userService = {
  updateProfile: async (profileData) => {
    return await httpRequest("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },
};
