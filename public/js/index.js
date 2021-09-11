/* eslint-disable */
import '@babel/polyfill';
import { login ,logout} from './login';
import { displayMap } from './mapbox';

//DOM ELEMENTS
const mapbox = document.getElementById('map');
const email = document.getElementById('email');
const password = document.getElementById('password');
const logInForm = document.querySelector('form');
const logOutButton = document.querySelector('.nav__el--logout')



if (mapbox) {
let { locations } = document.querySelector('#map').dataset;
locations = JSON.parse(locations);
  displayMap(locations);
}

if(logInForm){
   logInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login(email.value, password.value);
      });
}

if(logOutButton){
   logOutButton.addEventListener('click' , logout)
}
