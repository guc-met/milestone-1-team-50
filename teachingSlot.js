const mongoose=require('mongoose');
const teachingSlot=mongoose.Schema({
      staffID:{type:String,required:true},
      slotTime:{type:String,required:true},
      slotLoc:{type:String,required:true},
      slotDay:{type:String,required:true},
      courseName:{type:String,required:true}
      
})
teachingSlot.index({staffID:1,slotTime:1,slotDay:1},{unique:true})
module.exports=mongoose.model('teachingSlot',teachingSlot);