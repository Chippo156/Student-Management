import axios from "../until/customize-axios";

export const departmentService = {
  // getAllDepartments: async (params: any) => {
  //   try {
  //     const response = await axios.get("/departments", { params });
  //     return response;
  //   } catch (error) {
  //     console.error("Get all departments error:", error);
  //     throw error;
  //   }
  // },

  // getDepartmentById: async (id: number) => {
  //   try {
  //     const response = await axios.get(`/departments/${id}`);
  //     return response;
  //   } catch (error) {
  //     console.error("Get department by id error:", error);
  //     throw error;
  //   }
  // },

  // createDepartment: async (data: { name: string; description: string }) => {
  //   try {
  //     const response = await axios.post("/departments", data);
  //     return response;
  //   } catch (error) {
  //     console.error("Create department error:", error);
  //     throw error;
  //   }
  // },

  // updateDepartment: async (id: number, data: { name: string; description: string }) => {
  //   try {
  //     const response = await axios.put(`/departments/${id}`, data);
  //     return response;
  //   } catch (error) {
  //     console.error("Update department error:", error);
  //     throw error;
  //   }
  // },

  // deleteDepartment: async (id: number) => {
  //   try {
  //     const response = await axios.delete(`/departments/${id}`);
  //     return response;
  //   } catch (error) {
  //     console.error("Delete department error:", error);
  //     throw error;
  //   }
  // },

  // getDepartmentTeachers: async (departmentId, params) => {
  //   try {
  //     const response = await axios.get(
  //       `/departments/${departmentId}/teachers`,
  //       { params }
  //     );
  //     return response;
  //   } catch (error) {
  //     console.error("Get department teachers error:", error);
  //     throw error;
  //   }
  // },

  // getDepartmentStudents: async (departmentId, params) => {
  //   try {
  //     const response = await axios.get(
  //       `/departments/${departmentId}/students`,
  //       { params }
  //     );
  //     return response;
  //   } catch (error) {
  //     console.error("Get department students error:", error);
  //     throw error;
  //   }
  // },

  // getDepartmentCourses: async (departmentId, params) => {
  //   try {
  //     const response = await axios.get(`/departments/${departmentId}/courses`, {
  //       params,
  //     });
  //     return response;
  //   } catch (error) {
  //     console.error("Get department courses error:", error);
  //     throw error;
  //   }
  // },
};
