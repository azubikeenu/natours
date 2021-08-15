// START SERVER
// should be top-most
require('dotenv').config({ path: './config.env' });

const mongoose = require('mongoose');

// handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception ... Shutting down!!');
  process.exit(1);
});

const DB = process.env.DB.replace('<password>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`DB Connected Successfully ⭐`));

const app = require('./app');

const PORT = 4000 || process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} 🚀`);
});

// handle unhandled rejection
process.on('unhandledRejection', (err) => {
  server.close(() => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection ... Shutting down!!');
    process.exit(1);
  });
});
