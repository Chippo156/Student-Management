import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Empty,
  Select,
  Spin,
  Row,
  Col,
  Statistic,
  Alert,
  Divider,
  Space,
  Badge,
  Tooltip,
} from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  BookOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Grid } from '@mui/material';
import { tuitionService } from '../../../service/tuitionService';
import { semesterService } from '../../../service/semesterService';

const DebtPage = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [debtData, setDebtData] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    const fetchSemesters = async () => {
      const data = await semesterService.getStudentSemesters();
      if (data && Array.isArray(data)) {
        const sorted = data.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          const termOrder = { HK3: 3, HK2: 2, HK1: 1 };
          return (termOrder[b.term] || 0) - (termOrder[a.term] || 0);
        });
        setSemesters(sorted);
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    const fetchDebtData = async () => {
      setLoading(true);
      try {
        const data = await tuitionService.getStudentDebt(selectedSemester);
        setDebtData(data);
      } catch (error) {
        console.error('Error fetching debt data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDebtData();
  }, [selectedSemester]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusConfig = (status, statusName, isOverdue) => {
    if (isOverdue) {
      return { color: 'error', icon: <WarningOutlined />, text: 'Quá hạn' };
    }
    // Status: 0 = Chưa đóng, 1 = Đã đóng, 2 = Đóng 1 phần
    switch (status) {
      case 0:
      case 1:
        return { color: 'warning', icon: <ClockCircleOutlined />, text: statusName || 'Chưa đóng' };
      case 2:
        return { color: 'success', icon: <CheckCircleOutlined />, text: statusName || 'Đã đóng' };
      case 3:
        return { color: 'processing', icon: <ClockCircleOutlined />, text: statusName || 'Đóng 1 phần' };
      default:
        return { color: 'default', icon: null, text: statusName || status };
    }
  };

  const statistics = useMemo(() => {
    if (!debtData || !debtData.semesterDebts) return null;
    const totalPaid = debtData.semesterDebts.reduce(
      (sum, s) => sum + (s.paidAmount || 0), 0
    );
    const totalAmount = debtData.semesterDebts.reduce(
      (sum, s) => sum + (s.totalAmount || 0), 0
    );
    return { totalPaid, totalAmount };
  }, [debtData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Đang tải thông tin công nợ..." />
      </Box>
    );
  }

  if (!debtData) {
    return (
      <Box sx={{ p: 3 }}>
        <Card><Empty description="Không có dữ liệu công nợ" /></Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <style>
        {`
          .debt-page .ant-card {
            background: ${theme.palette.background.paper};
            border-color: ${theme.palette.divider};
            border-radius: 8px;
          }
          .debt-page .ant-statistic-title {
            color: ${theme.palette.text.secondary};
            font-size: 13px;
            margin-bottom: 4px;
          }
          .debt-page .ant-statistic-content {
            color: ${theme.palette.text.primary};
          }
          .debt-page .ant-table {
            background: transparent;
          }
          .debt-page .ant-table-thead > tr > th {
            background: ${theme.palette.action.hover};
            color: ${theme.palette.text.primary};
            border-color: ${theme.palette.divider};
            font-weight: 600;
            font-size: 13px;
          }
          .debt-page .ant-table-tbody > tr > td {
            border-color: ${theme.palette.divider};
            color: ${theme.palette.text.primary};
          }
          .debt-page .ant-table-tbody > tr:hover > td {
            background: ${theme.palette.action.hover};
          }
          .debt-page .ant-select-selector {
            background: ${theme.palette.background.paper} !important;
            border-color: ${theme.palette.divider} !important;
            color: ${theme.palette.text.primary} !important;
          }
          .debt-page .stat-card {
            background: ${theme.palette.background.paper};
            border: 1px solid ${theme.palette.divider};
            border-radius: 8px;
            padding: 20px;
          }
          .debt-page .semester-card {
            background: ${theme.palette.background.paper};
            border: 1px solid ${theme.palette.divider};
            border-left: 4px solid;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          }
        `}
      </style>

      <div className="debt-page">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
            Tra cứu công nợ học phí
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Theo dõi chi tiết học phí và công nợ của bạn
          </Typography>
        </Box>

        {/* Filter */}
        <Card size="small" style={{ marginBottom: 24 }}>
          <Space align="center" style={{ width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Học kỳ:</Typography>
            <Select
              style={{ width: 350 }}
              placeholder="Tất cả học kỳ"
              allowClear
              value={selectedSemester}
              onChange={setSelectedSemester}
            >
              <Select.Option value={null}>Tất cả học kỳ</Select.Option>
              {semesters.map((sem) => (
                <Select.Option key={sem.semesterId} value={sem.semesterId}>
                  Học kỳ {sem.term} - Năm {sem.year}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Card>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <div className="stat-card">
              <Statistic
                title="Tổng công nợ"
                value={debtData.totalDebt || 0}
                precision={0}
                valueStyle={{ color: theme.palette.error.main, fontSize: 24, fontWeight: 600 }}
                prefix={<DollarOutlined />}
                suffix="đ"
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div className="stat-card">
              <Statistic
                title="Đã thanh toán"
                value={statistics?.totalPaid || 0}
                precision={0}
                valueStyle={{ color: theme.palette.success.main, fontSize: 24, fontWeight: 600 }}
                prefix={<CheckCircleOutlined />}
                suffix="đ"
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div className="stat-card">
              <Statistic
                title="Phí trễ hạn"
                value={debtData.totalLateFee || 0}
                precision={0}
                valueStyle={{ color: theme.palette.warning.main, fontSize: 24, fontWeight: 600 }}
                prefix={<WarningOutlined />}
                suffix="đ"
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div className="stat-card">
              <Statistic
                title="Học kỳ có nợ"
                value={debtData.totalSemesters || 0}
                valueStyle={{ color: theme.palette.info.main, fontSize: 24, fontWeight: 600 }}
                prefix={<CalendarOutlined />}
              />
            </div>
          </Grid>
        </Grid>

        {/* Alert */}
        {debtData.totalLateFee > 0 && (
          <Alert
            message="Bạn có khoản phí trễ hạn cần thanh toán"
            description={`Tổng phí trễ hạn: ${formatCurrency(debtData.totalLateFee)}`}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Student Info */}
        <Card
          title={<><FileTextOutlined /> Thông tin sinh viên</>}
          size="small"
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                MSSV
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {debtData.mssv}
              </Typography>
            </Col>
            <Col span={8}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Họ và tên
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {debtData.studentName}
              </Typography>
            </Col>
            <Col span={8}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Lớp
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {debtData.className}
              </Typography>
            </Col>
          </Row>
        </Card>

        {/* Semester Details */}
        <Card
          title={
            <Space>
              <CalendarOutlined />
              Chi tiết công nợ theo học kỳ
              <Badge count={debtData.semesterDebts?.length || 0} style={{ backgroundColor: theme.palette.primary.main }} />
            </Space>
          }
        >
          {!debtData.semesterDebts || debtData.semesterDebts.length === 0 ? (
            <Empty description="Không có công nợ" />
          ) : (
            debtData.semesterDebts.map((semester, index) => {
              const statusConfig = getStatusConfig(
                semester.status,
                semester.statusName,
                semester.isOverdue
              );

              const isPaid = semester.status === 2;

              return (
                <div
                  key={index}
                  className="semester-card"
                  style={{
                    borderLeftColor: semester.isOverdue
                      ? theme.palette.error.main
                      : isPaid
                      ? theme.palette.success.main
                      : theme.palette.warning.main,
                  }}
                >
                  {/* Semester Header */}
                  <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                      <Space>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0 }}>
                          {semester.semesterName}
                        </Typography>
                        <Tag icon={statusConfig.icon} color={statusConfig.color}>
                          {statusConfig.text}
                        </Tag>
                        {semester.isOverdue && (
                          <Tag color="error">Quá hạn {semester.daysOverdue} ngày</Tag>
                        )}
                      </Space>
                    </Col>
                    <Col>
                      <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        {formatCurrency(semester.totalAmount || 0)}
                      </Typography>
                    </Col>
                  </Row>

                  {/* Fee Details */}
                  <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
                    <Col xs={12} md={6}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Mã học phí
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {semester.tuitionFeeCode || 'N/A'}
                      </Typography>
                    </Col>
                    <Col xs={12} md={6}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Đã thanh toán
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        {formatCurrency(semester.paidAmount)}
                      </Typography>
                    </Col>
                    <Col xs={12} md={6}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Còn lại
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: semester.remainingAmount > 0
                            ? theme.palette.error.main
                            : theme.palette.success.main,
                        }}
                      >
                        {formatCurrency(semester.remainingAmount)}
                      </Typography>
                    </Col>
                    <Col xs={12} md={6}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Hạn thanh toán
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(semester.dueDate)}
                      </Typography>
                    </Col>
                    {semester.lateFee > 0 && (
                      <Col xs={12} md={6}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                          Phí trễ hạn
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                          {formatCurrency(semester.lateFee)}
                        </Typography>
                      </Col>
                    )}
                    {semester.paidAt && (
                      <Col xs={12} md={6}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                          Ngày thanh toán
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatDate(semester.paidAt)}
                        </Typography>
                      </Col>
                    )}
                  </Row>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Course Table */}
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    <BookOutlined /> Danh sách môn học ({semester.courseDetails?.length || 0})
                  </Typography>
                      <Table
                        dataSource={semester.courseDetails || []}
                        columns={[
                          {
                            title: 'Mã lớp HP',
                            dataIndex: 'sectionCode',
                            key: 'sectionCode',
                            width: 120,
                          },
                          {
                            title: 'Tên môn học',
                            dataIndex: 'courseName',
                            key: 'courseName',
                            ellipsis: true,
                          },
                          {
                            title: 'Tín chỉ',
                            dataIndex: 'credits',
                            key: 'credits',
                            width: 80,
                            align: 'center',
                          },
                          {
                            title: 'Học phí',
                            dataIndex: 'amount',
                            key: 'amount',
                            width: 140,
                            align: 'right',
                            render: (amount) => (
                              <span style={{ fontWeight: 500 }}>{formatCurrency(amount)}</span>
                            ),
                          },
                        ]}
                        rowKey={(record) => record.sectionCode}
                        pagination={false}
                        size="small"
                        summary={(pageData) => {
                          const total = pageData.reduce((sum, r) => sum + (r.amount || 0), 0);
                          const credits = pageData.reduce((sum, r) => sum + (r.credits || 0), 0);
                          return (
                            <Table.Summary>
                              <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={2}>
                                  <strong>Tổng cộng</strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                  <strong>{credits}</strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                  <strong>{formatCurrency(total)}</strong>
                                </Table.Summary.Cell>
                              </Table.Summary.Row>
                            </Table.Summary>
                          );
                        }}
                      />

                      {/* Payment History */}
                      {semester.payments && semester.payments.length > 0 && (
                        <>
                          <Divider style={{ margin: '16px 0' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            <CreditCardOutlined /> Lịch sử thanh toán
                          </Typography>
                          <Table
                            dataSource={semester.payments}
                            columns={[
                              {
                                title: 'Ngày thanh toán',
                                dataIndex: 'paymentDate',
                                render: (date) => formatDate(date),
                              },
                              {
                                title: 'Số tiền',
                                dataIndex: 'amount',
                                align: 'right',
                                render: (amt) => (
                                  <span style={{ fontWeight: 600, color: theme.palette.success.main }}>
                                    {formatCurrency(amt)}
                                  </span>
                                ),
                              },
                              {
                                title: 'Phương thức',
                                dataIndex: 'paymentMethod',
                              },
                              {
                                title: 'Ghi chú',
                                dataIndex: 'note',
                                ellipsis: true,
                              },
                            ]}
                            rowKey={(r, i) => i}
                            pagination={false}
                            size="small"
                          />
                        </>
                      )}
                </div>
              );
            })
          )}
        </Card>
      </div>
    </Box>
  );
};

export default DebtPage;
