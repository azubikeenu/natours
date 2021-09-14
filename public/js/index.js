/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateProfile } from './updateSettings';

//DOM ELEMENTS
const mapbox = document.getElementById('map');
const email = document.getElementById('email');
const password = document.getElementById('password');
const logInForm = document.querySelector('#login__form');
const logOutButton = document.querySelector('.nav__el--logout');
const userForm = document.querySelector('.form-user-data');
const userName = document.querySelector('.user_name');
const userEmail= document.querySelector('.user_email');
const userPassword =  document.querySelector('.user_password');
const passwordCurrent = document.querySelector('#password-current');
const passwordConfirm = document.querySelector('#password-confirm');

const userPasswordForm  = document.querySelector('.form-user-settings');

if (mapbox) {
  let { locations } = document.querySelector('#map').dataset;
  locations = JSON.parse(locations);
  displayMap(locations);
}

if (logInForm) {
  logInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    login(email.value, password.value);
  });
}

if (logOutButton) {
  logOutButton.addEventListener('click', logout);
}

if (userForm) {
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updateProfile('data' , {email : userEmail.value , name : userName.value});
  });
}
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await updateProfile('password' , {password : userPassword.value , passwordConfirm : passwordConfirm.value , passwordCurrent : passwordCurrent.value});
    userPassword.value='';
    passwordConfirm.value ='';
    passwordCurrent.value='';
  });
}
