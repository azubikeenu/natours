/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const updateProfile = async (name, email) => {
  try {
   const res =  await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:4000/api/v1/users/updateMe',
      data: { name, email },
    });

    if (res.data.status === 'Success') {
      showAlert('success', 'Successfully Updated details');
      setTimeout(() => {
        window.location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
