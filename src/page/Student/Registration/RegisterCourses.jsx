import React, { useEffect, useState } from 'react';
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
  Tag,
  Checkbox,
} from 'antd';
import {
  UnorderedListOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';
import { Box } from '@mui/material';
import sectionService from '../../../service/sectionService';
import enrollmentService from '../../../service/enrollmentService';
import { semesterService } from '../../../service/semesterService';
import curriculumCourseService from '../../../service/curriculumCourseService';
import { Dropdown, Menu, Popconfirm } from 'antd';

const { Title } = Typography;

const RegisterCourses = () => {
  const [semesters, setSemesters] = useState([]);
  const [semester, setSemester] = useState(null);
  const [registerType, setRegisterType] = useState('new');
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [enrolledSections, setEnrolledSections] = useState([]);
  const [showOnlyNonConflict, setShowOnlyNonConflict] = useState(false);
  const [practiceGroups, setPracticeGroups] = useState([]);
  const [selectedPracticeGroup, setSelectedPracticeGroup] = useState(null);
  const [modalSchedule, setModalSchedule] = useState([]); // Thêm state riêng cho modal

  // ===== LOAD DANH SÁCH HỌC KỲ =====
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true);
        const res =
          await semesterService.getSemesterByStudentAndAcceptRegister();
        if (res && Array.isArray(res)) {
          const mapped = res.map((s) => ({
            label: `${s.term} (${s.year})`,
            value: s.semesterId,
          }));
          setSemesters(mapped);
          setSemester(mapped[0]?.value || null);
        }
      } catch {
        message.error('Không thể tải danh sách học kỳ!');
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
        const filterType =
          registerType === 'new' ? 1 : registerType === 'retake' ? 2 : 3;
        const res = await curriculumCourseService.getCoursesByStudentDepartment(
          semester,
          filterType
        );
        if (res && Array.isArray(res)) {
          setCourses(
            res.map((c) => ({
              ...c,
              prerequisites: c.prerequisites || [],
              registrationNote: c.registrationNote || '',
            }))
          );
        } else {
          message.warning('Không có môn học nào cho học kỳ này!');
          setCourses([]);
        }
      } catch (err) {
        message.error(err.message || 'Lỗi tải môn học!');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [semester, registerType]);

  // ===== LẤY DANH SÁCH LỚP HỌC PHẦN ĐÃ ĐĂNG KÝ TRONG KỲ =====
  useEffect(() => {
    const fetchEnrolledSections = async () => {
      if (!semester) return;
      try {
        setLoading(true);
        const res = await enrollmentService.getEnrolledByStudent(semester);
        setEnrolledSections(res || []);
      } catch (err) {
        setEnrolledSections([]);
        message.error('Không thể tải lớp học phần đã đăng ký!');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrolledSections();
  }, [semester]);
  useEffect(() => {
    setSelectedCourse(null);
    setSelectedSection(null);
    setSections([]);
    setSchedule([]);
    setPracticeGroups([]);
    setSelectedPracticeGroup(null);
  }, [semester, registerType]);
  // ===== KHI CHỌN MỘT MÔN HỌC =====
  const handleCourseSelect = async (record) => {
    setSelectedCourse(record);
    setSelectedSection(null);
    setSchedule([]);
    try {
      setLoading(true);
      const data =
        await sectionService.getSectionsByCurriculumCourseAndSemester(
          record.curriculumCourseId,
          semester
        );
      if (data && data.length > 0) {
        setSections(data);
      } else {
        message.warning('Không tìm thấy lớp học phần!');
        setSections([]);
      }
    } catch (err) {
      message.error(err.message || 'Lỗi tải lớp học phần!');
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
        setSchedule(data.schedules); // Lịch lý thuyết (chỉ 1)
        setPracticeGroups(data.practiceGroups || []);
        // Nếu chỉ có 1 nhóm thực hành thì tự chọn luôn
        if (data.practiceGroups && data.practiceGroups.length === 1) {
          setSelectedPracticeGroup(data.practiceGroups[0].practiceGroupId);
        } else {
          setSelectedPracticeGroup(
            data.studentCurrentPracticeGroup
              ? data.studentCurrentPracticeGroup
              : null
          );
        }
      } else {
        message.warning('Không tìm thấy lịch học!');
        setSchedule([]);
        setPracticeGroups([]);
        setSelectedPracticeGroup(null);
      }
    } catch (err) {
      message.error(err.message || 'Lỗi tải lịch học!');
    } finally {
      setLoading(false);
    }
  };

  // ===== ĐĂNG KÝ HỌC PHẦN =====
  const handleEnroll = async () => {
    if (!selectedSection) return message.warning('Vui lòng chọn lớp học phần!');
    try {
      setLoading(true);
      await enrollmentService.enrollInCourse({
        sectionId: selectedSection.sectionId,
        practiceGroupId:
          practiceGroups.length > 0 ? selectedPracticeGroup : null,
      });
      message.success('Đăng ký học phần thành công!');
      // Gọi lại để lấy danh sách lớp học phần đã đăng ký trong kỳ này
      const res = await enrollmentService.getEnrolledByStudent(semester);
      setEnrolledSections(res || []);
    } catch (err) {
      message.error(err.message || 'Đăng ký học phần thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // ===== HỦY ĐĂNG KÝ HỌC PHẦN =====
  const handleDropEnrollment = async (sectionId) => {
    try {
      setLoading(true);
      await enrollmentService.dropEnrollmentStudent(sectionId);
      message.success('Hủy đăng ký học phần thành công!');
      // Gọi lại để lấy danh sách lớp học phần đã đăng ký trong kỳ này
      const res = await enrollmentService.getEnrolledByStudent(semester);
      setEnrolledSections(res || []);
    } catch (err) {
      message.error(err.message || 'Hủy đăng ký học phần thất bại!');
    } finally {
      setLoading(false);
    }
  };

  // ===== ĐỔI NHÓM THỰC HÀNH =====
  const handlePracticeGroupChange = (groupId) => {
    setSelectedPracticeGroup(groupId);
  };

  // ===== CỘT MÔN HỌC CHỜ ĐĂNG KÝ =====
  const courseColumns = [
    {
      title: 'STT',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      render: (_, __, i) => i + 1,
    },
    { title: 'Mã HP', dataIndex: 'courseCode', align: 'center', width: 110 },
    { title: 'Tên môn học', dataIndex: 'courseName', width: 250 },
    {
      title: 'TC',
      dataIndex: 'totalCredits',
      align: 'center',
      width: 60,
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'isRequired',
      align: 'center',
      width: 80,
      render: (v) =>
        v ? (
          <CheckSquareOutlined style={{ color: '#52c41a', fontSize: 18 }} />
        ) : (
          <DeleteOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
        ),
    },
    {
      title: 'Học phần tiên quyết',
      dataIndex: 'prerequisites',
      width: 200,
      render: (arr) =>
        arr && arr.length
          ? arr.map((p) => `${p.courseCode} (${p.courseName})`).join(', ')
          : '',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'registrationNote',
      width: 180,
      render: (v) => <span style={{ color: '#d32f2f' }}>{v}</span>,
    },
  ];

  // ===== CỘT LỚP HỌC PHẦN CHỜ ĐĂNG KÝ (SỬA THEO API MỚI) =====
  const sectionColumns = [
    {
      title: '',
      dataIndex: 'radio',
      align: 'center',
      width: 15,
      render: (_, record) => (
        <Radio
          checked={selectedSection?.sectionId === record.sectionId}
          onChange={() => handleSectionSelect(record)}
        />
      ),
    },
    {
      title: 'STT',
      dataIndex: 'index',
      align: 'center',
      width: 15,
      render: (_, __, i) => i + 1,
    },
    { title: 'Mã LHP', dataIndex: 'sectionId', align: 'center', width: 30 },
    {
      title: 'Tên môn học',
      dataIndex: 'courseName',
      align: 'center',
      width: 100,
    },
    {
      title: 'Lớp dự kiến',
      dataIndex: 'className',
      align: 'center',
      width: 40,
    },
    { title: 'Giảng viên', dataIndex: 'lecturerName', width: 80 },

    {
      title: 'Sĩ số tối đa',
      dataIndex: 'maxCapacity',
      align: 'center',
      width: 30,
    },
    {
      title: 'Đã đăng ký',
      dataIndex: 'currentEnrollment',
      align: 'center',
      width: 30,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isRegistrationOpen',
      align: 'center',
      width: 50,
      render: (v) =>
        v ? (
          <span style={{ color: 'green', fontWeight: 500 }}>Mở đăng ký</span>
        ) : (
          <span style={{ color: 'red', fontWeight: 500 }}>Đã khóa</span>
        ),
    },
    // {
    //   title: 'Tín chỉ LT',
    //   dataIndex: 'creditsTheory',
    //   align: 'center',
    //   width: 80,
    // },
    // {
    //   title: 'Tín chỉ TH',
    //   dataIndex: 'creditsLab',
    //   align: 'center',
    //   width: 80,
    // },
    // { title: 'Tổng TC', dataIndex: 'totalCredits', align: 'center', width: 80 },
  ];

  // ===== CỘT LỚP HỌC PHẦN ĐÃ ĐĂNG KÝ =====
  const enrolledColumns = [
    {
      title: 'Thao tác',
      dataIndex: 'action',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          overlay={
            <Menu>
              <Menu.Item
                key="detail"
                onClick={() => {
                  // Tạo dữ liệu lịch học riêng cho modal, không ảnh hưởng state chính
                  setModalSchedule(
                    (record.dayOfWeek || '').split(',').map((day, idx) => ({
                      key: idx + 1,
                      dayOfWeekName: day,
                      startTime:
                        (record.timeSlot || '')
                          .split(',')
                          [idx]?.split('-')[0] || '',
                      endTime:
                        (record.timeSlot || '')
                          .split(',')
                          [idx]?.split('-')[1] || '',
                      room: (record.room || '').split(',')[idx] || '',
                      lecturerName: record.lecturerName,
                      scheduleTypeName: record.scheduleTypeName || '',
                    }))
                  );
                  setShowScheduleModal(true);
                }}
              >
                <UnorderedListOutlined style={{ marginRight: 8 }} />
                Xem chi tiết
              </Menu.Item>
              <Menu.Item key="drop" danger>
                <Popconfirm
                  title="Bạn chắc chắn muốn hủy đăng ký lớp học phần này?"
                  okText="Hủy đăng ký"
                  cancelText="Không"
                  onConfirm={() => handleDropEnrollment(record.sectionId)}
                >
                  <DeleteOutlined style={{ marginRight: 8 }} />
                  Hủy đăng ký
                </Popconfirm>
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon={<UnorderedListOutlined />} size="small">
            Thao tác
          </Button>
        </Dropdown>
      ),
    },
    {
      title: 'STT',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      render: (_, __, i) => i + 1,
    },
    { title: 'Mã LHP', dataIndex: 'sectionCode', align: 'center', width: 120 },
    { title: 'Tên môn học', dataIndex: 'courseName', width: 200 },
    {
      title: 'Lớp học dự kiến',
      dataIndex: 'expectedClass',
      align: 'center',
      width: 120,
    },
    { title: 'Số TC', dataIndex: 'credits', align: 'center', width: 70 },
    { title: 'Nhóm TH', dataIndex: 'labGroup', align: 'center', width: 80 },
    {
      title: 'Học phí',
      dataIndex: 'tuitionFee',
      align: 'right',
      width: 110,
      render: (v) => v?.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'paymentDeadline',
      align: 'center',
      width: 110,
      render: (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : ''),
    },
    {
      title: 'Thu',
      dataIndex: 'isPaid',
      align: 'center',
      width: 60,
      render: () => (
        <span>
          <CheckSquareOutlined style={{ color: '#52c41a' }} />
        </span>
      ),
    },
    {
      title: 'Trạng thái ĐK',
      dataIndex: 'registrationStatus',
      align: 'center',
      width: 110,
      render: (v) =>
        v === 'Đã đăng ký' ? (
          <Tag color="green">Đã đăng ký</Tag>
        ) : (
          <Tag color="red">{v}</Tag>
        ),
    },
    {
      title: 'Ngày ĐK',
      dataIndex: 'registrationDate',
      align: 'center',
      width: 110,
      render: (v) => (v ? new Date(v).toLocaleDateString('vi-VN') : ''),
    },
    {
      title: 'Trạng thái LHP',
      dataIndex: 'sectionStatus',
      align: 'center',
      width: 110,
      render: (v) =>
        v === 'Available' ? (
          <Tag color="blue">Còn mở</Tag>
        ) : (
          <Tag color="red">{v}</Tag>
        ),
    },
  ];

  // ===== CSS cho Table =====
  const tableRowClassName = (record, idx) => {
    if (selectedCourse && record.key === selectedCourse.curriculumCourseId) {
      return 'table-row-selected';
    }
    if (selectedSection && record.key === selectedSection.sectionId) {
      return 'table-row-selected';
    }
    return idx % 2 === 0 ? 'table-row-light' : 'table-row-dark';
  };

  // ===== CSS cho lịch học phần =====
  const scheduleRowClassName = (record) => {
    if (record.scheduleTypeName?.toLowerCase().includes('lý thuyết')) {
      return 'schedule-row-lythuyet';
    }
    if (record.scheduleTypeName?.toLowerCase().includes('thực hành')) {
      if (
        practiceGroups.length > 0 &&
        selectedPracticeGroup &&
        record.practiceGroupName === selectedPracticeGroup
      ) {
        return 'schedule-row-thuchanh-active';
      }
      return 'schedule-row-thuchanh';
    }
    return '';
  };

  return (
    <Box
      sx={{ background: '#f4f6fb', minHeight: '100vh', p: 3, width: '100%' }}
    >
      <style>
        {`
        .ant-table-thead > tr > th {
          background: #e3f0ff !important;
          font-weight: 600;
          text-align: center;
        }
        .table-row-light {
          background: #fff;
        }
        .table-row-dark {
          background: #f8fafd;
        }
        .table-row-selected {
          background: #fff8e1 !important;
        }
        .schedule-row-lythuyet {
          background: #e3f7ff !important;
        }
        .schedule-row-thuchanh-active {
          background: #fff7e0 !important;
        }
        .schedule-row-thuchanh {
          background: #fff !important;
        }
        `}
      </style>
      <Card
        style={{
          maxWidth: 1300,
          margin: '0 auto',
          borderRadius: 12,
          border: 'none',
          boxShadow: '0 2px 12px #e6e6e6',
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Title
          level={3}
          style={{
            color: '#1677ff',
            textAlign: 'center',
            marginBottom: 28,
            fontWeight: 700,
          }}
        >
          ĐĂNG KÝ HỌC PHẦN
        </Title>

        {/* HỌC KỲ + LOẠI ĐĂNG KÝ */}
        <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <span style={{ fontWeight: 500 }}>Đợt đăng ký</span>
            <Select
              value={semester}
              onChange={setSemester}
              style={{ width: 220, marginLeft: 8 }}
              options={semesters}
              placeholder="Chọn học kỳ"
            />
          </Col>
          <Col>
            <Radio.Group
              value={registerType}
              onChange={(e) => setRegisterType(e.target.value)}
              style={{ marginLeft: 32 }}
            >
              <Radio value="new">HỌC MỚI</Radio>
              <Radio value="retake">HỌC LẠI</Radio>
              <Radio value="improve">HỌC CẢI THIỆN</Radio>
            </Radio.Group>
          </Col>
        </Row>

        {/* MÔN HỌC PHẦN ĐANG CHỜ ĐĂNG KÝ */}
        <div
          style={{
            fontWeight: 600,
            color: '#f57c00',
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          MÔN HỌC PHẦN ĐANG CHỜ ĐĂNG KÝ
        </div>
        <Spin spinning={loading}>
          <Table
            rowSelection={{
              type: 'radio',
              selectedRowKeys: selectedCourse
                ? [selectedCourse.curriculumCourseId]
                : [],
              onChange: (_, rows) => handleCourseSelect(rows[0]),
              columnTitle: '',
            }}
            columns={courseColumns}
            dataSource={courses.map((c, i) => ({
              ...c,
              key: c.curriculumCourseId,
              index: i + 1,
            }))}
            pagination={false}
            size="small"
            bordered
            rowClassName={tableRowClassName}
            locale={{ emptyText: 'Không có môn học' }}
            scroll={{ x: 1200 }}
          />
        </Spin>

        {/* LỚP HỌC PHẦN CHỜ ĐĂNG KÝ */}
        {selectedCourse && (
          <>
            <div
              style={{
                fontWeight: 600,
                color: '#f57c00',
                fontSize: 16,
                margin: '24px 0 8px',
              }}
            >
              LỚP HỌC PHẦN CHỜ ĐĂNG KÝ
              <Checkbox
                style={{ marginLeft: 24, color: '#d32f2f', fontWeight: 500 }}
                checked={showOnlyNonConflict}
                onChange={(e) => setShowOnlyNonConflict(e.target.checked)}
              >
                HIỆN THỊ LỚP HỌC PHẦN KHÔNG TRÙNG LỊCH
              </Checkbox>
            </div>
            <Spin spinning={loading}>
              <Table
                columns={sectionColumns}
                dataSource={sections.map((s, i) => ({
                  ...s,
                  key: s.sectionId,
                  index: i + 1,
                }))}
                pagination={false}
                size="small"
                bordered
                rowClassName={tableRowClassName}
                locale={{ emptyText: 'Chưa có lớp học phần cho môn này' }}
                scroll={{ x: 1600 }}
              />
            </Spin>
          </>
        )}

        {/* CHI TIẾT LỊCH HỌC */}
        {selectedSection && (
          <Card
            title={
              <span style={{ color: '#f57c00', fontWeight: 600, fontSize: 16 }}>
                <UnorderedListOutlined
                  style={{ marginRight: 8, color: '#f57c00' }}
                />
                CHI TIẾT LỚP HỌC PHẦN
              </span>
            }
            style={{ marginTop: 24 }}
            extra={
              practiceGroups.length > 0 && (
                <Select
                  style={{ minWidth: 220 }}
                  value={selectedPracticeGroup}
                  onChange={handlePracticeGroupChange}
                  placeholder="Chọn nhóm thực hành"
                  suffixIcon={<DownOutlined />}
                  options={practiceGroups.map((g) => ({
                    value: g.practiceGroupId,
                    label: `${g.groupName} (${g.currentCount}/${g.maxCapacity})`,
                    disabled: !g.isAvailable,
                  }))}
                  allowClear
                />
              )
            }
          >
            <Table
              columns={[
                {
                  title: 'STT',
                  dataIndex: 'index',
                  width: 50,
                  align: 'center',
                  render: (_, __, i) => i + 1,
                },
                {
                  title: 'Nhóm',
                  dataIndex: 'groupName',
                  width: 110,
                  align: 'center',
                },
                {
                  title: 'Thứ',
                  dataIndex: 'dayOfWeek',
                  width: 100,
                  align: 'center',
                },
                {
                  title: 'Thời gian',
                  dataIndex: 'time',
                  width: 160,
                  align: 'center',
                  render: (_, r) =>
                    r.startTime && r.endTime
                      ? `${r.startTime} - ${r.endTime}`
                      : r.timeSlot || '',
                },
                {
                  title: 'Phòng',
                  dataIndex: 'room',
                  width: 120,
                  align: 'center',
                },
                {
                  title: 'Loại',
                  dataIndex: 'type',
                  width: 120,
                  align: 'center',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'currentCount',
                  width: 110,
                  align: 'center',
                  render: (_, r) =>
                    r.maxCapacity
                      ? `${r.currentCount || 0}/${r.maxCapacity}`
                      : '',
                },
              ]}
              dataSource={[
                // Lịch lý thuyết (chỉ 1, không có nhóm)
                ...schedule.map((s, i) => ({
                  key: `lythuyet-${i}`,
                  index: i + 1,
                  groupName: '', // Không có nhóm
                  dayOfWeek: s.dayOfWeekName,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  room: s.room,
                  type: s.scheduleTypeName,
                  currentCount: '',
                  maxCapacity: '',
                })),
                // Hiển thị tất cả nhóm thực hành
                ...practiceGroups.flatMap((group, gi) =>
                  (group.schedules || []).map((s, si) => {
                    let startTime = '';
                    let endTime = '';
                    if (s.timeSlot) {
                      const [start, end] = s.timeSlot
                        .split('-')
                        .map((t) => t.trim());
                      startTime = start || '';
                      endTime = end || '';
                    }
                    return {
                      key: `thuchanh-${group.practiceGroupId}-${si}`,
                      index: schedule.length + gi + si + 1,
                      groupName: group.groupName,
                      dayOfWeek: s.dayOfWeek,
                      startTime,
                      endTime,
                      timeSlot: s.timeSlot,
                      room: s.room,
                      type: s.scheduleType,
                      currentCount: group.currentCount,
                      maxCapacity: group.maxCapacity,
                      isActive: selectedPracticeGroup === group.practiceGroupId,
                    };
                  })
                ),
              ]}
              pagination={false}
              bordered
              size="small"
              locale={{ emptyText: 'Không có lịch học' }}
              scroll={{ x: 900 }}
              rowClassName={(record) => {
                if (record.type?.toLowerCase().includes('thực hành')) {
                  return record.isActive
                    ? 'schedule-row-thuchanh-active'
                    : 'schedule-row-thuchanh';
                }
                return 'schedule-row-lythuyet';
              }}
              style={{ marginBottom: 16 }}
            />

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button
                type="primary"
                icon={<CheckSquareOutlined />}
                onClick={handleEnroll}
                disabled={
                  !selectedSection ||
                  (practiceGroups.length > 0 && !selectedPracticeGroup)
                }
              >
                Đăng ký môn học
              </Button>
            </div>
          </Card>
        )}

        {/* LỚP HỌC PHẦN ĐÃ ĐĂNG KÝ TRONG HỌC KỲ NÀY */}
        <div
          style={{
            fontWeight: 600,
            color: '#1677ff',
            fontSize: 16,
            margin: '32px 0 8px',
          }}
        >
          LỚP HỌC PHẦN ĐÃ ĐĂNG KÝ TRONG HỌC KỲ NÀY
        </div>
        <Spin spinning={loading}>
          <Table
            columns={enrolledColumns}
            dataSource={enrolledSections.map((s, i) => ({
              ...s,
              key: s.sectionCode,
              index: i + 1,
            }))}
            pagination={false}
            size="small"
            bordered
            locale={{ emptyText: 'Chưa đăng ký lớp học phần nào' }}
            scroll={{ x: 1400 }}
            rowClassName={tableRowClassName}
          />
        </Spin>
      </Card>

      {/* MODAL XEM LỊCH HỌC */}
      <Modal
        open={showScheduleModal}
        onCancel={() => setShowScheduleModal(false)}
        footer={
          <Button onClick={() => setShowScheduleModal(false)}>Đóng</Button>
        }
        title="Lịch học phần chi tiết"
      >
        <Table
          columns={[
            {
              title: 'STT',
              dataIndex: 'index',
              width: 50,
              align: 'center',
              render: (_, __, i) => i + 1,
            },
            { title: 'Thứ', dataIndex: 'dayOfWeekName', width: 120 },
            { title: 'Bắt đầu', dataIndex: 'startTime', width: 100 },
            { title: 'Kết thúc', dataIndex: 'endTime', width: 100 },
            { title: 'Phòng', dataIndex: 'room', width: 120 },
            { title: 'Loại', dataIndex: 'scheduleTypeName', width: 120 },
          ]}
          dataSource={modalSchedule.map((s, i) => ({
            ...s,
            key: i + 1,
            index: i + 1,
          }))}
          pagination={false}
          size="small"
        />
      </Modal>
    </Box>
  );
};

export default RegisterCourses;
