import axios from "../until/customize-axios";

export const getAllDestination = async (page, size) => {
    try {
        const response = await axios.get(`/destinations?page=${page}&size=${size}`);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
    }

export const createDestination = async (data) => {
    try {
        const response = await axios.post(`/destinations`, data);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}   

export const updateDestination = async (id, data) => {
    try {
        const response = await axios.put(`/destinations/update/${id}`, data);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}



export const deleteDestination = async (id) => {
    try {
        const response = await axios.delete(`/destinations/${id}`);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}

