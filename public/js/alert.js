/*eslint-disable*/
export  const  showAlert = (type , message) => {
   hideAlert()
    const html = `<div class='alert alert--${type}'>${message} </div>`
   document.body.insertAdjacentHTML('afterbegin', html);
   // hide alert after 5 secs
   setTimeout(hideAlert,5000)
};

const hideAlert = ()=>{
   const alert =  document.querySelector('.alert');
   if(alert) alert.parentElement.removeChild(alert);
}
