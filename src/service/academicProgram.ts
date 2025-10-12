import axios from "../until/customize-axios";
import {
  Department,
  AcademicProgram,
  AcademicProgramResponse,
  AcademicProgramsResponse,
} from "../types/api";
const academicProgramService = {
  getById: async (id: number): Promise<AcademicProgramResponse> => {
    const res = await axios.get(`/api/AcademicProgram/${id}`);
    return res;
  },
  getAll: async (): Promise<AcademicProgramsResponse> => {
    const res = await axios.get("/api/AcademicProgram");
    return res;
  },
  create: async (body: { programName: string; degreeLevel: string; departmentId: number }): Promise<AcademicProgramResponse> => {
    const res = await axios.post("/api/AcademicProgram", body);
    return res;
  },
  update: async (id: number, body: { programName: string; degreeLevel: string; departmentId: number }): Promise<AcademicProgramResponse> => {
    const res = await axios.put(`/api/AcademicProgram/${id}`, body);
    return res;
  },
  delete: async (id: number): Promise<any> => {
    const res = await axios.delete(`/api/AcademicProgram/${id}`);
    return res;
  },
  getByDepartment: async (departmentId: number): Promise<AcademicProgramsResponse> => {
    const res = await axios.get(`/api/AcademicProgram/department/${departmentId}`);
    return res;
  },
};
export default academicProgramService;