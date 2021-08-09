// START SERVER
// should be top-most
require('dotenv').config({ path: './config.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

const DB = process.env.DB.replace('<password>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`DB Connected Successfully ⭐`));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO THE DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Imported 🎉');
  } catch (err) {
    console.log('Data could not be imported!!', err);
  } finally {
    process.exit();
  }
};

//DELETE DATA FROM THE DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Deleted 🚮');
  } catch (err) {
    console.log('Data could not be deleted!!', err);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
