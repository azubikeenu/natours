/* eslint-disable */
import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './mapbox';

//DOM ELEMENTS


const mapbox = document.getElementById('map');
// const email = document.getElementById('email').value;
// const password = document.getElementById('password').value;
const logInForm = document.querySelector('form');



if (mapbox) {
let { locations } = document.querySelector('#map').dataset;
locations = JSON.parse(locations);
  displayMap(locations);
}

if(logInForm){
   logInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
      });
}
