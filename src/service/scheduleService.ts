import axios from "../until/customize-axios";
import { message } from "antd";

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
      message.error(res.message || "Không lấy được thống kê lịch tuần");
      throw new Error("Không lấy được thống kê lịch tuần");
    }
    return res;
  },
};

export default scheduleService;