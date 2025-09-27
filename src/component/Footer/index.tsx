import React from "react";
import { Layout, Row, Col, Typography } from "antd";

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const FooterPage: React.FC = () => {
  return (
    <Footer style={{ backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>About Student Management</Title>
            <Link href="#">About us</Link>
            <br />
            <Link href="#">Contact</Link>
            <br />
            <Link href="#">Careers</Link>
            <br />
            <Link href="#">Help Center</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Academic Services</Title>
            <Link href="#">Course Registration</Link>
            <br />
            <Link href="#">Grade Portal</Link>
            <br />
            <Link href="#">Academic Calendar</Link>
            <br />
            <Link href="#">Student Resources</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Support</Title>
            <Link href="#">Technical Support</Link>
            <br />
            <Link href="#">Academic Advising</Link>
            <br />
            <Link href="#">Financial Aid</Link>
            <br />
            <Link href="#">Student Services</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Policies</Title>
            <Link href="#">Terms of Service</Link>
            <br />
            <Link href="#">Privacy Policy</Link>
            <br />
            <Link href="#">Academic Policy</Link>
            <br />
            <Link href="#">Code of Conduct</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Resources</Title>
            <Link href="#">Library</Link>
            <br />
            <Link href="#">Online Learning</Link>
            <br />
            <Link href="#">Campus Map</Link>
            <br />
            <Link href="#">Student Handbook</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Connect</Title>
            <Link href="#">Social Media</Link>
            <br />
            <Link href="#">Newsletter</Link>
            <br />
            <Text>© 2024 Student Management System. All rights reserved.</Text>
          </Col>
        </Row>
      </div>
    </Footer>
  );
};

export default FooterPage;