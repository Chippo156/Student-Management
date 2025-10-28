import axios from '../until/customize-axios';
import { message } from 'antd';

export const familyRelationshipService = {
  getFamilyRelationshipsByStudent: async () => {
    try {
      const response = await axios.get(
        '/api/FamilyRelationship/GetFamilyRelationshipsByStudent'
      );
      if (response?.data?.success === false) {
        const errData = response?.data?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.data?.message || 'Lấy quan hệ gia đình thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy quan hệ gia đình thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy quan hệ gia đình thất bại');
      }
      return null;
    }
  },

  updateFamilyRelationship: async (id, data) => {
    try {
      const response = await axios.put(
        `/api/FamilyRelationship/UpdateFamilyRelationship/${id}`,
        data
      );
      if (response?.data?.success === false) {
        const errData = response?.data?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.data?.message || 'Cập nhật quan hệ gia đình thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Cập nhật quan hệ gia đình thất bại'
          );
        }
      } else {
        message.error(error.message || 'Cập nhật quan hệ gia đình thất bại');
      }
      return null;
    }
  },
  createFamilyRelationship: async (data) => {
    try {
      const response = await axios.post(
        '/api/FamilyRelationship/CreateFamilyRelationship',
        data
      );
      if (response?.data?.success === false) {
        const errData = response?.data?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.data?.message || 'Thêm quan hệ gia đình thất bại'
          );
        }
        return null;
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Thêm quan hệ gia đình thất bại'
          );
        }
      } else {
        message.error(error.message || 'Thêm quan hệ gia đình thất bại');
      }
      return null;
    }
  },
};
