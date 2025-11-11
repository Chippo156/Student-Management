import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button } from 'antd';
import { BookOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material/styles';
import sectionService from '../../../../service/sectionService';

const TeacherCoursesList = ({ lecturerId }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const muiTheme = useTheme();

  const colors = {
    bgCard: muiTheme.palette.background.paper,
    fg: muiTheme.palette.text.primary,
    sub: muiTheme.palette.text.secondary,
    border: muiTheme.palette.divider,
    primary: muiTheme.palette.primary.main,
  };

  const cardStyle = {
    background: colors.bgCard,
    color: colors.fg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    height: '100%',
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await sectionService.getSectionsByLecturer({
          pageNumber: 1,
          pageSize: 5, // Only get 5 recent courses
        });
        const sectionsData = response?.items || [];
        setCourses(sectionsData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (lecturerId) {
      fetchCourses();
    }
  }, [lecturerId]);

  return (
    <Card
      style={cardStyle}
      title={
        <span style={{ color: colors.fg, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined style={{ color: colors.primary }} />
          Môn học đang giảng dạy
        </span>
      }
      loading={loading}
    >
      {courses.length > 0 ? (
        <>
          <List
            dataSource={courses}
            renderItem={(section) => (
              <List.Item style={{ padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: '100%' }}>
                  <div style={{ fontWeight: 600, color: colors.fg, marginBottom: 8 }}>
                    {section.courseName}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Tag color="blue">{section.courseCode}</Tag>
                    <Tag color="green">{section.sectionCode}</Tag>
                    <Tag>{section.enrolledCount}/{section.capacity} SV</Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/teacher/courses')}
            style={{ marginTop: 12, padding: 0 }}
          >
            Xem tất cả môn học
          </Button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0', color: colors.sub }}>
          Chưa có môn học nào được phân công
        </div>
      )}
    </Card>
  );
};

export default TeacherCoursesList;
