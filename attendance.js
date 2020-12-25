
const { Timestamp } = require('mongodb');
const mongoose=require('mongoose');
const attendance=mongoose.Schema({
    id:{ type:String, required:true},
    date:{ type:Date,
    required:true},
    checkIn:{type:Date},
    checkOut:{type:Date},

 
  
})
attendance.index({id:1,date:1},{unique:true})
module.exports=mongoose.model('attendance',attendance);