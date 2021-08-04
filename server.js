// START SERVER
// should be top-most
require('dotenv').config({ path: './config.env' });

const app = require('./app');

//console.log(app.get('env')); set by express
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} 🚀`);
});
