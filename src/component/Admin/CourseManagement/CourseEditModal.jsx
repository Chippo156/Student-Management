import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Divider,
  Button,
  Switch,
  message,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import curriculumCourseService from '../../../service/curriculumCourseService';
import academicProgramService from '../../../service/academicProgramService';
import { departmentService } from '../../../service/departmentService'; // ✅ Import departmentService

const { Option } = Select;
const { TextArea } = Input;

const courseTypeOptions = [
  { value: 'Bắt buộc', label: 'Bắt buộc' },
  { value: 'Tự chọn', label: 'Tự chọn' },
];

/**
 * CourseEditModal - Modal chỉnh sửa thông tin môn học
 */
const CourseEditModal = ({ open, onCancel, onSave, course, loading }) => {
  const theme = useTheme();
  const [form] = Form.useForm();
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availablePrerequisites, setAvailablePrerequisites] = useState([]);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);

  const colors = {
    primary: theme.palette.primary.main,
    primaryLight: alpha(theme.palette.primary.main, 0.1),
  };

  // Load programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const result = await academicProgramService.getAllPrograms({
          pageSize: 100,
        });
        if (result) {
          setPrograms(result.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      }
    };
    fetchPrograms();
  }, []);

  // ✅ Load departments - SỬA LẠI
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const result = await departmentService.getDepartmentsDropdown();
        if (result && Array.isArray(result)) {
          setDepartments(result);
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  // Load available prerequisites
  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const result = await curriculumCourseService.getAllCurriculumCourses({
          pageSize: 500,
        });
        if (result && result.items) {
          // Filter out current course from prerequisites
          const filtered = result.items.filter(
            (c) => c.curriculumCourseId !== course?.curriculumCourseId
          );
          setAvailablePrerequisites(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch prerequisites:', error);
      }
    };
    if (open) {
      fetchPrerequisites();
    }
  }, [open, course]);

  // Set initial values
  useEffect(() => {
    if (course && open) {
      form.setFieldsValue({
        courseCode: course.courseCode,
        courseName: course.courseName,
        courseType: course.courseType,
        totalCredits: course.totalCredits,
        creditsTheory: course.creditsTheory,
        creditsLab: course.creditsLab,
        semesterSuggested: course.semesterSuggested,
        academicProgramId: course.academicProgramId,
        departmentId: course.departmentId,
        description: course.description,
        prerequisites:
          course.prerequisites?.map((p) => p.curriculumCourseId) || [],
      });
      setSelectedPrerequisites(course.prerequisites || []);
    }
  }, [course, open, form]);

  const handleFinish = async (values) => {
    // Validate tổng tín chỉ
    const totalCredits = values.totalCredits || 0;
    const creditsTheory = values.creditsTheory || 0;
    const creditsLab = values.creditsLab || 0;

    if (creditsTheory + creditsLab > totalCredits) {
      message.error(
        `Tổng tín chỉ lý thuyết (${creditsTheory}) + thực hành (${creditsLab}) = ${creditsTheory + creditsLab} không được vượt quá tổng tín chỉ (${totalCredits})!`
      );
      return;
    }

    try {
      // ✅ Build payload đầy đủ
      const payload = {
        curriculumCourseId: course.curriculumCourseId,
        courseName: values.courseName,
        courseCode: values.courseCode,
        courseType: values.courseType,
        totalCredits: values.totalCredits,
        creditsTheory: values.creditsTheory,
        creditsLab: values.creditsLab,
        isRequired: values.courseType === 'Bắt buộc', // ✅ Convert từ courseType
        semesterSuggested: values.semesterSuggested,
        academicProgramId: values.academicProgramId,
        departmentId: values.departmentId,
        description: values.description || null,
        prerequisites: values.prerequisites || [],
      };

      console.log('📦 Update payload:', payload);

      const result =
        await curriculumCourseService.updateCurriculumCourse(payload);
      if (result) {
        message.success('Cập nhật môn học thành công!');
        onSave(result);
      }
    } catch (error) {
      console.error('❌ Failed to update course:', error);
    }
  };

  const handleProgramChange = (programId) => {
    form.setFieldsValue({
      degreeLevel: programs.find((p) => p.academicProgramId === programId)
        ?.degreeLevel,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      title={
        <div style={{ fontWeight: 700, fontSize: 22, color: colors.primary }}>
          <EditOutlined /> Chỉnh sửa môn học
        </div>
      }
      bodyStyle={{
        padding: 0,
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
      destroyOnClose
    >
      <div style={{ borderRadius: 16, padding: 32 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ isRequired: false }}
        >
          {/* Thông tin cơ bản */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            📚 Thông tin cơ bản
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mã môn học"
                name="courseCode"
                normalize={(value) => value?.toUpperCase()}
                rules={[
                  { required: true, message: 'Bắt buộc nhập mã môn học' },
                  { min: 3, max: 20, message: 'Mã môn học từ 3-20 ký tự' },
                  {
                    pattern: /^[A-Z0-9]+$/,
                    message: 'Mã môn học chỉ chứa chữ và số',
                  },
                ]}
              >
                <Input
                  placeholder="VD: CS101"
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên môn học"
                name="courseName"
                rules={[
                  { required: true, message: 'Bắt buộc nhập tên môn học' },
                  { min: 5, max: 200, message: 'Tên môn học từ 5-200 ký tự' },
                ]}
              >
                <Input placeholder="VD: Lập trình cơ bản" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Loại môn học"
                name="courseType"
                rules={[
                  { required: true, message: 'Bắt buộc chọn loại môn học' },
                ]}
              >
                <Select placeholder="Chọn loại môn học">
                  {courseTypeOptions.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Học kỳ đề xuất"
                name="semesterSuggested"
                rules={[{ required: true, message: 'Bắt buộc chọn học kỳ' }]}
              >
                <Select placeholder="Chọn học kỳ">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <Option key={sem} value={sem}>
                      Học kỳ {sem}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin tín chỉ */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            🎯 Thông tin tín chỉ
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Tổng tín chỉ"
                name="totalCredits"
                rules={[
                  { required: true, message: 'Bắt buộc nhập tổng tín chỉ' },
                  {
                    type: 'number',
                    min: 1,
                    max: 10,
                    message: 'Tín chỉ từ 1-10',
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  placeholder="VD: 3"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Tín chỉ lý thuyết"
                name="creditsTheory"
                rules={[
                  {
                    required: true,
                    message: 'Bắt buộc nhập tín chỉ lý thuyết',
                  },
                  {
                    type: 'number',
                    min: 0,
                    max: 10,
                    message: 'Tín chỉ lý thuyết từ 0-10',
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={10}
                  placeholder="VD: 2"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Tín chỉ thực hành"
                name="creditsLab"
                rules={[
                  {
                    required: true,
                    message: 'Bắt buộc nhập tín chỉ thực hành',
                  },
                  {
                    type: 'number',
                    min: 0,
                    max: 10,
                    message: 'Tín chỉ thực hành từ 0-10',
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={10}
                  placeholder="0"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Thông tin chương trình */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            🎓 Thông tin chương trình
          </Divider>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Chương trình đào tạo"
                name="academicProgramId"
                rules={[
                  {
                    required: true,
                    message: 'Bắt buộc chọn chương trình đào tạo',
                  },
                ]}
              >
                <Select
                  placeholder="Chọn chương trình đào tạo"
                  onChange={handleProgramChange}
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {programs.map((program) => (
                    <Option
                      key={program.academicProgramId}
                      value={program.academicProgramId}
                    >
                      {program.programName} ({program.degreeLevel})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Khoa/Chuyên ngành"
                name="departmentId"
                rules={[
                  {
                    required: true,
                    message: 'Bắt buộc chọn khoa/chuyên ngành',
                  },
                ]}
              >
                <Select
                  placeholder="Chọn khoa/chuyên ngành"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {departments.map((dept) => (
                    <Option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Môn tiên quyết */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            🔗 Môn tiên quyết
          </Divider>
          <Form.Item name="prerequisites" label="Chọn môn tiên quyết">
            <Select
              mode="multiple"
              placeholder="Chọn các môn tiên quyết"
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {availablePrerequisites.map((prereq) => (
                <Option
                  key={prereq.curriculumCourseId}
                  value={prereq.curriculumCourseId}
                >
                  {prereq.courseCode} - {prereq.courseName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Mô tả */}
          <Divider orientation="left" style={{ color: colors.primary }}>
            📝 Mô tả môn học
          </Divider>
          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết về môn học..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          {/* Buttons */}
          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CourseEditModal;
