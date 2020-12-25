const mongoose=require('mongoose');
const courseDep=mongoose.Schema({
      departmentName:{type:String,required:true,unique:true},
      courseName:{type:String,required:true}
})
module.exports=mongoose.model('courseDep',courseDep);