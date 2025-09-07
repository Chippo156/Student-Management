import axios from "../until/customize-axios";

export let registerUser = async (username, password, email, phone,address,dob,sex,firstname,lastname) => {
  try {
    const response = await axios.post("/users/registration", {
      username: username,
      password: password,
      email: email,
      phone: phone,
      address: address,
      dob: dob,
      first_name: firstname,
      last_name: lastname,
      sex: sex,
    });
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
