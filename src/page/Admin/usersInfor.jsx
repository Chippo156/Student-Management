import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { getAllUsers } from '../../controller/userController';

const UsersInfor = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers(currentPage, itemsPerPage);
      console.log('response:', response);
      if (response.code === 200) {
        setData(response.result.users);
        setTotalElements(response.result.totalElements);
      } else {
        message.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [currentPage, itemsPerPage]); // Theo dõi thay đổi của `currentPage` và `itemsPerPage`

  const columns = [
    { title: 'ID', dataIndex: 'id', sorter: (a, b) => a.id - b.id },
    { title: 'Email', dataIndex: 'email' },
    { title: 'First Name', dataIndex: 'first_name' },
    { title: 'Last Name', dataIndex: 'last_name' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Username', dataIndex: 'username' },
    { title: 'Role ID', dataIndex: 'role_id', sorter: (a, b) => a.role_id - b.role_id },
    { title: 'Sex', dataIndex: 'sex' },
    { title: 'Date of Birth', dataIndex: 'dob' },
    { title: 'Address', dataIndex: 'address' },
    { title: 'Information Agent', dataIndex: 'information_agent' },
  ];
  

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: totalElements,
          showSizeChanger: true, // Cho phép thay đổi số mục mỗi trang
          pageSizeOptions: ['5', '10', '20', '50'], // Các tùy chọn số mục
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setItemsPerPage(pageSize);
          },
        }}
      />
    </>
  );
};

export default UsersInfor;
