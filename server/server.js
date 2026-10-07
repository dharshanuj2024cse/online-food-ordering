const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Online Food Ordering Backend Server is Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});
