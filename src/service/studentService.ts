import axios from "../until/customize-axios";

// Student interfaces
export interface Student {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  department?: string;
  year?: number;
}

export const studentService = {
  getStudentInfo: async () => {
    try {
      const response = await axios.get("/students/my-info");
      return response;
    } catch (error) {
      console.error("Get student info error:", error);
      throw error;
    }
  },

  getStudentById: async (id: string) => {
    try {
      const response = await axios.get(`/students/${id}`);
      return response;
    } catch (error) {
      console.error("Get student by id error:", error);
      throw error;
    }
  },

  getAllStudents: async (params?: any) => {
    try {
      const response = await axios.get("/students", { params });
      return response;
    } catch (error) {
      console.error("Get all students error:", error);
      throw error;
    }
  },

  getStudentGrades: async (studentId: string) => {
    try {
      const response = await axios.get(`/students/${studentId}/grades`);
      return response;
    } catch (error) {
      console.error("Get student grades error:", error);
      throw error;
    }
  },

  getStudentSchedule: async (studentId: string) => {
    try {
      const response = await axios.get(`/students/${studentId}/schedule`);
      return response;
    } catch (error) {
      console.error("Get student schedule error:", error);
      throw error;
    }
  },

  getStudentNotes: async (studentId: string) => {
    try {
      const response = await axios.get(`/students/${studentId}/notes`);
      return response;
    } catch (error) {
      console.error("Get student notes error:", error);
      throw error;
    }
  },

  getStudentBankInfo: async (studentId: string) => {
    try {
      const response = await axios.get(`/students/${studentId}/bank-info`);
      return response;
    } catch (error) {
      console.error("Get student bank info error:", error);
      throw error;
    }
  },

  updateStudentInfo: async (id: string, data: any) => {
    try {
      const response = await axios.put(`/students/${id}`, data);
      return response;
    } catch (error) {
      console.error("Update student info error:", error);
      throw error;
    }
  },

  updateStudentBankInfo: async (id: string, data: any) => {
    try {
      const response = await axios.put(`/students/${id}/bank-info`, data);
      return response;
    } catch (error) {
      console.error("Update student bank info error:", error);
      throw error;
    }
  },

  createStudent: async (data: Student) => {
    try {
      const response = await axios.post("/students", data);
      return response;
    } catch (error) {
      console.error("Create student error:", error);
      throw error;
    }
  },

  deleteStudent: async (id: string) => {
    try {
      const response = await axios.delete(`/students/${id}`);
      return response;
    } catch (error) {
      console.error("Delete student error:", error);
      throw error;
    }
  },

  exportStudentData: async (params?: any) => {
    try {
      const response = await axios.get("/students/export", {
        params,
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error("Export student data error:", error);
      throw error;
    }
  },
};
