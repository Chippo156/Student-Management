import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Button,
  Switch,
  message,
  Card,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { Box } from '@mui/material';
import curriculumCourseService from '../../../service/curriculumCourseService';
import academicProgramService from '../../../service/academicProgramService';
import facultyService from '../../../service/facultyService';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const courseTypeOptions = [
  { value: 'Bắt buộc', label: 'Bắt buộc' },
  { value: 'Tự chọn', label: 'Tự chọn' },
];

/**
 * CourseCreateModal - Modal tạo môn học mới
 */
const CourseCreateModal = ({ open, onCancel, onSave, loading }) => {
  const theme = useTheme();
  const [form] = Form.useForm();
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availablePrerequisites, setAvailablePrerequisites] = useState([]);

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

  // Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const result = await facultyService.getAllFaculties({
          pageSize: 100,
        });
        if (result) {
          setDepartments(result.items || []);
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
          setAvailablePrerequisites(result.items);
        }
      } catch (error) {
        console.error('Failed to fetch prerequisites:', error);
      }
    };
    if (open) {
      fetchPrerequisites();
    }
  }, [open]);

  const handleFinish = async (values) => {
    try {
      const payload = {
        ...values,
        isRequired: values.isRequired || false,
        prerequisiteIds: values.prerequisites || [],
      };

      const result =
        await curriculumCourseService.createCurriculumCourse(payload);
      if (result) {
        message.success('Tạo môn học mới thành công!');
        form.resetFields();
        onSave(result);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      message.error('Tạo môn học mới thất bại!');
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleProgramChange = (programId) => {
    form.setFieldsValue({
      degreeLevel: programs.find((p) => p.academicProgramId === programId)
        ?.degreeLevel,
    });
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      title={
        <div style={{ fontWeight: 700, fontSize: 22, color: colors.primary }}>
          <PlusOutlined /> Tạo môn học mới
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
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            📚 Thông tin cơ bản
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Mã môn học"
                  name="courseCode"
                  rules={[
                    { required: true, message: 'Bắt buộc nhập mã môn học' },
                    { min: 3, max: 20, message: 'Mã môn học từ 3-20 ký tự' },
                    {
                      pattern: /^[A-Z0-9]+$/,
                      message: 'Mã môn học chỉ chứa chữ hoa và số',
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
              <Col xs={24} md={8}>
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
              <Col xs={24} md={8}>
                <Form.Item
                  label="Loại hình"
                  name="isRequired"
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren="Bắt buộc"
                    unCheckedChildren="Tự chọn"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
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
          </Card>

          {/* Thông tin tín chỉ */}
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            ⏱️ Thông tin tín chỉ
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={6}>
                <Form.Item
                  label="Tổng tín chỉ"
                  name="totalCredits"
                  rules={[
                    { required: true, message: 'Bắt buộc nhập tổng tín chỉ' },
                    {
                      type: 'number',
                      min: 1,
                      max: 10,
                      message: 'Tổng tín chỉ từ 1-10',
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={10}
                    placeholder="0"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
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
                    placeholder="0"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
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
              <Col xs={24} md={6}>
                <Form.Item
                  label="Tín chỉ bài tập"
                  name="creditsExercise"
                  rules={[
                    {
                      type: 'number',
                      min: 0,
                      max: 10,
                      message: 'Tín chỉ bài tập từ 0-10',
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
          </Card>

          {/* Thông tin chương trình */}
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            🎓 Thông tin chương trình
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
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
                      <Option key={dept.facultyId} value={dept.facultyId}>
                        {dept.facultyName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Môn tiên quyết */}
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            🔗 Môn tiên quyết
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Form.Item name="prerequisites" label="Chọn môn tiên quyết">
              <Select
                mode="multiple"
                placeholder="Chọn các môn tiên quyết (không bắt buộc)"
                style={{ width: '100%' }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
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
          </Card>

          {/* Mô tả */}
          <Title level={4} style={{ marginBottom: 16, color: colors.primary }}>
            📝 Mô tả môn học
          </Title>
          <Card size="small" style={{ marginBottom: 24 }}>
            <Form.Item name="description" label="Mô tả chi tiết">
              <TextArea
                rows={4}
                placeholder="Nhập mô tả chi tiết về môn học..."
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Card>

          {/* Buttons */}
          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={handleReset} style={{ marginRight: 8 }}>
              Làm mới
            </Button>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo môn học
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CourseCreateModal;
