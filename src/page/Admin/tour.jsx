import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import { getFilterTour } from "../../controller/filterController";
import {
  updateTour,
  createTour,
  getTourType,
  deleteTour,
} from "../../controller/tourController";

const { Option } = Select;

const TourAdmin = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [form] = Form.useForm();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [tourTypes, setTourTypes] = useState([]);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await getFilterTour(
        `&page=${currentPage}&size=${itemsPerPage}`
      );
      setData(response.result.tours);
      setTotalElements(response.result.totalElements);
    } catch (error) {
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTourTypes = async () => {
    try {
      const response = await getTourType();
      if (response.code === 200) {
        setTourTypes(response.result);
      } else {
        message.error("Failed to fetch tour types");
      }
    } catch (error) {
      message.error("Failed to fetch tour types");
    }
  };

  useEffect(() => {
    getData();
    fetchTourTypes();
  }, [currentPage, itemsPerPage]);

  const showModal = (type, record = {}) => {
    setModalType(type);
    setIsModalVisible(true);
    if (type === "update") {
      form.setFieldsValue(record);
      setCurrentRecord(record);
    } else {
      form.resetFields();
      setCurrentRecord(null);
    }
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (modalType === "create") {
        handleCreate(values);
      } else if (modalType === "update") {
        handleUpdate({ ...currentRecord, ...values });
      }
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCreate = async (record) => {
    try {
      const response = await createTour(record);
      if (response.code === 200) {
        message.success("Create successful");
        getData();
      } else {
        message.error("Create failed");
      }
    } catch (error) {
      message.error("Create failed");
    }
  };

  const handleUpdate = async (record) => {
    try {
      const response = await updateTour(record.id, record);
      if (response.code === 200) {
        message.success("Update successful");
        getData();
      } else {
        message.error("Update failed");
      }
    } catch (error) {
      message.error("Update failed");
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteTour(record.id);
      if (response.code === 200) {
        message.success("Delete successful");
        getData();
      } else {
        message.error("Delete failed");
      }
    } catch (error) {
      message.error("Delete failed");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", sorter: (a, b) => a.id - b.id },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.length - b.name.length,
      render: (text) =>
        text.length > 10 ? `${text.substring(0, 10)}...` : text,
    },
    {
      title: "Departure",
      dataIndex: "departure",
      filters: [{ text: "Hanoi", value: "Hanoi" }],
      onFilter: (value, record) => record.departure.indexOf(value) === 0,
      render: (text) =>
        text.length > 10 ? `${text.substring(0, 10)}...` : text,
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text) =>
        text.length > 10 ? `${text.substring(0, 10)}...` : text,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (text) =>
        text.length > 10 ? `${text.substring(0, 10)}...` : text,
    },
    {
      title: "Highlight",
      dataIndex: "highlight",
      render: (text) =>
        text.length > 10 ? `${text.substring(0, 10)}...` : text,
    },
    { title: "Price", dataIndex: "price", sorter: (a, b) => a.price - b.price },
    {
      title: "Rating",
      dataIndex: "rating",
      sorter: (a, b) => a.rating - b.rating,
    },
    { title: "Schedule", dataIndex: "schedule" },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showModal("update", record)}>
            Update
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => showModal("create")}>
        Create Tour
      </Button>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: totalElements,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setItemsPerPage(pageSize);
          },
        }}
      />
      <Modal
        title={modalType === "create" ? "Create Tour" : "Update Tour"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          {modalType === "update" && (
            <Form.Item name="id" style={{ width: "100%" }} label="ID">
              <Input disabled />
            </Form.Item>
          )}
          <div style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="name"
              label="Name"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please input the name!" }]}
            >
              <Input />
            </Form.Item>
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="departure"
              label="Departure"
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please input the departure!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="description"
              label="Description"
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please input the description!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="duration"
              label="Duration"
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please input the duration!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="highlight"
              label="Highlight"
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please input the highlight!" },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', width: '100%' }}>
          <Form.Item
            name="price"
            label="Price"
            style={{ width: '100%' }}
            rules={[
              { required: true, message: 'Please input the price!' },
              {
                validator: (_, value) =>
                  value > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('Price must be a positive number!')),
              },
            ]}
          >
            <Input placeholder="Enter a positive number" />
          </Form.Item>
      
          </div>
          <div style={{ display: 'flex', width: '100%',  }}>
          <Form.Item
                    name="rating"
                    style={{ width: '100%' }}
                    label="Rating"
                    rules={[
                      { required: true, message: 'Please input the average rating!' },
                      {
                        validator: (_, value) =>
                          value >= 1 && value <= 5
                            ? Promise.resolve()
                            : Promise.reject(new Error('Please input a number between 1 and 5!')),
                      },
                    ]}
                  >
          <Input placeholder="Enter a number between 1 and 5" />
        </Form.Item>          </div>
          <div style={{ display: 'flex', width: '100%',  }}>
          <Form.Item name="schedule" label="Schedule" style={{ width: '100%' }} rules={[{ required: true, message: 'Please input the schedule!' }]}><Input /></Form.Item>
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <Form.Item
              name="tour_type_id"
              label="Tour Type"
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please select the tour type!" },
              ]}
            >
              <Select>
                {tourTypes.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default TourAdmin;
