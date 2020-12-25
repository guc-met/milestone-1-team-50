const mongoose=require('mongoose');
const faculty=mongoose.Schema({
    facultyName:{type:String,required:true,unique:true},
    departmentName:{type:String},
    instructorID:{type:String,required:true}
});
module.exports=mongoose.model('faculty',faculty);