import React, { useState } from 'react';
import { Form, message, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import GraduateStatistics from '../../../component/Student/GraduatePage/GraduateStatistics';
import GraduateOverview from '../../../component/Student/GraduatePage/GraduateOverview';
import GraduateRequirements from '../../../component/Student/GraduatePage/GraduateRequirements';
import GraduateTimeline from '../../../component/Student/GraduatePage/GraduateTimeline';
import MilestoneModal from '../../../component/Student/GraduatePage/MilestoneModal';

const { Title } = Typography;

const GraduatePage = () => {
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [form] = Form.useForm();

  const [requirements] = useState([
    {
      id: '1',
      category: 'Tín chỉ bắt buộc',
      requirement: 'Tín chỉ các môn bắt buộc',
      completed: 95,
      total: 100,
      status: 'in-progress',
      description: 'Còn thiếu 5 tín chỉ môn bắt buộc',
    },
    {
      id: '2',
      category: 'Tín chỉ tự chọn',
      requirement: 'Tín chỉ các môn tự chọn',
      completed: 25,
      total: 30,
      status: 'in-progress',
      description: 'Còn thiếu 5 tín chỉ môn tự chọn',
    },
    {
      id: '3',
      category: 'Ngoại ngữ',
      requirement: 'Chứng chỉ Tiếng Anh B1',
      completed: 1,
      total: 1,
      status: 'completed',
      description: 'Đã có chứng chỉ TOEIC 650',
    },
    {
      id: '4',
      category: 'Giáo dục thể chất',
      requirement: 'Hoàn thành môn GDTC',
      completed: 4,
      total: 4,
      status: 'completed',
      description: 'Đã hoàn thành đủ 4 môn GDTC',
    },
    {
      id: '5',
      category: 'Khóa luận',
      requirement: 'Khóa luận tốt nghiệp',
      completed: 0,
      total: 1,
      status: 'not-started',
      description: 'Chưa đăng ký khóa luận',
    },
    {
      id: '6',
      category: 'Thực tập',
      requirement: 'Thực tập tốt nghiệp',
      completed: 0,
      total: 1,
      status: 'not-started',
      description: 'Chưa thực hiện thực tập',
    },
  ]);

  const [milestones, setMilestones] = useState([
    {
      id: '1',
      title: 'Nộp hồ sơ xét tốt nghiệp',
      date: '2025-03-15',
      status: 'upcoming',
      description: 'Nộp hồ sơ xét tốt nghiệp tại phòng đào tạo',
      documents: [
        'Đơn xin xét tốt nghiệp',
        'Bản sao bằng tốt nghiệp THPT',
        'Chứng chỉ ngoại ngữ',
      ],
    },
    {
      id: '2',
      title: 'Đăng ký khóa luận tốt nghiệp',
      date: '2025-02-01',
      status: 'upcoming',
      description: 'Đăng ký đề tài và giảng viên hướng dẫn',
      documents: ['Đơn đăng ký khóa luận', 'Đề cương khóa luận'],
    },
    {
      id: '3',
      title: 'Hoàn thành học phần cuối kỳ',
      date: '2025-01-20',
      status: 'upcoming',
      description: 'Hoàn thành các môn học còn lại',
      documents: [],
    },
    {
      id: '4',
      title: 'Đăng ký học kỳ 2 năm 4',
      date: '2024-12-15',
      status: 'completed',
      description: 'Đã đăng ký thành công 18 tín chỉ',
      documents: ['Phiếu đăng ký học phần'],
    },
  ]);

  const handleAddMilestone = () => {
    setEditingMilestone(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    form.setFieldsValue({
      ...milestone,
      date: dayjs(milestone.date),
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newMilestone = {
        id: editingMilestone ? editingMilestone.id : Date.now().toString(),
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        documents: values.documents
          ? values.documents.split(',').map((doc) => doc.trim())
          : [],
      };

      if (editingMilestone) {
        setMilestones(
          milestones.map((milestone) =>
            milestone.id === editingMilestone.id ? newMilestone : milestone
          )
        );
        message.success('Cập nhật mục tiêu thành công!');
      } else {
        setMilestones([...milestones, newMilestone]);
        message.success('Thêm mục tiêu thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const totalCompleted = requirements.reduce((sum, req) => sum + req.completed, 0);
  const totalRequired = requirements.reduce((sum, req) => sum + req.total, 0);
  const overallProgress = Math.round((totalCompleted / totalRequired) * 100);

  const completedRequirements = requirements.filter(
    (req) => req.status === 'completed'
  ).length;
  const upcomingMilestones = milestones.filter(
    (milestone) => milestone.status === 'upcoming'
  ).length;

  return (
    <div
      style={{
        padding: '24px',
        minHeight: '100vh',
        background: theme.palette.background.default,
      }}
    >
      <style>
        {`
          .graduate-page .ant-card {
            background: ${theme.palette.background.paper} !important;
            border-color: ${theme.palette.divider} !important;
            color: ${theme.palette.text.primary} !important;
          }
          .graduate-page .ant-statistic-title {
            color: ${theme.palette.text.secondary} !important;
          }
          .graduate-page .ant-steps-item-title {
            color: ${theme.palette.text.primary} !important;
          }
          .graduate-page .ant-steps-item-description {
            color: ${theme.palette.text.secondary} !important;
          }
          .graduate-page .ant-btn {
            color: ${theme.palette.text.primary} !important;
            border-color: ${theme.palette.divider} !important;
          }
          .graduate-page .ant-form-item-label > label {
            color: ${theme.palette.text.primary} !important;
          }
        `}
      </style>
      <div className="graduate-page">
        <Title level={2} style={{ color: theme.palette.primary.main, marginBottom: 24 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Tiến độ tốt nghiệp
        </Title>

      <GraduateStatistics
        overallProgress={overallProgress}
        completedRequirements={completedRequirements}
        totalRequirements={requirements.length}
        upcomingMilestones={upcomingMilestones}
        totalCompleted={totalCompleted}
        totalRequired={totalRequired}
      />

      <GraduateOverview
        overallProgress={overallProgress}
        totalCompleted={totalCompleted}
        totalRequired={totalRequired}
      />

      <GraduateRequirements requirements={requirements} />

      <GraduateTimeline
        milestones={milestones}
        onAddMilestone={handleAddMilestone}
        onEditMilestone={handleEditMilestone}
      />

      <MilestoneModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleOk}
        form={form}
        isEditing={!!editingMilestone}
      />
      </div>
    </div>
  );
};

export default GraduatePage;
