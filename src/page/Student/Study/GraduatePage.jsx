import React, { useState, useEffect } from 'react';
import { Form, message, Typography, Spin } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import GraduateStatistics from '../../../component/Student/GraduatePage/GraduateStatistics';
import GraduateOverview from '../../../component/Student/GraduatePage/GraduateOverview';
import GraduateRequirements from '../../../component/Student/GraduatePage/GraduateRequirements';
import GraduateTimeline from '../../../component/Student/GraduatePage/GraduateTimeline';
import MilestoneModal from '../../../component/Student/GraduatePage/MilestoneModal';
import graduationService from '../../../service/graduationService';

const { Title } = Typography;

const GraduatePage = () => {
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [graduationData, setGraduationData] = useState(null);

  const [requirements, setRequirements] = useState([
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

  const [milestones, setMilestones] = useState([]);

  // Fetch graduation data on mount
  useEffect(() => {
    const fetchGraduationData = async () => {
      setLoading(true);
      try {
        const data = await graduationService.calculateGraduationProgress();

        if (data) {
          setGraduationData(data);
          setRequirements(data.requirements);

          // Generate default milestones based on progress
          const defaultMilestones = graduationService.getDefaultMilestones(data.overallProgress);
          setMilestones(defaultMilestones);
        } else {
          message.warning('Không thể tải dữ liệu tiến độ tốt nghiệp. Hiển thị dữ liệu mẫu.');
        }
      } catch (error) {
        console.error('Error fetching graduation data:', error);
        message.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchGraduationData();
  }, []);

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

  const totalCompleted = graduationData?.totalCreditsCompleted ||
    requirements.reduce((sum, req) => sum + req.completed, 0);
  const totalRequired = graduationData?.totalCreditsRequired ||
    requirements.reduce((sum, req) => sum + req.total, 0);
  const overallProgress = graduationData?.overallProgress ||
    Math.round((totalCompleted / totalRequired) * 100);

  const completedRequirements = requirements.filter(
    (req) => req.status === 'completed'
  ).length;
  const upcomingMilestones = milestones.filter(
    (milestone) => milestone.status === 'upcoming'
  ).length;

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: theme.palette.background.default,
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu tiến độ tốt nghiệp..." />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: window.innerWidth < 600 ? '16px' : window.innerWidth < 960 ? '20px' : '24px',
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
