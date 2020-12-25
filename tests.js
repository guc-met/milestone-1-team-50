const mongoose= require ('mongoose'); 
require('dotenv').config();
mongoose.connect(process.env.DB_URL_Test,{
    useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log('Successfully Connected to The Test Database'))