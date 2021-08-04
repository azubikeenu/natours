// START SERVER
// should be top-most
require('dotenv').config({ path: './config.env' });

const mongoose = require('mongoose');

const DB = process.env.DB.replace('<password>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`DB Connected Successfully ⭐`));

const app = require('./app');

//console.log(app.get('env')); set by express
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} 🚀`);
});
