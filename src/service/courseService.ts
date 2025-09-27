import axios from "../until/customize-axios";

export const courseService = {
  getAllCourses: async (params) => {
    try {
      const response = await axios.get("/courses", { params });
      return response;
    } catch (error) {
      console.error("Get all courses error:", error);
      throw error;
    }
  },

  getCourseById: async (id) => {
    try {
      const response = await axios.get(`/courses/${id}`);
      return response;
    } catch (error) {
      console.error("Get course by id error:", error);
      throw error;
    }
  },

  createCourse: async (data) => {
    try {
      const response = await axios.post("/courses", data);
      return response;
    } catch (error) {
      console.error("Create course error:", error);
      throw error;
    }
  },

  updateCourse: async (id, data) => {
    try {
      const response = await axios.put(`/courses/${id}`, data);
      return response;
    } catch (error) {
      console.error("Update course error:", error);
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      const response = await axios.delete(`/courses/${id}`);
      return response;
    } catch (error) {
      console.error("Delete course error:", error);
      throw error;
    }
  },

  getCourseStudents: async (courseId, params) => {
    try {
      const response = await axios.get(`/courses/${courseId}/students`, {
        params,
      });
      return response;
    } catch (error) {
      console.error("Get course students error:", error);
      throw error;
    }
  },

  addStudentToCourse: async (courseId, studentId) => {
    try {
      const response = await axios.post(
        `/courses/${courseId}/students/${studentId}`
      );
      return response;
    } catch (error) {
      console.error("Add student to course error:", error);
      throw error;
    }
  },

  removeStudentFromCourse: async (courseId, studentId) => {
    try {
      const response = await axios.delete(
        `/courses/${courseId}/students/${studentId}`
      );
      return response;
    } catch (error) {
      console.error("Remove student from course error:", error);
      throw error;
    }
  },

  getCourseLectures: async (courseId, params) => {
    try {
      const response = await axios.get(`/courses/${courseId}/lectures`, {
        params,
      });
      return response;
    } catch (error) {
      console.error("Get course lectures error:", error);
      throw error;
    }
  },

  createLecture: async (courseId, data) => {
    try {
      const response = await axios.post(`/courses/${courseId}/lectures`, data);
      return response;
    } catch (error) {
      console.error("Create lecture error:", error);
      throw error;
    }
  },

  updateLecture: async (courseId, lectureId, data) => {
    try {
      const response = await axios.put(
        `/courses/${courseId}/lectures/${lectureId}`,
        data
      );
      return response;
    } catch (error) {
      console.error("Update lecture error:", error);
      throw error;
    }
  },

  deleteLecture: async (courseId, lectureId) => {
    try {
      const response = await axios.delete(
        `/courses/${courseId}/lectures/${lectureId}`
      );
      return response;
    } catch (error) {
      console.error("Delete lecture error:", error);
      throw error;
    }
  },

  getCourseGrades: async (courseId, params) => {
    try {
      const response = await axios.get(`/courses/${courseId}/grades`, {
        params,
      });
      return response;
    } catch (error) {
      console.error("Get course grades error:", error);
      throw error;
    }
  },

  updateStudentGrade: async (courseId, studentId, data) => {
    try {
      const response = await axios.put(
        `/courses/${courseId}/students/${studentId}/grades`,
        data
      );
      return response;
    } catch (error) {
      console.error("Update student grade error:", error);
      throw error;
    }
  },
};
