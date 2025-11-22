import axios from '../until/customize-axios';
import { message } from 'antd';

const announcementService = {
  /**
   * [ADMIN] Tạo thông báo mới
   */
  createAnnouncement: async (data) => {
    try {
      const response = await axios.post(
        '/api/Announcement/CreateAnnouncement',
        data
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Tạo thông báo thất bại');
        }
        return null;
      }

      message.success('Tạo thông báo thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Create announcement failed'
          );
        }
      } else {
        message.error(error.message || 'Create announcement failed');
      }
      return null;
    }
  },

  /**
   * [ADMIN] Lấy tất cả thông báo
   */
  getAllAnnouncements: async (params = {}) => {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        search = '',
        type = null,
        priority = null,
        targetType = null,
        isActive = null,
      } = params;

      const response = await axios.get(
        '/api/Announcement/GetAllAnnouncements',
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            search,
            type,
            priority,
            targetType,
            isActive,
          },
        }
      );

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            response?.message || 'Lấy danh sách thông báo thất bại'
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
            error.response.data.message || 'Get announcements failed'
          );
        }
      } else {
        message.error(error.message || 'Get announcements failed');
      }
      return null;
    }
  },

  /**
   * [ADMIN] Cập nhật thông báo
   */
  updateAnnouncement: async (id, data) => {
    try {
      const response = await axios.put(`/api/Announcement/${id}`, data);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Cập nhật thông báo thất bại');
        }
        return null;
      }

      message.success('Cập nhật thông báo thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Update announcement failed'
          );
        }
      } else {
        message.error(error.message || 'Update announcement failed');
      }
      return null;
    }
  },

  /**
   * [ADMIN] Xóa thông báo
   */
  deleteAnnouncement: async (id) => {
    try {
      const response = await axios.delete(`/api/Announcement/${id}`);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Xóa thông báo thất bại');
        }
        return null;
      }

      message.success('Xóa thông báo thành công!');
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(
            error.response.data.message || 'Delete announcement failed'
          );
        }
      } else {
        message.error(error.message || 'Delete announcement failed');
      }
      return null;
    }
  },

  /**
   * [STUDENT/LECTURER] Lấy thông báo của user hiện tại
   */
  getMyAnnouncements: async (params = {}) => {
    try {
      const {
        pageNumber = 1,
        pageSize = 10,
        search = '',
        type = null,
        priority = null,
        targetType = null,
        isActive = true,
      } = params;

      const response = await axios.get('/api/Announcement/GetMyAnnouncements', {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          search,
          type,
          priority,
          targetType,
          isActive,
        },
      });

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy thông báo thất bại');
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
            error.response.data.message || 'Get my announcements failed'
          );
        }
      } else {
        message.error(error.message || 'Get my announcements failed');
      }
      return null;
    }
  },

  /**
   * [PUBLIC] Lấy thông báo công khai theo type (không cần login)
   */
  getPublicAnnouncementsByType: async (
    type = 1,
    pageNumber = 1,
    pageSize = 10
  ) => {
    try {
      const response = await axios.get(
        `/api/Announcement/public/type/${type}`,
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
          },
        }
      );

      if (response?.success === false) {
        console.error('Get public announcements failed:', response?.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Get public announcements error:', error);
      return null;
    }
  },

  /**
   * Lấy chi tiết thông báo theo ID
   */
  getAnnouncementById: async (id) => {
    try {
      const response = await axios.get(`/api/Announcement/${id}`);

      if (response?.success === false) {
        const errData = response?.data;
        if (Array.isArray(errData) && errData.length > 0) {
          message.error(errData[0]);
        } else {
          message.error(response?.message || 'Lấy chi tiết thông báo thất bại');
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
            error.response.data.message || 'Get announcement detail failed'
          );
        }
      } else {
        message.error(error.message || 'Get announcement detail failed');
      }
      return null;
    }
  },
};

export default announcementService;
