import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Select,
  message,
  Typography,
  Row,
  Col,
  Card,
  Modal,
  Spin,
  Radio,
} from "antd";
import {
  BookOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { Box } from "@mui/material";
import sectionService from "../../../service/sectionService";
import enrollmentService from "../../../service/enrollmentService";
import { semesterService } from "../../../service/semesterService";
import curriculumCourseService from "../../../service/curriculumCourseService";

const { Title } = Typography;
const { Option } = Select;

const RegisterCourses = () => {
  const [semesters, setSemesters] = useState([]);
  const [semester, setSemester] = useState(null);
  const [registerType, setRegisterType] = useState("new");
  const [courses, setCourses] = useState([]); // danh sách môn học
  const [sections, setSections] = useState([]); // danh sách lớp học phần
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // ===== LOAD DANH SÁCH HỌC KỲ =====
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        const res = await semesterService.getSemesterByStudentAndAcceptRegister();
        if (res && Array.isArray(res)) {
          const mapped = res.map((s) => ({
            label: `${s.term} (${s.year})`,
            value: s.semesterId,
          }));
          setSemesters(mapped);
          setSemester(mapped[0]?.value || null);
        }
      } catch {
        message.error("Không thể tải danh sách học kỳ!");
      } finally {
        setLoading(false);
      }
    };
    fetchSemesters();
  }, []);

  // ===== LOAD MÔN HỌC THEO HỌC KỲ + LOẠI ĐĂNG KÝ =====
  useEffect(() => {
    const fetchCourses = async () => {
      if (!semester) return;
      try {
        setLoading(true);
        // map type string sang số (API yêu cầu)
        const filterType =
          registerType === "new" ? 1 : registerType === "retake" ? 2 : 3;
        const res = await curriculumCourseService.getCoursesByStudentDepartment(
          semester,
          filterType
        );
        if (res) {
          setCourses(res);
        } else {
          message.warning("Không có môn học nào cho học kỳ này!");
          setCourses([]);
        }
      } catch (err) {
        message.error(err.message || "Lỗi tải môn học!");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [semester, registerType]);

  // ===== KHI CHỌN MỘT MÔN HỌC =====
  const handleCourseSelect = async (record) => {
    setSelectedCourse(record);
    setSelectedSection(null);
    setSchedule([]);
    try {
      setLoading(true);
      const data = await sectionService.getSectionsByCurriculumCourseAndSemester(
        record.curriculumCourseId,
        semester
      );
      if (data && data.length > 0) {
        setSections(data);
      } else {
        message.warning("Không tìm thấy lớp học phần!");
        setSections([]);
      }
    } catch (err) {
      message.error(err.message || "Lỗi tải lớp học phần!");
    } finally {
      setLoading(false);
    }
  };

  // ===== KHI CHỌN LỚP HỌC PHẦN =====
  const handleSectionSelect = async (record) => {
    setSelectedSection(record);
    try {
      setLoading(true);
      const data = await sectionService.getSectionScheduleWithRegistration(
        record.sectionId
      );
      if (data && data.schedules) {
        setSchedule(data.schedules);
      } else {
        message.warning("Không tìm thấy lịch học!");
        setSchedule([]);
      }
    } catch (err) {
      message.error(err.message || "Lỗi tải lịch học!");
    } finally {
      setLoading(false);
    }
  };

  // ===== ĐĂNG KÝ HỌC PHẦN =====
  const handleEnroll = async () => {
    if (!selectedSection) return message.warning("Vui lòng chọn lớp học phần!");
    try {
      setLoading(true);
      await enrollmentService.enrollInCourse({
        sectionId: selectedSection.sectionId,
      });
      message.success("Đăng ký học phần thành công!");
    } catch (err) {
      message.error(err.message || "Đăng ký học phần thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // ===== CỘT MÔN HỌC =====
  const courseColumns = [
    { title: "Mã HP", dataIndex: "courseCode", width: 120 },
    { title: "Tên học phần", dataIndex: "courseName", width: 250 },
    { title: "Tín chỉ", dataIndex: "totalCredits", align: "center", width: 100 },
    { title: "Khoa", dataIndex: "facultyName", width: 180 },
    {
      title: "Bắt buộc",
      dataIndex: "isRequired",
      align: "center",
      render: (v) => (v ? "Có" : "Không"),
      width: 100,
    },
  ];

  // ===== CỘT LỚP HỌC PHẦN =====
  const sectionColumns = [
    { title: "Mã lớp", dataIndex: "sectionCode", width: 120 },
    { title: "Giảng viên", dataIndex: "lecturerName", width: 180 },
    {
      title: "Sĩ số tối đa",
      dataIndex: "maxCapacity",
      align: "center",
      width: 100,
    },
    {
      title: "Đã đăng ký",
      dataIndex: "currentEnrollment",
      align: "center",
      width: 100,
    },
    {
      title: "Còn lại",
      dataIndex: "remainingSlots",
      align: "center",
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "isRegistrationOpen",
      align: "center",
      render: (v) =>
        v ? (
          <span style={{ color: "green", fontWeight: 500 }}>Mở đăng ký</span>
        ) : (
          <span style={{ color: "red", fontWeight: 500 }}>Đã khóa</span>
        ),
    },
  ];

  // ===== CỘT LỊCH HỌC =====
  const scheduleColumns = [
    { title: "Thứ", dataIndex: "dayOfWeekName", width: 80 },
    { title: "Bắt đầu", dataIndex: "startTime", width: 100 },
    { title: "Kết thúc", dataIndex: "endTime", width: 100 },
    { title: "Phòng", dataIndex: "room", width: 120 },
    { title: "Loại", dataIndex: "scheduleTypeName", width: 150 },
  ];

  return (
    <Box sx={{ background: "#f4f6fb", minHeight: "100vh", p: 3 }}>
      <Card
        style={{
          maxWidth: 1150,
          margin: "0 auto",
          borderRadius: 12,
          border: "none",
          boxShadow: "0 2px 12px #e6e6e6",
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Title
          level={3}
          style={{
            color: "#1677ff",
            textAlign: "center",
            marginBottom: 28,
            fontWeight: 700,
          }}
        >
          <BookOutlined style={{ marginRight: 10 }} />
          ĐĂNG KÝ HỌC PHẦN
        </Title>

        {/* HỌC KỲ + LOẠI ĐĂNG KÝ */}
        <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <span style={{ fontWeight: 500 }}>Học kỳ:</span>
            <Select
              value={semester}
              onChange={setSemester}
              style={{ width: 220, marginLeft: 8 }}
              options={semesters}
              placeholder="Chọn học kỳ"
            />
          </Col>
          <Col>
            <span style={{ marginLeft: 24, fontWeight: 500 }}>Loại đăng ký:</span>
            <Radio.Group
              value={registerType}
              onChange={(e) => setRegisterType(e.target.value)}
              style={{ marginLeft: 12 }}
            >
              <Radio value="new">Học mới</Radio>
              <Radio value="retake">Học lại</Radio>
              <Radio value="improve">Học cải thiện</Radio>
            </Radio.Group>
          </Col>
        </Row>

        {/* DANH SÁCH MÔN HỌC */}
        <Card
          title={
            <span style={{ color: "#f57c00", fontWeight: 600, fontSize: 16 }}>
              <AppstoreAddOutlined style={{ marginRight: 8, color: "#f57c00" }} />
              DANH SÁCH MÔN HỌC
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Spin spinning={loading}>
            <Table
              rowSelection={{
                type: "radio",
                selectedRowKeys: selectedCourse
                  ? [selectedCourse.curriculumCourseId]
                  : [],
                onChange: (_, rows) => handleCourseSelect(rows[0]),
              }}
              columns={courseColumns}
              dataSource={courses.map((c) => ({
                ...c,
                key: c.curriculumCourseId,
              }))}
              pagination={false}
              size="small"
              bordered
              locale={{ emptyText: "Không có môn học" }}
            />
          </Spin>
        </Card>

        {/* DANH SÁCH LỚP HỌC PHẦN */}
        {selectedCourse && (
          <Card
            title={
              <span style={{ color: "#f57c00", fontWeight: 600, fontSize: 16 }}>
                <AppstoreAddOutlined
                  style={{ marginRight: 8, color: "#f57c00" }}
                />
                DANH SÁCH LỚP HỌC PHẦN
              </span>
            }
            style={{ marginBottom: 24 }}
          >
            <Table
              rowSelection={{
                type: "radio",
                selectedRowKeys: selectedSection
                  ? [selectedSection.sectionId]
                  : [],
                onChange: (_, rows) => handleSectionSelect(rows[0]),
              }}
              columns={sectionColumns}
              dataSource={sections.map((s) => ({ ...s, key: s.sectionId }))}
              pagination={false}
              size="small"
              bordered
              locale={{
                emptyText: "Chưa có lớp học phần cho môn này",
              }}
            />
          </Card>
        )}

        {/* CHI TIẾT LỊCH HỌC */}
        {selectedSection && (
          <Card
            title={
              <span style={{ color: "#f57c00", fontWeight: 600, fontSize: 16 }}>
                <UnorderedListOutlined
                  style={{ marginRight: 8, color: "#f57c00" }}
                />
                LỊCH HỌC CỦA LỚP HỌC PHẦN
              </span>
            }
          >
            <Table
              columns={scheduleColumns}
              dataSource={schedule.map((s, i) => ({ ...s, key: i + 1 }))}
              pagination={false}
              bordered
              size="small"
              locale={{ emptyText: "Không có lịch học" }}
            />
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <Button
                type="primary"
                icon={<CheckSquareOutlined />}
                onClick={handleEnroll}
                disabled={!selectedSection}
              >
                Đăng ký học phần
              </Button>
            </div>
          </Card>
        )}
      </Card>

      {/* MODAL XEM LỊCH HỌC */}
      <Modal
        open={showScheduleModal}
        onCancel={() => setShowScheduleModal(false)}
        footer={<Button onClick={() => setShowScheduleModal(false)}>Đóng</Button>}
        title="Lịch học phần chi tiết"
      >
        <Table
          columns={scheduleColumns}
          dataSource={schedule.map((s, i) => ({ ...s, key: i + 1 }))}
          pagination={false}
          size="small"
        />
      </Modal>
    </Box>
  );
};

export default RegisterCourses;
