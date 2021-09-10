/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
 try{
    const res =  await axios({
        method : 'POST',
        url : 'http://127.0.0.1:4000/api/v1/users/login',
        data : { email, password }
       })
       if(res.data.status === 'Success'){
            showAlert( "success","Successfully logged In" ,);
            setTimeout(()=>{
                window.location.assign('/')
            }, 1500)
       }
 }catch(err){
    showAlert( "error",err.response.data.message);
 }
};
