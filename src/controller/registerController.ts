import axios from "../until/customize-axios";
import { Dayjs } from "dayjs";

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone: string;
  address: string;
  dob: Dayjs | null;
  first_name: string;
  last_name: string;
  sex: string;
}

interface RegisterResponse {
  code: number;
  message?: string;
  result?: {
    userId: string;
    username: string;
    email: string;
    [key: string]: any;
  };
}

export const registerUser = async (
  username: string,
  password: string,
  email: string,
  phone: string,
  address: string,
  dob: Dayjs | null,
  sex: string,
  firstname: string,
  lastname: string
): Promise<RegisterResponse> => {
  try {
    const response: RegisterResponse = await axios.post("/users/registration", {
      username: username,
      password: password,
      email: email,
      phone: phone,
      address: address,
      dob: dob,
      first_name: firstname,
      last_name: lastname,
      sex: sex,
    } as RegisterRequest);
    
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};