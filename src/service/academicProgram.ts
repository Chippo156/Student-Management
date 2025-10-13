import axios from "../until/customize-axios";
import { message } from "antd";
import {
  Department,
  AcademicProgram,
  AcademicProgramResponse,
  AcademicProgramsResponse,
} from "../types/api";
const academicProgramService = {
  getById: async (id: number): Promise<AcademicProgramResponse> => {
    const res = await axios.get(`/api/AcademicProgram/${id}`);
    if (!res.success) {
      message.error(res.message || "Lấy chương trình đào tạo thất bại");
      throw new Error(res.message || "Get academic program failed");
    }
    return res.data;
  },
  getAll: async (): Promise<AcademicProgramsResponse> => {
    const res = await axios.get("/api/AcademicProgram");
    if (!res.success) {
      message.error(res.message || "Lấy danh sách chương trình đào tạo thất bại");
      throw new Error(res.message || "Get academic programs failed");
    }
    return res.data;
  },
  create: async (body: { programName: string; degreeLevel: string; departmentId: number }): Promise<AcademicProgramResponse> => {
    const res = await axios.post("/api/AcademicProgram", body);
    if (!res.success) {
      message.error(res.message || "Thêm chương trình đào tạo thất bại");
      throw new Error(res.message || "Create academic program failed");
    }
    return res.data;
  },
  update: async (id: number, body: { programName: string; degreeLevel: string; departmentId: number }): Promise<AcademicProgramResponse> => {
    const res = await axios.put(`/api/AcademicProgram/${id}`, body);
    if (!res.success) {
      message.error(res.message || "Cập nhật chương trình đào tạo thất bại");
      throw new Error(res.message || "Update academic program failed");
    }
    return res.data;
  },
  delete: async (id: number): Promise<any> => {
    const res = await axios.delete(`/api/AcademicProgram/${id}`);
    if (!res.success) {
      message.error(res.message || "Xóa chương trình đào tạo thất bại");
      throw new Error(res.message || "Delete academic program failed");
    }
    return res.data;
  },
  getByDepartment: async (departmentId: number): Promise<AcademicProgramsResponse> => {
    const res = await axios.get(`/api/AcademicProgram/department/${departmentId}`);
    if (!res.success) {
      message.error(res.message || "Lấy chương trình đào tạo theo khoa thất bại");
      throw new Error(res.message || "Get academic programs by department failed");
    }
    return res.data;
  },
};
export default academicProgramService;