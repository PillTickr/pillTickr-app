import { API } from "@/libs/api";
import { User } from "@/types/User";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginAPIResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    expiredAt: number;
    tokenType: "bearer";
    user: User;
  };
};

export const loginAPI = async (request: LoginRequest): Promise<void> => {
  const res: LoginAPIResponse = await API.post(`/auth/login`, {
    email: request.email,
    password: request.password,
  });

  const { refreshToken, user, accessToken } = res.data;

  await AsyncStorage.setItem("user", JSON.stringify(user));
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("refreshToken", refreshToken);
};
