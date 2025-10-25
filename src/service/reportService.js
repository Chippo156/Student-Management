import axios from "../until/customize-axios";

const reportService = {
  getSemesterCredits: async (semesterId) => {
    const res = await axios.get(`/api/Report/semester/${semesterId}/credits`);
    if (!res.success) {
      throw new Error(res.message || "Không lấy được dữ liệu học kỳ");
    }
    return res;
  },
  getAllCreditsByStudent: async () => {
    const res = await axios.get(`/api/Report/student/getAllCreditsByStudent`);
    if (!res.success) {
      throw new Error(res.message || "Không lấy được dữ liệu tổng tín chỉ");
    }
    return res;
  },
};

export default reportService;
