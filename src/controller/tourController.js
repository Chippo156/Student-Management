import axios from "../until/customize-axios";

export const updateTour = async (id, data) => {

    try {
        const response = await axios.put(`/tours/${id}`, data);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}

export const deleteTour = async (id) => {
    try {
        const response = await axios.delete(`/tours/${id}`);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}

export const createTour = async (data) => {
    try {
        const response = await axios.post(`/tours`, data);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}

export const getTourType = async () => {
    try {
        const response = await axios.get(`/tour-type`);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}




