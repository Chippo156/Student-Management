import React from "react";
import { Card, Progress, Select, Avatar } from "antd";
import { Grid, Typography, useTheme } from "@mui/material";
import {
  CalendarOutlined,
  BarChartOutlined,
  FileTextOutlined,
  DollarOutlined,
  CreditCardOutlined,
  ScheduleOutlined,
  BellOutlined,
  FormOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ResponsiveContainer,
} from "recharts";

const { Option } = Select;

// Dữ liệu điểm học tập
const data = [
  { subject: "Cấu trúc dữ liệu & giải thuật", myScore: 8.9, avgScore: 6.9 },
  { subject: "Cơ sở dữ liệu", myScore: 9.5, avgScore: 8.2 },
  { subject: "Mạng máy tính", myScore: 8.2, avgScore: 8.1 },
  { subject: "Hệ điều hành", myScore: 9.0, avgScore: 8.3 },
  { subject: "Lập trình Web", myScore: 10, avgScore: 9.0 },
];

// Tooltip custom
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          padding: 10,
          fontSize: 13,
          color: theme.palette.text.primary,
        }}
      >
        <b>{label}</b>
        <br />
        <span style={{ color: "#ff4d4f" }}>
          ● Điểm của bạn: {payload[0].value}
        </span>
        <br />
        <span style={{ color: "#faad14" }}>
          ● Điểm TB lớp học phần: {payload[1].value}
        </span>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const theme = useTheme();

  const cardStyle = {
    background: theme.palette.background.paper,
    borderRadius: 12,
    boxShadow: theme.shadows[1],
    border: `1px solid ${theme.palette.divider}`,
    height: "100%",
    minHeight: 160,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: theme.palette.text.primary,
  };

  const cardMenuStyle = {
    ...cardStyle,
    background:
      theme.palette.mode === "dark"
        ? '#232c3b'
        : 'rgb(234,243,255)',
    border: "none",
    minHeight: 120,
    color: theme.palette.text.primary,
  };

  return (
    <>
      {/* Hàng 1: Thông tin sinh viên + Nhắc nhở + Lịch học + Lịch thi */}
      <Grid container spacing={2} sx={{ mb: 2, alignItems: 'stretch' }}>
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <Card style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Grid container spacing={2} sx={{ flex: 1 }}>
              <Grid item xs={12} md={4} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Avatar
                  src="https://i.pravatar.cc"
                  size={120}
                  style={{ margin: '0 auto' }}
                />
                <Typography style={{ marginTop: 8, color: theme.palette.text.primary }}>
                  <a href="#" style={{ color: theme.palette.primary.main }}>Xem chi tiết</a>
                </Typography>
              </Grid>
              <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>MSSV:</b> 21100801
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Họ tên:</b> Ngô Quốc Đạt
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Giới tính:</b> Nam
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Ngày sinh:</b> 08/10/2003
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Nơi sinh:</b> Tỉnh Khánh Hòa
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Lớp học:</b> DHKTPM17C
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Khóa học:</b> 2021 - 2022
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Bậc đào tạo:</b> Đại học
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Loại hình đào tạo:</b> Chính quy
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.primary }}>
                      <b>Ngành:</b> Kỹ thuật phần mềm
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <Grid container spacing={2} sx={{ flex: 1, height: '100%' }}>
            <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Card style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                  Nhắc nhở mới, chưa xem
                </Typography>
                <Typography variant="h5" color="primary">
                  0
                </Typography>
                <a href="#" style={{ color: theme.palette.primary.main }}>Xem chi tiết</a>
              </Card>
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Card style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                  Lịch học trong tuần
                </Typography>
                <Typography variant="h5" color="primary">
                  0
                </Typography>
                <a href="#" style={{ color: theme.palette.primary.main }}>Xem chi tiết</a>
              </Card>
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Card style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                  Lịch thi trong tuần
                </Typography>
                <Typography variant="h5" color="error">
                  0
                </Typography>
                <a href="#" style={{ color: theme.palette.primary.main }}>Xem chi tiết</a>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Hàng 2: Menu icon */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { icon: <CalendarOutlined />, text: "Lịch theo tuần" },
          { icon: <BarChartOutlined />, text: "Kết quả học tập" },
          { icon: <FileTextOutlined />, text: "Đăng ký học phần" },
          { icon: <FileTextOutlined />, text: "Hồ sơ điện tử" },
          { icon: <DollarOutlined />, text: "Tra cứu công nợ" },
          { icon: <CreditCardOutlined />, text: "Thanh toán trực tuyến" },
          { icon: <FileTextOutlined />, text: "Phiếu thu tổng hợp" },
          { icon: <ScheduleOutlined />, text: "Lịch theo tiến độ" },
          { icon: <BellOutlined />, text: "Nhắc nhở" },
          { icon: <FormOutlined />, text: "Khảo sát" },
        ].map((item, idx) => (
          <Grid
            item
            xs={6}
            sm={3}
            md={2}
            key={idx}
            sx={{ height: { md: 140, xs: "auto" } }}
          >
            <Card
              hoverable
              style={{
                ...cardMenuStyle,
                textAlign: "center",
                cursor: "pointer",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: theme.palette.text.primary,
              }}
            >
              <div style={{ fontSize: 28, color: theme.palette.primary.main }}>
                {item.icon}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 15,
                  color: "#000",
                }}
              >
                {item.text}
              </div>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Hàng 3: Kết quả học tập + Tiến độ + Lớp học phần */}
      <Grid container spacing={2} sx={{ alignItems: "stretch", mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Card
            title={<span style={{ color: theme.palette.text.primary }}>Kết quả học tập</span>}
            extra={
              <Select defaultValue="HK1 (2025 - 2026)" size="small">
                <Option value="hk1">HK1 (2025 - 2026)</Option>
                <Option value="hk2">HK2 (2025 - 2026)</Option>
              </Select>
            }
            style={{ ...cardStyle, height: "100%", minHeight: 320 }}
            headStyle={{ color: theme.palette.text.primary }}
          >
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: theme.palette.text.primary }} />
                  <YAxis domain={[0, 10]} tick={{ fill: theme.palette.text.primary }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                  <Bar dataKey="myScore" name="Điểm của bạn" fill="#ff4d4f" />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    name="Điểm TB lớp học phần"
                    stroke="#faad14"
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            title={<span style={{ color: theme.palette.text.primary }}>Tiến độ học tập</span>}
            style={{ ...cardStyle, height: "100%", minHeight: 320 }}
            headStyle={{ color: theme.palette.text.primary }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <Progress type="circle" percent={92} />
            </div>
            <Typography
              variant="body2"
              style={{ textAlign: "center", marginTop: 10, color: theme.palette.text.primary }}
            >
              143/156
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            title={<span style={{ color: theme.palette.text.primary }}>Lớp học phần</span>}
            extra={
              <Select defaultValue="HK1 (2025 - 2026)" size="small">
                <Option value="hk1">HK1 (2025 - 2026)</Option>
                <Option value="hk2">HK2 (2025 - 2026)</Option>
              </Select>
            }
            style={{ ...cardStyle, height: "100%", minHeight: 320 }}
            headStyle={{ color: theme.palette.text.primary }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <a href="#" style={{ color: theme.palette.primary.main }}>
                420300309801
              </a>
              <span style={{ color: theme.palette.text.primary }}>5</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <a href="#" style={{ color: theme.palette.primary.main }}>
                420301417001
              </a>
              <span style={{ color: theme.palette.text.primary }}>8</span>
            </div>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;