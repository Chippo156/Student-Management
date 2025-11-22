import axios from '../until/customize-axios';
import { message } from 'antd';

const gradeService = {
  /**
   * L�y t�t c� i�m c�a sinh vi�n theo MSSV
   * @param {string} mssv - M� s� sinh vi�n
   */
  getAllGradesByStudentCode: async (mssv) => {
    try {
      const response = await axios.get(
        `/api/Grade/GetAllGradesByStudentCode/${mssv}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'L�y i�m sinh vi�n th�t b�i');
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
            error.response.data.message || 'L�y i�m sinh vi�n th�t b�i'
          );
        }
      } else {
        message.error(error.message || 'L�y i�m sinh vi�n th�t b�i');
      }
      return null;
    }
  },

  /**
   * T�o i�m cho sinh vi�n
   * @param {Object} gradeData - { studentId, assessmentId, score }
   */
  createGrade: async (gradeData) => {
    try {
      const response = await axios.post('/api/Grade/CreateGrade', gradeData);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'T�o i�m th�t b�i');
        }
        return null;
      }

      message.success('T�o i�m th�nh c�ng');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'T�o i�m th�t b�i');
        }
      } else {
        message.error(error.message || 'T�o i�m th�t b�i');
      }
      return null;
    }
  },

  /**
   * C�p nh�t i�m cho sinh vi�n
   * @param {number} id - Grade ID
   * @param {Object} gradeData - { studentId, assessmentId, score }
   */
  updateGrade: async (id, gradeData) => {
    try {
      const response = await axios.put(`/api/Grade/Update/${id}`, gradeData);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'C�p nh�t i�m th�t b�i');
        }
        return null;
      }

      message.success('C�p nh�t i�m th�nh c�ng');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'C�p nh�t i�m th�t b�i');
        }
      } else {
        message.error(error.message || 'C�p nh�t i�m th�t b�i');
      }
      return null;
    }
  },

  /**
   * X�a i�m
   * @param {number} id - Grade ID
   */
  deleteGrade: async (id) => {
    try {
      const response = await axios.delete(`/api/Grade/DeleteGrade/${id}`);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'X�a i�m th�t b�i');
        }
        return null;
      }

      message.success('X�a i�m th�nh c�ng');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(error.response.data.message || 'X�a i�m th�t b�i');
        }
      } else {
        message.error(error.message || 'X�a i�m th�t b�i');
      }
      return null;
    }
  },

  /**
   * Tạo điểm nhiều sinh viên cùng lúc
   * @param {number} assessmentId - Assessment ID
   * @param {Array} studentGrades - Array of { studentId, score, note }
   */
  createBulkGrades: async (assessmentId, studentGrades) => {
    try {
      const response = await axios.post(
        `/api/Grade/CreateBulkGrades/${assessmentId}`,
        studentGrades
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo điểm hàng loạt thất bại');
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
            error.response.data.message || 'Tạo điểm hàng loạt thất bại'
          );
        }
      } else {
        message.error(error.message || 'Tạo điểm hàng loạt thất bại');
      }
      return null;
    }
  },

  /**
   * Lấy tất cả điểm sinh viên trong một section (giống giáo viên)
   * @param {number} sectionId - Section ID
   */
  getAllStudentGradesBySection: async (sectionId) => {
    try {
      const response = await axios.get(
        `/api/Grade/GetAllStudentGradesBySection/${sectionId}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy điểm sinh viên theo học phần thất bại'
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
            error.response.data.message ||
              'Lấy điểm sinh viên theo học phần thất bại'
          );
        }
      } else {
        message.error(
          error.message || 'Lấy điểm sinh viên theo học phần thất bại'
        );
      }
      return null;
    }
  },
};

export default gradeService;
