import axios from "../until/customize-axios";

export const teacherService = {
  getTeacherInfo: async () => {
    try {
      const response = await axios.get("/teachers/my-info");
      return response;
    } catch (error) {
      console.error("Get teacher info error:", error);
      throw error;
    }
  },

  getTeacherById: async (id) => {
    try {
      const response = await axios.get(`/teachers/${id}`);
      return response;
    } catch (error) {
      console.error("Get teacher by id error:", error);
      throw error;
    }
  },

  getAllTeachers: async (params) => {
    try {
      const response = await axios.get("/teachers", { params });
      return response;
    } catch (error) {
      console.error("Get all teachers error:", error);
      throw error;
    }
  },

  getTeacherCourses: async (teacherId, params) => {
    try {
      const response = await axios.get(`/teachers/${teacherId}/courses`, {
        params,
      });
      return response;
    } catch (error) {
      console.error("Get teacher courses error:", error);
      throw error;
    }
  },

  getTeacherSchedule: async (teacherId, params) => {
    try {
      const response = await axios.get(`/teachers/${teacherId}/schedule`, {
        params,
      });
      return response;
    } catch (error) {
      console.error("Get teacher schedule error:", error);
      throw error;
    }
  },

  updateTeacherInfo: async (id, data) => {
    try {
      const response = await axios.put(`/teachers/${id}`, data);
      return response;
    } catch (error) {
      console.error("Update teacher info error:", error);
      throw error;
    }
  },

  createTeacher: async (data) => {
    try {
      const response = await axios.post("/teachers", data);
      return response;
    } catch (error) {
      console.error("Create teacher error:", error);
      throw error;
    }
  },

  deleteTeacher: async (id) => {
    try {
      const response = await axios.delete(`/teachers/${id}`);
      return response;
    } catch (error) {
      console.error("Delete teacher error:", error);
      throw error;
    }
  },

  assignCourseToTeacher: async (teacherId, courseId) => {
    try {
      const response = await axios.post(
        `/teachers/${teacherId}/courses/${courseId}`
      );
      return response;
    } catch (error) {
      console.error("Assign course to teacher error:", error);
      throw error;
    }
  },

  removeCourseFromTeacher: async (teacherId, courseId) => {
    try {
      const response = await axios.delete(
        `/teachers/${teacherId}/courses/${courseId}`
      );
      return response;
    } catch (error) {
      console.error("Remove course from teacher error:", error);
      throw error;
    }
  },
};
