import customizeAxios from '../until/customize-axios';

export const studentServices = {
  updateStudentInformation: async (data) => {
    const res = await customizeAxios.put(
      `/api/Student/UpdateStudentInformation`,
      data
    );
    if (!res.success) {
      message.error(res.message || 'Cập nhật thông tin người dùng thất bại');
      throw new Error(res.message || 'Get user info failed');
    }
    return res.data;
  },
};
