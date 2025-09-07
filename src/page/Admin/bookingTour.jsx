import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { getAllBookingTour } from '../../controller/BookingController';

const BookingtourAdmin = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await getAllBookingTour(currentPage, itemsPerPage);
      console.log('response:', response);
      if (response.code === 200) {
        setData(response.result.bookingResponses.map((item) => ({ ...item, key: item.id })));
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
    { title: 'Quantity', dataIndex: 'quantity', sorter: (a, b) => a.quantity - b.quantity },
    { title: 'Amount', dataIndex: 'amount', sorter: (a, b) => a.amount - b.amount },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'User ID', dataIndex: 'user_id' },
    { title: 'Tour ID', dataIndex: 'tour_id' },
    { title: 'Check-in Date', dataIndex: 'check_in_date' },
    { title: 'Booking Status', dataIndex: 'booking_status' },
    { 
      title: 'Payment Status', 
      dataIndex: 'payment_status',
      render: (text) => (
        <span
          style={{ 
          color: text === 'pending' ? 'red' : 'green',
          fontWeight: 'bold',
        }}
        >
          {text}
        </span>
      ),
    },
    { title: 'Payment Method', dataIndex: 'payment_method' },
    { title: 'Payment Date', dataIndex: 'payment_date' },
    { title: 'Full Name', dataIndex: 'full_name' },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowClassName={(record) => {
          return record.payment_status === 'pending' ? 'row-pending' : 'row-completed';
        }}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: totalElements,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setItemsPerPage(pageSize);
          },
        }}
      />
    </>
  );
};

export default BookingtourAdmin;
