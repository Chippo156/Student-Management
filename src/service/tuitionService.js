import axios from '../until/customize-axios';
import { message } from 'antd';

export const tuitionService = {
  // Lấy danh sách tất cả học phí
  getAllTuitionFees: async (
    pageNumber,
    pageSize,
    studentMSSV = '',
    semesterId = null,
    status = null,
    isOverdue = null,
    fromDate = null,
    toDate = null
  ) => {
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      if (studentMSSV && studentMSSV.trim() !== '') {
        params.StudentMSSV = studentMSSV.trim();
      }

      if (semesterId) {
        params.SemesterId = semesterId;
      }

      if (status !== null && status !== '') {
        params.Status = status;
      }

      if (isOverdue !== null && isOverdue !== '') {
        params.IsOverdue = isOverdue;
      }

      if (fromDate) {
        params.FromDate = fromDate;
      }

      if (toDate) {
        params.ToDate = toDate;
      }

      const response = await axios.get('/api/v1/Tuition/GetAllTuitionFee', {
        params,
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy danh sách học phí thất bại');
        }
        return null;
      }

      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy danh sách học phí thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy danh sách học phí thất bại');
      }
      return null;
    }
  },

  // Lấy chi tiết học phí
  getTuitionFeeDetail: async (tuitionFeeId) => {
    try {
      const response = await axios.get(
        `/api/v1/Tuition/GetDetailTuitionFee/${tuitionFeeId}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy chi tiết học phí thất bại');
        }
        return null;
      }

      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy chi tiết học phí thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy chi tiết học phí thất bại');
      }
      return null;
    }
  },

  // Lấy tổng kết học phí của sinh viên
  getStudentTuitionSummary: async (mssv) => {
    try {
      const response = await axios.get(
        `/api/v1/Tuition/student/${mssv}/summary`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy tổng kết học phí thất bại'
          );
        }
        return null;
      }

      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Lấy tổng kết học phí thất bại'
          );
        }
      } else {
        message.error(error.message || 'Lấy tổng kết học phí thất bại');
      }
      return null;
    }
  },
};
