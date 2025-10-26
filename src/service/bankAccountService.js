import { message } from 'antd';
import axios from '../until/customize-axios';

export const bankAccountService = {
  getUserBankAccounts: async () => {
    try {
      const response = await axios.get(
        '/api/BankAccount/user/GetBankAccountsByUser'
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Get user bank accounts failed'
      );
    }
  },

  createBankAccount: async (data) => {
    try {
      const response = await axios.post(
        '/api/BankAccount/user/CreateBankAccount',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Create bank account failed'
      );
    }
  },

  setBankAccountDefault: async (bankAccountId) => {
    try {
      const response = await axios.put(
        `/api/BankAccount/user/SetBankAccountDefault/${bankAccountId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Set bank account default failed'
      );
    }
  },
  updateBankAccount: async (id, data) => {
    try {
      const response = await axios.put(
        `/api/BankAccount/user/UpdateBankAccount/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Update bank account failed'
      );
    }
  },
  deleteBankAccount: async (id) => {
    try {
      const response = await axios.delete(`/api/BankAccount/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Delete bank account failed'
      );
    }
  },
};
