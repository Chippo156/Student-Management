import axios from '../utils/customize-axios';
import { toast } from '../utils/toast';

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
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Lấy danh sách học phí thất bại');
        }
        return null;
      }

      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Lấy danh sách học phí thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy danh sách học phí thất bại');
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
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Lấy chi tiết học phí thất bại');
        }
        return null;
      }

      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Lấy chi tiết học phí thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy chi tiết học phí thất bại');
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
          toast.error(errData[0]);
        } else {
          toast.error(
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
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Lấy tổng kết học phí thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy tổng kết học phí thất bại');
      }
      return null;
    }
  },

  // Tra cứu công nợ của sinh viên
  getStudentDebt: async (semesterId = null) => {
    try {
      const params = {};
      if (semesterId) {
        params.semesterId = semesterId;
      }

      const response = await axios.get('/api/v1/Tuition/student/debt', {
        params,
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(response?.message || 'Lấy thông tin công nợ thất bại');
        }
        return null;
      }

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          toast.error(errData[0]);
        } else {
          toast.error(
            error.response.data.message || 'Lấy thông tin công nợ thất bại'
          );
        }
      } else {
        toast.error(error.message || 'Lấy thông tin công nợ thất bại');
      }
      return null;
    }
  },
};
