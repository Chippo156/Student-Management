import React from "react";
import { Layout, Row, Col, Typography } from "antd";

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const FooterPage = () => {
  return (
    <Footer style={{ backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>About Klook</Title>
            <Link href="#">About us</Link>
            <br />
            <Link href="#">Newsroom</Link>
            <br />
            <Link href="#">Careers</Link>
            <br />
            <Link href="#">Sustainability</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Partnerships</Title>
            <Link href="#">Merchant sign up</Link>
            <br />
            <Link href="#">Merchant log in</Link>
            <br />
            <Link href="#">Affiliate Partnership</Link>
            <br />
            <Link href="#">Influencer Program</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Agent Marketplace</Title>
            <Link href="#">Klook Partner Hub</Link>
            <br />
            <Link href="#">Distribution & marketing enquiries</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Terms of use</Title>
            <Link href="#">General terms of use</Link>
            <br />
            <Link href="#">Privacy policy</Link>
            <br />
            <Link href="#">Cookie Policy</Link>
            <br />
            <Link href="#">Bug Bounty Program</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Animal Welfare</Title>
            <Link href="#">Animal Welfare Policy</Link>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Title level={5}>Payment channels</Title>
            <Text>© 2014-2024 Klook. All rights reserved.</Text>
          </Col>
        </Row>
      </div>
    </Footer>
  );
};

export default FooterPage;
