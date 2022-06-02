const express = require('express');
const dotenv = require('dotenv');

dotenv.config({
  path: `${__dirname}/config.env`,
});

const PORT = process.env.PORT;
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
