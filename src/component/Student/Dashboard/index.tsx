import React, { useMemo, useState } from "react";
import { Card, Row, Col, Tag, Button } from "antd";
import {
  CalendarOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  BellOutlined,
  MessageOutlined,
  ReadOutlined,
  RightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme, alpha } from "@mui/material/styles";

interface SubjectData {
  subject: string;
  myScore: number;
  avgScore: number;
}

const academicData: SubjectData[] = [
  { subject: "Cấu trúc dữ liệu", myScore: 8.9, avgScore: 6.9 },
  { subject: "Cơ sở dữ liệu", myScore: 9.5, avgScore: 8.2 },
  { subject: "Mạng máy tính", myScore: 8.2, avgScore: 8.1 },
  { subject: "Hệ điều hành", myScore: 9.0, avgScore: 8.3 },
  { subject: "Lập trình Web", myScore: 10, avgScore: 9.0 },
];

const Dashboard: React.FC = () => {
  const muiTheme = useTheme();

  const colors = useMemo(() => {
    const p = muiTheme.palette;
    return {
      bgPage: p.background.default,
      bgCard: p.background.paper,
      bgSoftSuccess: alpha(p.success.main, 0.12),
      bgSoftWarning: alpha(p.warning.main, 0.12),
      bgSoftInfo: alpha(p.primary.main, 0.12),
      fg: p.text.primary,
      sub: p.text.secondary,
      border: p.divider,
      primary: p.primary.main,
      primaryContrast: p.primary.contrastText,
      secondary: p.secondary.main,
      success: p.success.main,
      warning: p.warning.main,
      info: p.primary.main,
      chart1: p.primary.main,
      chart2: p.secondary.main,
    };
  }, [muiTheme]);

  const sectionTitleStyle: React.CSSProperties = {
    color: colors.fg,
    margin: 0,
  };
  const subTextStyle: React.CSSProperties = { color: colors.sub };
  const cardStyle: React.CSSProperties = {
    background: colors.bgCard,
    color: colors.fg,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
  };

  const menuItems = [
    { icon: <CalendarOutlined />, text: "Lịch theo tuần" },
    { icon: <BarChartOutlined />, text: "Kết quả học tập" },
    { icon: <FileTextOutlined />, text: "Đăng ký học phần" },
    { icon: <ReadOutlined />, text: "Hồ sơ điện tử" },
    { icon: <DollarOutlined />, text: "Tra cứu công nợ" },
    { icon: <CreditCardOutlined />, text: "Thanh toán trực tuyến" },
    { icon: <FileTextOutlined />, text: "Phiếu thu tổng hợp" },
    { icon: <ClockCircleOutlined />, text: "Lịch theo tiến độ" },
    { icon: <BellOutlined />, text: "Nhắc nhở" },
    { icon: <MessageOutlined />, text: "Khảo sát" },
  ];

  const [hoveredRing, setHoveredRing] = useState<"inner" | "outer" | null>(
    null
  );
  const innerProgress = useMemo(
    () => [
      { name: "Hoàn thành", value: 92, color: colors.chart1 },
      { name: "Còn lại", value: 8, color: alpha(colors.sub, 0.2) },
    ],
    [colors]
  );
  const outerCredits = useMemo(
    () => [
      { name: "Tín chỉ hoàn thành", value: 143, color: colors.chart2 },
      { name: "Còn lại", value: 13, color: alpha(colors.sub, 0.2) },
    ],
    [colors]
  );

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: colors.bgPage }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <div>
            <h1 style={{ ...sectionTitleStyle, fontSize: 28, fontWeight: 700 }}>
              Dashboard
            </h1>
            <div style={{ ...subTextStyle, marginTop: 4 }}>
              Chào mừng trở lại, Ngô Quốc Đạt
            </div>
          </div>
        </Col>
      </Row>

      {/* Row 1: Profile + Right column */}
      <Row gutter={[16, 16]} align="stretch">
        {/* Profile */}
        <Col xs={24} lg={16}>
          <Card style={{ ...cardStyle, height: "100%" }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={6} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      background: colors.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 10px 25px ${alpha(colors.primary, 0.25)}`,
                    }}
                  >
                    <UserOutlined
                      style={{ fontSize: 42, color: colors.primaryContrast }}
                    />
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 18,
                      height: 18,
                      background: colors.success,
                      borderRadius: 999,
                      border: `2px solid ${colors.bgPage}`,
                    }}
                  />
                </div>
                <Button type="link" style={{ marginTop: 8, padding: 0 }}>
                  Xem chi tiết <RightOutlined />
                </Button>
              </Col>

              <Col xs={24} md={18}>
                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12}>
                    <div style={{ display: "grid", rowGap: 8 }}>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          MSSV:
                        </span>
                        <strong>21100801</strong>
                      </div>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Họ tên:
                        </span>
                        <strong>Ngô Quốc Đạt</strong>
                      </div>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Giới tính:
                        </span>
                        <span style={{ color: colors.secondary }}>Nam</span>
                      </div>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Ngày sinh:
                        </span>
                        <span>08/10/2003</span>
                      </div>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Nơi sinh:
                        </span>
                        <span>Tỉnh Khánh Hòa</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div style={{ display: "grid", rowGap: 8 }}>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Lớp học:
                        </span>
                        <strong style={{ color: colors.primary }}>
                          DHKTPM17C
                        </strong>
                      </div>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Khóa học:
                        </span>
                        <span>2021 - 2022</span>
                      </div>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Bậc đào tạo:
                        </span>
                        <span style={{ color: colors.success }}>Đại học</span>
                      </div>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Loại hình:
                        </span>
                        <span style={{ color: colors.warning }}>Chính quy</span>
                      </div>
                      <div>
                        <span style={{ ...subTextStyle, marginRight: 6 }}>
                          Ngành:
                        </span>
                        <strong style={{ color: colors.primary }}>
                          Kỹ thuật phần mềm
                        </strong>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right column */}
        <Col xs={24} lg={8}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              height: "100%",
            }}
          >
            {/* Nhắc nhở */}
            <Card style={cardStyle} bodyStyle={{ padding: 12 }}>
              <Row align="middle" justify="space-between">
                <Col>
                  <div style={{ ...subTextStyle, fontSize: 13 }}>
                    Nhắc nhở mới
                  </div>
                  <div
                    style={{ fontSize: 24, fontWeight: 700, color: colors.fg }}
                  >
                    0
                  </div>
                </Col>
                <Col>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: colors.bgSoftInfo,
                    }}
                  >
                    <BellOutlined style={{ color: colors.info }} />
                  </div>
                </Col>
              </Row>
              <Button type="link" style={{ padding: 0, marginTop: 8 }}>
                Xem chi tiết <RightOutlined />
              </Button>
            </Card>

            {/* 2 card nhỏ */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  style={{ ...cardStyle, textAlign: "center" }}
                  bodyStyle={{ padding: 12 }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: colors.bgSoftSuccess,
                    }}
                  >
                    <CalendarOutlined style={{ color: colors.success }} />
                  </div>
                  <div style={{ ...subTextStyle, marginBottom: 4 }}>
                    Lịch học
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>0</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  style={{ ...cardStyle, textAlign: "center" }}
                  bodyStyle={{ padding: 12 }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: colors.bgSoftWarning,
                    }}
                  >
                    <ReadOutlined style={{ color: colors.warning }} />
                  </div>
                  <div style={{ ...subTextStyle, marginBottom: 4 }}>
                    Lịch thi
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>0</div>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      {/* Row 2: Menu quick actions - Grid 5 items/row, Card fill cell and equal height */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          marginTop: 8,
          alignItems: "stretch",
        }}
      >
        {menuItems.map((item, idx) => (
          <Card
            key={idx}
            hoverable
            style={{
              ...cardStyle,
              textAlign: "center",
              width: "100%",
              height: "100%",
              border: `1px solid ${alpha(colors.primary, 0.2)}`,
            }}
            bodyStyle={{
              padding: 16,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: alpha(colors.primary, 0.12),
                color: colors.primary,
                fontSize: 18,
              }}
            >
              {item.icon}
            </div>
            <div style={{ marginTop: 10, fontWeight: 600, lineHeight: 1.2 }}>
              {item.text}
            </div>
          </Card>
        ))}
      </div>

      {/* Row 3: Kết quả học tập + Tiến độ + Lớp học phần (3 cột) */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }} align="stretch">
        {/* Cột 1: Biểu đồ kết quả học tập */}
        <Col xs={24} lg={12}>
          <Card
            style={{ ...cardStyle, height: "100%" }}
            title={<span style={sectionTitleStyle}>Kết quả học tập</span>}
            extra={<Tag>HK3 (2021 - 2022)</Tag>}
            headStyle={{
              borderBottom: `1px solid ${colors.border}`,
              color: colors.fg,
            }}
          >
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={academicData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 56 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis
                    dataKey="subject"
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    tick={{ fontSize: 12, fill: colors.sub }}
                    tickMargin={10}
                  />
                  <YAxis domain={[0, 10]} tick={{ fill: colors.sub }} />
                  <RTooltip />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ color: colors.fg }}
                  />
                  <Bar
                    dataKey="myScore"
                    name="Điểm của bạn"
                    fill={colors.primary}
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="avgScore"
                    name="Điểm TB lớp"
                    fill={colors.secondary}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Cột 2: Tiến độ học tập */}
        <Col xs={24} lg={6}>
          <Card style={{ ...cardStyle, textAlign: "center", height: "100%" }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              Tiến độ học tập
            </div>
            <div
              style={{
                position: "relative",
                width: 220,
                height: 220,
                margin: "0 auto",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outerCredits}
                    cx="50%"
                    cy="50%"
                    innerRadius={82}
                    outerRadius={100}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    onMouseEnter={() => setHoveredRing("outer")}
                    onMouseLeave={() => setHoveredRing(null)}
                  >
                    {outerCredits.map((entry, i) => (
                      <Cell
                        key={`outer-${i}`}
                        fill={entry.color}
                        cursor="pointer"
                      />
                    ))}
                  </Pie>
                  <Pie
                    data={innerProgress}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={76}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    onMouseEnter={() => setHoveredRing("inner")}
                    onMouseLeave={() => setHoveredRing(null)}
                  >
                    {innerProgress.map((entry, i) => (
                      <Cell
                        key={`inner-${i}`}
                        fill={entry.color}
                        cursor="pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  pointerEvents: "none",
                }}
              >
                {hoveredRing === "outer" ? (
                  <>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: colors.fg,
                      }}
                    >
                      143/156
                    </div>
                    <div style={{ fontSize: 12, color: colors.sub }}>
                      Tín chỉ
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: colors.fg,
                      }}
                    >
                      92%
                    </div>
                    <div style={{ fontSize: 12, color: colors.sub }}>
                      Hoàn thành
                    </div>
                  </>
                )}
              </div>
            </div>
            <div style={{ marginTop: 8, color: colors.sub }}>
              <span style={{ color: colors.fg, fontWeight: 600 }}>143</span> /
              156 tín chỉ
            </div>
          </Card>
        </Col>

        {/* Cột 3: Lớp học phần */}
        <Col xs={24} lg={6}>
          <Card
            style={{ ...cardStyle, height: "100%" }}
            title={<span style={sectionTitleStyle}>Lớp học phần</span>}
            extra={<Tag>HK1 (2025 - 2026)</Tag>}
            headStyle={{ borderBottom: `1px solid ${colors.border}` }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 10,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <span style={{ color: colors.primary, fontWeight: 600 }}>
                420300309801
              </span>
              <Tag color="green">5 TC</Tag>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 10,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
              }}
            >
              <span style={{ color: colors.primary, fontWeight: 600 }}>
                420301417001
              </span>
              <Tag color="blue">8 TC</Tag>
            </div>
            <Button type="link" style={{ marginTop: 8, padding: 0 }}>
              Xem tất cả <RightOutlined />
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
