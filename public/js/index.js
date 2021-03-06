/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateProfile } from './updateSettings';
import {bookTour} from './stripe'
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

const bookButton = document.getElementById('book-tour');

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
    const formData = new FormData();
    formData.append('email' , userEmail.value);
    formData.append('name' , userName.value);
    formData.append('photo' , document.getElementById('photo').files[0])
    console.log(formData);
    updateProfile('data' , formData);
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


if(bookButton){
  bookButton.addEventListener('click', async e =>{
    e.target.textContent = `Processing....`;
    let {tourid} = e.target.dataset;
     await bookTour(tourid)
  })
}
