import axios from "../until/customize-axios";

export interface CountScheduleResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    countScheduleOfWeek: number;
    countTestOfWeek: number;
  };
}

const scheduleService = {
  countScheduleOfWeek: async (): Promise<CountScheduleResponse> => {
    const res = await axios.get("/api/Schedule/countSchedule");
    if (!res.success) {
      throw new Error(res.message || "Không lấy được thống kê lịch tuần");
    }
    return res;
  },
};

export default scheduleService;