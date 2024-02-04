const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('Mongo server connected!');
  })
  .catch((err) => {
    console.log(err);
  });

const port = 3000 || process.env.PORT;

const server = app.listen(port, () => {
  console.log(`Server Running On Port ${port}...`);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (err) => {
  console.log('Uncaught Rejection');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
