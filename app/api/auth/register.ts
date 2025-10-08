import { API } from "@/libs/api";
import { User } from "@/types/User";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  dob: string;
};

type RegisterAPIResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiredAt: number;
    tokenType: "bearer";
    user: User;
  };
};

export const registerAPI = async (request: RegisterRequest): Promise<void> => {
  const res: RegisterAPIResponse = await API.post(`/auth/register`, {
    email: request.email,
    password: request.password,
    name: request.name,
    dob: request.dob,
  });

  const { refreshToken, user, accessToken } = res.data;

  await AsyncStorage.setItem("user", JSON.stringify(user));
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
};
