import customizeAxios from "../until/customize-axios";
import { message } from "antd";

export const semesterService = {
  getStudentSemesters: async () => {
    const response = await customizeAxios.get("/api/Semester/student");
    if (!response.success) {
      message.error("Failed to fetch student semesters.");
    }
    return response.data;
  },
};
