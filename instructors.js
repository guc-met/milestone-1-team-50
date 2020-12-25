
const mongoose=require('mongoose');
const instructors=mongoose.Schema({
     id:{type:Number,required:true},
     courseName:{type:String,required:true},
     slotDay:{type:Number,required:true},
     slotTime:{type:Number,required:true},
     coordinatorID:{type:Number,required:true},
     departmentName:{type:String,required:true},
     daysOff:{type:Array,required:true}
})
module.exports=mongoose.model('instructors',instructors);