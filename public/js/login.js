/*eslint-disable*/

const login = async (email, password) => {
 try{
    const res =  await axios({
        method : 'POST',
        url : 'http://127.0.0.1:4000/api/v1/users/login',
        data : { email, password }
       })
       if(res.data.status === 'Success'){
           alert('Logged in successfully')
            setTimeout(()=>{
                window.location.assign('/')
            }, 1500)
       }
 }catch(err){
    alert(err.response.data.message);
 }


};
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email,password);
});
