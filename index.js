const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/UMs');

const express = require('express');
const app = express();


//for user route
const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

app.listen(3000,function () {
    console.log('Server is running........');
});

