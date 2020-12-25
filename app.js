const express= require('express');
const staffmemroutes=require('./staff.js');
const mongoose= require ('mongoose'); 
const attendance = require('./attendance.js');
const app = express();
app.use(express.json());
//require('dotenv').config()
const bcryptjs=require('bcryptjs');
const jwt =require('jsonwebtoken');
//const { nextTick } = require('process')
const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`this server is running on port ${PORT}`);
});
mongoose.connect( "mongodb+srv://advancedpro:advanced1234@cluster0.lugj5.mongodb.net/acml?retryWrites=true&w=majority"
, { useNewUrlParser: true },{ useUnifiedTopology: true }).then(console.log("thank you , you're in "))

/*
const staffMembers = require('./models/staffMembers.js');
const attendance=require('./models/attendance.js');
const course=require('./models/course.js');
const courseDep=require('./models/courseDep.js');
const coverage=require('./models/coverage.js');
const faculty=require('./models/faculty.js');
const instructors=require('./models/instructors.js');
const locations=require('./models/attendance.js');
const requests=require('./models/requests.js');

*/


app.use('',staffmemroutes) // if you get / go to user_routes 





app.use(express.urlencoded({extended:false}));

/*const url = "mongodb+srv://advancedpro:advanced1234@cluster0.lugj5.mongodb.net/acml?retryWrites=true&w=majority";///change
const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology:true
}
mongoose.connect(url,connectionParams).then(()=>{
    console.log("db is successfuly connected")
}).catch((error)=>{
    console.log(error)
});*/




