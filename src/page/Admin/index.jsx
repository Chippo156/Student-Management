// import React, { useState } from 'react';
// import {
//   MenuFoldOutlined,
//   MenuUnfoldOutlined,
//   UserOutlined,
//   BookOutlined,
//   TrophyOutlined,
//   SettingOutlined,
// } from '@ant-design/icons';
// import { Button, Layout, Menu, theme } from 'antd';
// import StudentManagement from './studentManagement';
// import CourseManagement from './courseManagement';
// import GradeManagement from './gradeManagement';
// import UsersInfor from './usersInfor';
// import SystemSettings from './systemSettings';

// const { Header, Sider, Content } = Layout;

// const Admin = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const [selectedKey, setSelectedKey] = useState('1');
//   const {
//     token: { colorBgContainer, borderRadiusLG },
//   } = theme.useToken();

//   const handleMenuClick = (e) => {
//     setSelectedKey(e.key);
//   };

//   const renderContent = () => {
//     switch (selectedKey) {
//       case '1':
//         return <StudentManagement />;
//       case '2':
//         return <CourseManagement />;
//       case '3':
//         return <GradeManagement />;
//       case '4':
//         return <UsersInfor />;
//       case '5':
//         return <SystemSettings />;
//       default:
//         return <StudentManagement />;
//     }
//   };

//   return (
//     <Layout style={{ marginTop: 100 }}>
//       <Sider trigger={null} collapsible collapsed={collapsed}>
//         <div className="demo-logo-vertical" />
//         <Menu
//           theme="dark"
//           mode="inline"
//           defaultSelectedKeys={['1']}
//           selectedKeys={[selectedKey]}
//           onClick={handleMenuClick}
//           items={[
//             {
//               key: '1',
//               icon: <UserOutlined />,
//               label: 'Quản lý sinh viên',
//             },
//             {
//               key: '2',
//               icon: <BookOutlined />,
//               label: 'Quản lý khóa học',
//             },
//             {
//               key: '3',
//               icon: <TrophyOutlined />,
//               label: 'Quản lý điểm',
//             },
//             {
//               key: '4',
//               icon: <UserOutlined />,
//               label: 'Thông tin người dùng',
//             },
//             {
//               key: '5',
//               icon: <SettingOutlined />,
//               label: 'Cài đặt hệ thống',
//             },
//           ]}
//         />
//       </Sider>
//       <Layout>
//         <Header
//           style={{
//             padding: 0,
//             background: colorBgContainer,
//           }}
//         >
//           <Button
//             type="text"
//             icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//             onClick={() => setCollapsed(!collapsed)}
//             style={{
//               fontSize: '16px',
//               width: 64,
//               height: 64,
//             }}
//           />
//         </Header>
//         <Content
//           style={{
//             margin: '24px 16px',
//             padding: 24,
//             minHeight: 280,
//             background: colorBgContainer,
//             borderRadius: borderRadiusLG,
//           }}
//         >
//           {renderContent()}
//         </Content>
//       </Layout>
//     </Layout>
//   );
// };

// export default Admin;
