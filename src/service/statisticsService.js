import axios from '../until/customize-axios';
import { message } from 'antd';

const statisticsService = {
  /**
   * Th�ng k� tng tr��ng s� l��ng sinh vi�n v� gi�ng vi�n theo nm
   * @param {number} years - S� nm g�n nh�t
   */
  getYearlyGrowth: async (years = 7) => {
    try {
      const response = await axios.get('/api/v1/Statistics/Yearly-growth', {
        params: { years },
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'L�y th�ng k� tng tr��ng th�t b�i');
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
            error.response.data.message || 'L�y th�ng k� tng tr��ng th�t b�i'
          );
        }
      } else {
        message.error(error.message || 'L�y th�ng k� tng tr��ng th�t b�i');
      }
      return null;
    }
  },

  /**
   * Th�ng k� sinh vi�n theo tr�ng th�i
   */
  getStudentStatus: async () => {
    try {
      const response = await axios.get(
        '/api/v1/Statistics/statistics/student-status'
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'L�y th�ng k� tr�ng th�i sinh vi�n th�t b�i'
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
              'L�y th�ng k� tr�ng th�i sinh vi�n th�t b�i'
          );
        }
      } else {
        message.error(
          error.message || 'L�y th�ng k� tr�ng th�i sinh vi�n th�t b�i'
        );
      }
      return null;
    }
  },

  /**
   * Th�ng k� t�ng quan h� th�ng
   */
  getOverview: async () => {
    try {
      const response = await axios.get('/api/v1/Statistics/overview');

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'L�y th�ng k� t�ng quan th�t b�i');
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
            error.response.data.message || 'L�y th�ng k� t�ng quan th�t b�i'
          );
        }
      } else {
        message.error(error.message || 'L�y th�ng k� t�ng quan th�t b�i');
      }
      return null;
    }
  },

  /**
   * Th�ng k� i�m sinh vi�n theo MSSV
   * @param {string} mssv - M� s� sinh vi�n
   */
  getStudentGrades: async (mssv) => {
    try {
      const response = await axios.get(
        `/api/v1/Statistics/student-grades/${mssv}`
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'L�y th�ng k� i�m sinh vi�n th�t b�i'
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
              'L�y th�ng k� i�m sinh vi�n th�t b�i'
          );
        }
      } else {
        message.error(
          error.message || 'L�y th�ng k� i�m sinh vi�n th�t b�i'
        );
      }
      return null;
    }
  },

  /**
   * Th�ng k� i�m t�t c� sinh vi�n
   * @param {Object} params - { departmentId, semesterId }
   */
  getAllStudentsGrades: async (params = {}) => {
    try {
      const response = await axios.get(
        '/api/v1/Statistics/all-students-grades',
        { params }
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'L�y th�ng k� i�m t�t c� sinh vi�n th�t b�i'
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
              'L�y th�ng k� i�m t�t c� sinh vi�n th�t b�i'
          );
        }
      } else {
        message.error(
          error.message || 'L�y th�ng k� i�m t�t c� sinh vi�n th�t b�i'
        );
      }
      return null;
    }
  },
};

export default statisticsService;
