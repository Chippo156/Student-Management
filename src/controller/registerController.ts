import { AuthController } from './authController';
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

// Legacy function for backward compatibility
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
    const response = await AuthController.register({
      username: username,
      password: password,
      email: email,
      phone: phone,
      address: address,
      dateOfBirth: dob?.format('YYYY-MM-DD') || '',
      firstName: firstname,
      lastName: lastname,
      gender: sex === 'male' ? 1 : sex === 'female' ? 2 : 0,
      role: 3 // Default to student role
    });
    
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};