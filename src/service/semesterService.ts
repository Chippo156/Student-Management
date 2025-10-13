import customizeAxios from "../until/customize-axios";

export interface Semester {
  semesterId: number;
  year: number;
  term: string;
}

export const semesterService = {
  getStudentSemesters: async (): Promise<Semester[]> => {
    const response = await customizeAxios.get("/api/Semester/student");
    return response.data;
  },
};