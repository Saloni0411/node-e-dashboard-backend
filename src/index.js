const express = require('express');
const cors = require('cors')
require('./DB/config');
const route = require('./Routes/route.js');
const app = express();

app.use(express.json());
app.use(cors());

app.use('/', route)

app.listen(5000, console.log('Express App is Running on port 5000..'))