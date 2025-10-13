import customizeAxios from "../until/customize-axios";
import { message } from "antd";

export interface Semester {
  semesterId: number;
  year: number;
  term: string;
}

export const semesterService = {
  getStudentSemesters: async (): Promise<Semester[]> => {
    const response = await customizeAxios.get("/api/Semester/student");
    if (!response.success) {
      message.error("Failed to fetch student semesters.");
    }
    return response.data;
  },
};