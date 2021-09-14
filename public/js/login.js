/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:4000/api/v1/users/login',
      data: { email, password },
    });
    if (res.data.status === 'Success') {
      showAlert('success', 'Successfully logged In');
      setTimeout(() => {
        window.location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
  const res=   await axios({
        method : 'GET',
        url : 'http://127.0.0.1:4000/api/v1/users/logout',
    })
    if(res.data.status === 'Success'){
       // window.location.reload(true)
       window.location.assign('/');
    }
  } catch (err) {
    showAlert('error', "Error logging out try again");
  }
};
