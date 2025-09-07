import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import { getAllBookingHotel } from "../../controller/BookingController";

const BookingHotelAdmin = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await getAllBookingHotel(currentPage, itemsPerPage);
      if (response.code === 200) {
        setData(response.result.bookingResponses);
        setTotalElements(response.result.totalElements);
      } else {
        message.error("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [currentPage, itemsPerPage]);

  const columns = [
    { title: "ID", dataIndex: "id", sorter: (a, b) => a.id - b.id },
    {
      title: "Quantity",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
    },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "User ID", dataIndex: "user_id" },
    { title: "Destination ID", dataIndex: "destination_id" },
    { title: "Room ID", dataIndex: "room_id" },
    { title: "Check-in Date", dataIndex: "check_in_date" },
    { title: "Check-out Date", dataIndex: "check_out_date" },
    { title: "Booking Status", dataIndex: "booking_status" },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      render: (text) => (
        <span
          style={{ 
            color: text === 'PENDING' ? 'red' : 'green',
            fontWeight: 'bold',
          }}
        >
          {text}
        </span>
      ),
    },
    { title: "Payment Method", dataIndex: "payment_method" },
    { title: "Payment Date", dataIndex: "payment_date" },
    { title: "Full Name", dataIndex: "full_name" },
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
          showSizeChanger: true, // Cho phép thay đổi số lượng mục trên mỗi trang
          pageSizeOptions: ["5", "10", "20", "50"], // Các tùy chọn số lượng mục
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setItemsPerPage(pageSize);
          },
        }}
      />
    </>
  );
};

export default BookingHotelAdmin;
