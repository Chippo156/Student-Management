import axios from "../until/customize-axios";

export let getTourById = async (id) => {
    try {
        const response = await axios.get(`/tours/${id}`);
        return response;
    } catch (error) {
        console.error(error);
        return error;
    }
}

export let getTourImages = async (id) => {
    try {
        const response = await axios.get(`/tour-images/tour/${id}`);
        return response.result;
    } catch (error) {
        console.error(error);
        return error;
    }
}

export let getListByTourId = async (id) => {
    try {
        const response = await axios.get(`/itineraries/tour/${id}`);
        return response.result;
    } catch (error) {
        console.error(error);
        return error;
    }
}