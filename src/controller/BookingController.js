import axios from "../until/customize-axios";

export let createBooking = async (
  user_id,
  destination_id,
  room_id,
  payment_status,
  payment_method,
  check_in_date,
  check_out_date,
  amount,
  quantity,
  full_name,
  phone,
  email,
  tour_id
) => {
  try {
    const response = await axios.post("/bookings", {
      user_id,
      destination_id,
      room_id,
      payment_status,
      payment_method,
      check_in_date,
      check_out_date,
      amount,
      quantity,
      full_name,
      phone,
      email,
      tour_id,
    });
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let createBookingTour = async (
  user_id,
  payment_status,
  payment_method,
  check_in_date,
  amount,
  quantity,
  full_name,
  phone,
  email,
  tour_id
) => {
  try {
    const response = await axios.post("/bookings/tour", {
      user_id,

      payment_status,
      payment_method,
      check_in_date,

      amount,
      quantity,
      full_name,
      phone,
      email,
      tour_id,
    });
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let handleVNPay = async (amount, bankCode, orderId) => {
  try {
    const response = await axios.get(
      `/payment/vn-pay?amount=${amount}&bankCode=${bankCode}&orderId=${orderId}`
    );
    if (response.code === "ok") {
      window.open(response.paymentUrl, "_blank");
    }

    return "success";
  } catch (error) {
    console.error("Error creating payment: ", error);
    alert(`Error creating payment ${error}`);
  }
};
export let getListBookingById = async (id) => {
  try {
    const response = await axios.get(`/bookings/user/${id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let getDesitnationById = async (id) => {
  try {
    const response = await axios.get(`/destinations/${id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let CancelBooking = async (id) => {
  try {
    const response = await axios.delete(`/bookings/${id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export let createReview = async (
  title,
  content,
  rating,
  destination_id,
  user_id
) => {
  try {
    const response = await axios.post("/reviews", {
      title,
      content,
      rating,
      destination_id,
      user_id,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const getAllBookingTour = async (page, size) => {
  try {
    const response = await axios.get(
      `/bookings/bookingTour?page=${page}&size=${size}`
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const getAllBookingHotel = async (page, size) => {
  try {
    const response = await axios.get(
      `/bookings/bookingDestination?page=${page}&size=${size}`
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`/bookings/${id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export const deleteBookingTour = async (id) => {
  try {
    const response = await axios.delete(`/bookings/tour/${id}`);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export const getBookingCancel = async (id, page, size) => {
  try {
    const response = await axios.get(
      `/bookings/bookingCancel/${id}?page=${page}&size=${size}`
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export const getBookingTourByUserId = async (id, page, size) => {
  try {
    const response = await axios.get(
      `/bookings/userTour/${id}?page=${page}&size=${size}`
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
export const getBookingHotelByUserId = async (id, page, size) => {
  try {
    const response = await axios.get(
      `/bookings/userDestination/${id}?page=${page}&size=${size}`
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
