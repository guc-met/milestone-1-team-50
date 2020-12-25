
const express=require('express');
const router=express.Router();
const bcryptjs=require('bcryptjs');
require('dotenv').config()
const jwt =require('jsonwebtoken');


const teachingSlot = require('./teachingSlot.js')
const staffMembers = require('./staffMembers.js');
const attendance = require('./attendance.js');
const location= require('./locations.js');
const requests=require('./requests.js');
const staffIDs=require('./staffIDs.js')
const course=require('./course.js')
const courseDep= require('./courseDep.js')
const coverage= require('./coverage.js')
const faculty= require('./faculty.js')

const instructor= require('./instructors.js')



const { async } = require('rsvp');
const { Router } = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

router.route('/changepassword')
.get(async (req,res,next)=>{
    res.send('Please change your password')
     
})
.put(async(req,res,next)=>{
   try{let email=req.body.email
   let password=req.body.password;//new password
    if(!email||!password){
        res.send("Please Enter valid valid email or password");
    }
    
  const salt = await bcryptjs.genSalt();
  const passwordHashed = await bcryptjs.hash(password,salt);
 const existingUser= await staffMembers.findOneAndUpdate({"email":email},{"password":passwordHashed},{new:true})
  return res.send('Password Updated!')} ///redirect?????
 
    catch(error){
        res.status(500).json({error:error.message});
    
       }
})

/////////////////////YOUSRA'S ROUTES///////////////////////////

router.route('/')  //login
    .get(async(req, res, next) => { 
        res.send('LogIn page'); 
    }) 

    .post(async(req,res)=>{
        try{
            const {email,password}=req.body;
            if(!email||!password){
                res.send("Please Enter valid valid email or password");
    
            }
            if(password=="123456"){
                res.redirect('/Changepassword')
                }
            const existingUser= await staffMembers.findOne({email:email});
             const isMatched=await bcryptjs.compare(password,existingUser.password);
             
             if(isMatched){
            
          const token = jwt.sign({id:existingUser.id,email:existingUser.email,officeLocation:existingUser.officeLocation
         ,salary:existingUser.salary,role:existingUser.role, name:existingUser.name, daysOff:existingUser.daysOff,department
        :existingUser.department},""+process.env.JWT_KEY);
         res.header('auth-token',token).send(token)
         const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
         
    }
            if(!isMatched)
        {
           res.send("Invalid credentials");

        }         }
    catch(error)
    {
        res.status(500).json({error:error.message});
    }
})
   

///logout
router.route('/logout')
.get(async(req,res)=>
{ 
 res.redirect('/')
})



///Update their profile
router.route('/updateprofile')
.get(async(req,res)=>{
res.send('Update Your Profile.')
})

.put(async(req,res)=>{ //check if email is unique??
    const email=req.body.email;
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
    if(mem!=null){
       
 if(mem.department !='hr'){
    
    const user= await staffMembers.findOneAndUpdate({"email":mem.email},
    {
    "officeLocation":req.body.officeLocation,
    "daysOff":req.body.daysOff,
    "role":req.body.role},
    {new:true})
    res.send('Profile Updated!')
    }
  else{
    const user= await staffMembers.findOneAndUpdate({"email":mem.email},
    {
    "officeLocation":req.body.officeLocation,
    "daysOff":req.body.daysOff,
    "role":req.body.role,
    "salary":req.body.salary,
    "department":req.body.department}
    ,{new:true})
   
res.send('Profile Updated!')
  }
        }
    }
)


//view profile
router.route('/viewprofile')
    .get(async(req,res)=>{
       try{
       const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
      
       res.send( 'Name :'+mem.name +'\n'+' Email : '+ mem.email+
        '\n'+ 'Id : ' + mem.id+
        '\n'+' Office Location : '+ mem.officeLocation+
        '\n'+' Salary : '+mem.salary+
        '\n'+ 'DaysOff : '+ mem.daysOff+
        '\n'+ 'Department : ' +mem.department+
        '\n'+' Role : '+mem.role );}
        catch(error)
    {
        res.status(500).json({error:error.message});
    }
   
    })
   

//signin
router.route('/signin')
.post(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
          let rec= new attendance({
            id:mem.id,
            date:Date.now(),
            checkIn:req.body.time, //el time 3ndy bayez
           checkOut:null,
          // status=null
            })
        rec.save()
        res.send("Signed In Successfully!")
           }
    catch(error){
        res.status(500).json({error:error.message});
    }
})

router.route('/signout')
.put(async(req,res)=>{
    try{
        
     const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
     
     var date= new Date();
     console.log(date);
     const rec= await attendance.findOneAndUpdate({"id":mem.id},{"checkOut":date},{new:true}).sort({ _id:-1});
     return res.status(500).send("Signed Out!") 
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
})
//get missing hours


router.route('/missing hours')
.get(async(req,res)=>{
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
    //for month ===nowww
  
    var datenow=new Date();
    const rec=await attendance.find({id:mem.id},('date -_id missinghours'));
    res.send(rec)
})

//records
 router.route('/records')
    .get(async(req,res)=>{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        const rec=await attendance.find({id:mem.id},('date -_id'));
        res.send(rec);
    })

 //get month
.post(async (req,res)=>{
    try{
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
    
    const mymonth= req.body.month
    var nextmonth;
    if(mymonth=='January'){
        nextmonth="Febuary"
    }
    if(mymonth=='Frebuary'){
        nextmonth="March"
    }
    if(mymonth=='March'){
        nextmonth="April"
    }
    if(mymonth=='April'){
        nextmonth="May"
    }
    if(mymonth=='May'){
        nextmonth="June"
    }
    if(mymonth=='June'){
        nextmonth="July"
    }
    if(mymonth=='July'){
        nextmonth="August"
    }
    if(mymonth=='August'){
        nextmonth="September"
    }
    if(mymonth=='september'){
        nextmonth="October"
    }
    if(mymonth=='October'){
        nextmonth="November"
    }
    if(mymonth=='November'){
        nextmonth="December"
    }
    if(mymonth=='December'){
        nextmonth="January"
    }
    const startdate=new Date('2020-'+mymonth+'-12');
    const enddate=new Date('2020'+'-'+nextmonth+'-11');
    startdate.setHours(2,0,0,0);
    enddate.setHours(1,59,0,0);
   const rec= await attendance.find({id:mem.id,date:{
        $gte: startdate,
        $lte: enddate }
},('date -_id'))
res.send(rec)}
catch(error)
{
    res.status(500).json({error:error.message});
}
})



//////////////////SARA'S ROUTES/////////////////
router.route('/locationAffairs')
.post(async(req,res)=>{
    try
   { const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
    if(mem.department=="hr")
  { const l=await location.findOne({"location":req.body.location})
   if(l==null){
    const loc=new location({
        location:req.body.location,
        remainingPlaces:req.body.capacity,
        capacity:req.body.capacity,
        type:req.body.type})
    
    await loc.save()
    res.send(loc)
    console.log("location inserted");
   }
   else{
       res.send("please enter a new location name")
   }
   
    }
    else{
        res.send("this route for hr only ")
    }}
    catch(error){
        res.status(500).json({error:error.message});
    }
})
.delete(async(req,res)=>{
   try
   {  const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
   if(mem.department=="hr")
      { const result=await location.findOneAndRemove({"location":req.body.location})
    //console.log("deletesd")
    if(result!=null){
        res.send("the location deleted successfuly")
    }
    else{
        res.send("there is no data for this location")}   
    
}
else{
    res.send("this route for hr only")
}
}
catch(error){
    res.status(500).json({error:error.message});
}

})
.put(async(req,res)=>{
    try
    {
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
        if(mem.department=="hr")
   { const loc=await location.findOne({"location":req.body.location})
    if(loc!=null){
    if(req.body.capacity!=null){
        let newcap=req.body.capacity
        let remnew=loc.remainingPlaces+(newcap-loc.capacity)
        let result= await location.findOneAndUpdate({"location":req.body.location},{"capacity":req.body.capacity,"remainingPlaces":remnew},{new:true})
       
    }
    result=await location.findOneAndUpdate({"location":req.body.location},req.body,{new:true})
    
    
    res.send(result);}}
    else{
        res.send("this route for hr only")
    }}
    catch(error){
        res.status(500).json({error:error.message});
    }
})
router.route('/facultyAffairs')
.post(async(req,res)=>{
  try { 
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
    if(mem.department=="hr")
      {const fi=await faculty.findOne({"facultyName":req.body.facultyName})
    if(fi==null)
   { const fac=new faculty({
       facultyName:req.body.facultyName
    })
    await fac.save();
    if(req.body.departmentName!=null)
   { async function makedep(depname){
        const dep= new courseDep({
            departmentName:depname
        })
        await dep.save();
    }
    fac.departmentName.forEach(makedep)}
    res.send(fac);
    console.log("faculty inserted");}
    else{
        res.send("the faculty already inserted")
    }}
    else{
        res.send("this route for hr only")
    }
   }
   catch(error){
    res.status(500).json({error:error.message});
}
})
.put(async (req,res)=>{
    try
   {  const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
   if(mem.department=="hr")
       {const result=await faculty.findOne({"facultyName":req.body.facultyName})
    if(result!=null){
        async function removedep(depname){
           const removed= await courseDep.findOneAndRemove({"departmentName":depname})
        }
        result.departmentName.forEach(removedep)
       
          const updt=  await faculty.findOneAndUpdate({"facultyName":req.body.facultyName},req.body,{new:true})
            async function makedep(depname){
                const dep= new courseDep({
                    departmentName:depname
                })
                await dep.save();
            }
            updt.departmentName.forEach(makedep)
            res.send(updt); 
            console.log("faculty updated successfuly")
        }}
       else{
           res.send("this route for hr only")
       }
      } 
      catch(error){
        res.status(500).json({error:error.message});
    }
})
.delete(async(req,res)=>{
    
     try { const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
     if(mem.department=="hr")
          { const result=await faculty.findOne({"facultyName":req.body.facultyName})
        if(result!=null){
            async function removedep(depname){
               const removed= await courseDep.findOneAndRemove({"departmentName":depname})
            }
            result.departmentName.forEach(removedep)
           await faculty.findOneAndRemove({"facultyName":req.body.facultyName})
            res.send("the faculty deleted successfuly")
            
        }
        else{
            res.send("no faculty with this name")
        }
    }
     else{
         res.send("this route for hr only")
     }}
        catch(error){
            res.status(500).json({error:error.message});
        }
})

router.route('/departmentAffairs')
.post(async(req,res)=>{
 try {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
 if(mem.department=="hr")
     { const fac= await faculty.findOne({"facultyName":req.body.facultyName});
    if(fac!=null){
        console.log("faculty to add department found")
        fac.departmentName.push(req.body.departmentName)
        const fin=await courseDep.findOne({"departmentName":req.body.departmentName})
        if(fin==null)
        {const dep=new courseDep({
            departmentName:req.body.departmentName
        })
        await dep.save();
        await fac.save();
        res.send(fac)}
        else{
            res.send("this department already in this faculty ")
        }
      
    }
    else{
        res.send('there is no such a faculty')
    }}
     else{
         res.send("this route for hr only")
     }}
    catch(error){
        res.status(500).json({error:error.message});
    }
  
})
.put(async (req,res)=>{
    
     try   {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
     if(mem.department=="hr"){const fac=await faculty.findOne({"facultyName":req.body.facultyName})
        if(fac!=null){
            const indx=fac.departmentName.indexOf(req.body.departmentName)
            if(fac.departmentName.includes(req.body.departmentName)){
                const deldep =await courseDep.findOneAndRemove({"departmentName":req.body.departmentName})
                const addep=new courseDep({
                    departmentName:req.body.departmentName2
                })
                await addep.save();
            fac.departmentName.splice(indx,1,req.body.departmentName2)
            await fac.save();
            console.log("department updated successfuly")
            res.send(fac);}
            else{
                res.send("the department you want to update does not exist")
            }
        }
        else{
            res.send('the faculty you want to update a department from it doesnt exist')
        }
        }
        else{
            res.send("this route for hr only")
        }
      }
      catch(error){
        res.status(500).json({error:error.message});
    }  
})
.delete(async(req,res)=>{
  try {
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
    if(mem.department=="hr")
    {const fac=await faculty.findOne({"facultyName":req.body.facultyName})
    if(fac!=null){
        if(fac.departmentName.includes(req.body.departmentName)){
            const deldep =await courseDep.findOneAndRemove({"departmentName":req.body.departmentName})
         const indx=fac.departmentName.indexOf(req.body.departmentName)
        fac.departmentName.splice(indx,1);
        await fac.save();
        console.log("department deleted successfuly")
        res.send(fac);}
        else{
            res.send("the department you want to delete does not exist")
        }
    }
    else{
        res.send('the faculty you want to delete a department from it doesnt exist')
    }}
    else{
        res.send("this route for hr only")
    }}
    
    catch(error){
        res.status(500).json({error:error.message});
    }  
})
router.route('/courseAffairs')
.post(async(req,res)=>{
 try  {
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
    if(mem.department=="hr")
     { const dep= await courseDep.findOne({"departmentName":req.body.departmentName});
     if(dep!=null){
         console.log("department that you want found !")
         dep.courseName.push(req.body.courseName)
         await dep.save();
         const cours=new course({
            courseName:req.body.courseName 
         }) 
         await cours.save()
         const covr=new coverage({
             department:req.body.departmentName,
             course:req.body.courseName
         })
         await covr.save()
        
        
         res.send(dep)
     }
     else{
         res.send('there is no such a department')
     }}
   else{
       res.send("this route for hr only ")
   }
   }  catch(error){
    res.status(500).json({error:error.message});
} 
 })
 .put(async (req,res)=>{
     
     try   { const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
     if(mem.department=="hr")
         {const dep=await courseDep.findOne({"departmentName":req.body.departmentName})
         if(dep!=null){
             if(dep.courseName.includes(req.body.courseName)){
             const indx=dep.courseName.indexOf(req.body.courseName) 
             dep.courseName.splice(indx,1,req.body.courseName2)
             await dep.save();
             const cors= await course.findOneAndUpdate({"courseName":req.body.courseName},{"courseName":req.body.courseName2},{new:true})
             const cvr=await coverage.findOneAndUpdate({"course":req.body.courseName},{"course":req.body.courseName},{new:true})
             console.log("course updated successfuly")
             res.send(dep);}
             else{
                 res.send("the course you want to update does not exist")
             }
         }
         else{
             res.send('the department you want to update a course from it doesnt exist')
         }}
        else{
            res.send("this route for hr only")
        }}
         catch(error){
            res.status(500).json({error:error.message});
        } 
         
       
 })
 .delete(async(req,res)=>{
  try { 
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
    if(mem.department=="hr")
    {const dep=await courseDep.findOne({"departmentName":req.body.departmentName})
    if(dep!=null){
        if(dep.courseName.includes(req.body.courseName)){
        const indx=dep.courseName.indexOf(req.body.courseName) 
        dep.courseName.splice(indx,1)
        await dep.save();
        const crs=await course.findOneAndDelete({"courseName":req.body.courseName})
        const cvr= await coverage.findOneAndDelete({"courseName":req.body.courseName})
        console.log("course deleted successfuly")
        res.send(dep);}
        else{
            res.send("the course you want to delete does not exist")
        }
    }
    else{
        res.send('the department you want to delete a course from it doesnt exist')
    }}
else{
    res.send("this route for hr only")
}}
    catch(error){
        res.status(500).json({error:error.message});
    } 
    
     
     
 })
 router.route('/staffAffairs')
 .post(async(req,res)=>{
    try {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
    if(mem.department=="hr")
        {let {office,email,department,salary,name}=req.body
     if(!office||!email||!department||!salary||!name){
         res.send("please enter unique email,name,salary,office,department")
     }
      const locdata=await location.findOne({"location":req.body.office})
     // const mail=await staffMembers.findOne({"email":req.body.email})
     ////default academic member
     let bolloc=false;
      let idtype="";
      let rol=""
      let dayoff=["friday"]
      if(locdata!=null){
       if(locdata.remainingPlaces>0){
           bolloc=true
           console.log("the place found and there is enough capacity ")
           const locnewcap=await location.findOneAndUpdate({"location":req.body.office},{"remainingPlaces":locdata.remainingPlaces-1},{new:true})
        }
        else{
            res.send("the office is full ,please re-enter your data")
        }   
    }
    else{
        res.send("there is no such a location ,please re-enetr your data ")
    }
    if(req.body.department=="hr"){
        idtype="hr-"
        dayoff.push("saturday")
        let last=staffIDs[0].id.length+1
        staffIDs[0].id.push(1)

        idtype+=last
        
    }
    else{
        idtype="ac-"
         rol="academicMember"
        let last=staffIDs[1].id.length+1
        staffIDs[1].id.push(1)
        idtype+=last
    }
    if(bolloc){
    const staff=new staffMembers({
        name:req.body.name,
        email:req.body.email,
        id:idtype,
        officeLocation:req.body.office,
        salary:req.body.salary,
        daysOff:dayoff,
        department:req.body.department,
        role:rol
}) 
      await staff.save();
      res.send(staff)
      console.log("staff inserted , congrats !")
} }
else{
    res.send("this route for hr only")
}
}
catch(error){
    res.status(500).json({error:error.message});
} 
 }
 )
 .put(async (req,res)=>{
     try {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
     if(mem.department=="hr")
         {const staff=await staffMembers.findOneAndUpdate({"id":req.body.id},req.body,{new:true})
      if(staff!=null){
         res.send(staff)
         console.log("staff member updated successfully !")
      }
      else{
          res.send("the employee you are tring to update doesnot exist !")
      }}
    else{
        res.send("this route for hr only")
    }}
      catch(error){
        res.status(500).json({error:error.message});
    } 
 } )
 .delete(async(req,res)=>{
     try { const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
     if(mem.department=="hr")
          {const staff= await staffMembers.findOne({"id":req.body.id});
        if(staff!=null){
        const loc =await location.findOne({"location":staff.officeLocation})
        await location.findOneAndUpdate({"location":loc.location},{"remainingPlaces":loc.remainingPlaces+1},{new:true})
        await staffMembers.findOneAndDelete({"id":req.body.id})
        res.send("the staff member deleted successfully !")}
        else{
            res.send('there is no staff with this id !')
        }}
    else{
        res.send("this route for hr only")
    }}
        catch(error){
            res.status(500).json({error:error.message});
        }
 })
 router.route('/updateSalary')
.put(async (req,res)=>{
  try {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
  if(mem.department=="hr")
       {if(req.body.id==null || req.body.newSalary==null){
        res.send("please enter id and newSalary ")
    }else{
    const staff=await staffMembers.findOneAndUpdate({"id":req.body.id},{"salary":req.body.newSalary},{new:true})

    if(staff!=null){
    res.send(staff)}
    else{
        res.send("no staff member with the entered ID !")
    }}}
else{
    res.send("this route for hr only")
}}
    catch(error){
        res.status(500).json({error:error.message});
    }

})
router.route('/addMissingSign')
.put(async(req,res)=>{
   try{const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
   if(mem.department=="hr")
       { if(mem.id==req.body.id){
        res.send("you can not add missing sign in or out for yourself")
    }else{
           if(req.body.id==null||req.body.date==null){
        res.send("please enter id and date to update the record")
    }
    const att=await attendance.findOne({"id":req.body.id,"date":req.body.date})
    if(att!=null){
        if(req.body.checkOut!=null){
            if(att.checkOut!=null){
                res.send("the checkOut time already exists")
            }
            else{
                await attendance.findOneAndUpdate({"id":req.body.id,"date":req.body.date},{"checkOut":req.body.checkOut},{new:true})
                res.send("checkout added!")
            }
        }
        if(req.body.checkIn!=null){
            if(att.checkIn!=null){
                res.send("the checkIn time already exists")
            }
            else{
                await attendance.findOneAndUpdate({"id":req.body.memberID,"date":req.body.date},{"checkIn":req.body.checkOut},{new:true})
                res.send("checkIn added!")
            }
        }
    }
    else{
        res.send("there is no attendence for the entered infos !")
    }}}
else{
    res.send("this route for hr only")
}}
    catch(error){
        res.status(500).json({error:error.message});
    }
})
router.route('/viewAtttendanceRecord')
.get(async(req,res)=>{
  try {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
  if(mem.department=="hr")
       {await attendance.find({"id":req.body.id},function(err,docs){
        if(docs!=null){
            res.send(docs)
        }
        else{
            res.send("no attendance record forthe entered ID")
        }
        if(err){
            res.send(err)
        }
    })}
else{
    res.send("this route for hr only")
}}
    catch(error){
        res.status(500).json({error:error.message});
    }
})
router.route('/viewMissingHoursOrDays')
.get(async(req,res)=>{
   try {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY)
   
   if(mem.department=="hr")
       {
     const staff=await staffMembers.findOne({"id":req.body.id})
    if(staff!=null)
    {if(req.body.type=="hours"){
    let finl=""
    const missingHours=168-staff.hours
    if(missingHours<0){
       finl="your extra hours : "
       finl+=missingHours*-1
    }
    else{
        finl="your missong hours : "
        finl+=missingHours
    }
    res.send(finl)
   }
    if(req.body.type=="days"){
        const nowdate=new Date()
        
        let nowday=nowdate.getDate()
        let nowmonth=nowdate.getMonth()
        let nowyear=nowdate.getFullYear()
        let missedday=[]
        let monthstart=nowmonth
        let yearstart=nowyear
        let dayof=[6]
        const dayoff2=staff.daysOff.pop()
        if(dayoff2=="saturday")
           dayof.push(0)
        if(dayoff2=="sunday") 
        dayof.push(1)  
        if(dayoff2=="moday")
        dayof.push(2)
        if(dayoff2=="tuesday")
        dayof.push(3)
        if(dayoff2=="wensday")
        dayof.push(4)
        if(dayoff2=="thursday")
        dayof.push(5)
        if(nowday<=10){
            nowday+=30
            if(monthstart==0){
               yearstart-=1
               monthstart=11
            }
            else{
                monthstart-=1
            }

        }
        let datloop=1
        for (let startday = 11; startday <=nowday; startday++) {
            if(startday>30){
                startday=datloop
                datloop+=1
            }
             let ttoday=new Date()
             //yearstart-monthstart-startday
             ttoday.setDate(startday)
             ttoday.setMonth(monthstart)
             ttoday.setFullYear(yearstart)
            const element = await attendance.findOne({"id":staff.id,"date":ttoday})
            if(element==null){
                missedday.push(ttoday)
            }
            
        }
        let missdayfinal=[]
        for(let i=0;i<missedday.length;i++){
             if(missedday[i].getDay()!=6&&missedday[i]!=dayof[1]){
                 missdayfinal.push(missedday[i])
             }
        }
        res.send(missdayfinal)
    }
    else{
        res.send("please enter days or hours")
    }}
    else{
        res.send("there is no staff with this id")
    }}




else{
    


    
    if(req.body.type=="hours"){
    let finl=""
    const missingHours=168-mem.hours
    if(missingHours<0){
       finl="your extra hours : "
       finl+=missingHours*-1
    }
    else{
        finl="your missong hours : "
        finl+=missingHours
    }
    res.send(finl)
   }
    if(req.body.type=="days"){
        const nowdate=new Date()
        
        let nowday=nowdate.getDate()
        let nowmonth=nowdate.getMonth()
        let nowyear=nowdate.getFullYear()
        let missedday=[]
        let monthstart=nowmonth
        let yearstart=nowyear
        let dayof=[6]
        const dayoff2=mem.daysOff.pop()
        if(dayoff2=="saturday")
           dayof.push(0)
        if(dayoff2=="sunday") 
        dayof.push(1)  
        if(dayoff2=="moday")
        dayof.push(2)
        if(dayoff2=="tuesday")
        dayof.push(3)
        if(dayoff2=="wensday")
        dayof.push(4)
        if(dayoff2=="thursday")
        dayof.push(5)
        if(nowday<=10){
            nowday+=30
            if(monthstart==0){
               yearstart-=1
               monthstart=11
            }
            else{
                monthstart-=1
            }

        }
        let datloop=1
        for (let startday = 11; startday <=nowday; startday++) {
            if(startday>30){
                startday=datloop
                datloop+=1
            }
             let ttoday=new Date()
             //yearstart-monthstart-startday
             ttoday.setDate(startday)
             ttoday.setMonth(monthstart)
             ttoday.setFullYear(yearstart)
            const element = await attendance.findOne({"id":mem.id,"date":ttoday})
            if(element==null){
                missedday.push(ttoday)
            }
            
        }
        let missdayfinal=[]
        for(let i=0;i<missedday.length;i++){
             if(missedday[i].getDay()!=6&&missedday[i]!=dayof[1]){
                 missdayfinal.push(missedday[i])
             }
        }
        res.send(missdayfinal)
    }
    else{
        res.send("please enter days or hours")
    }
    }
   
}
    catch(error){
        res.status(500).json({error:error.message});
    }
})




/////////////////TOKA'S ROUTES///////////////////
router.route('/viewReqState')
.get(async(req,res)=>{
    try{
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

    if(req.body.state=="accepted"){
    const result= await requests.find({"senderID": mem.id,"state":"accepted"},
    function(err,docs){
        if(docs!=null){
            res.send(docs);
        }
        else{
            res.send("there are no any accepted requests")
        }
        if(err)
        res.send(err)
    })
   }
    if(req.body.state=="pending"){
        //console.log("in if")
        const result= await requests.find({"senderID": mem.id,"state":"pending"},
        
        function(err,docs){
            if(docs!=null){
                res.send(docs);
            }
            else{
                res.send("there are no any pending requests")
            }
            if(err)
            res.send(err) 
        })
        }
        if(req.body.state=="rejected"){
            const result= await requests.find({"senderID": mem.id,"state":"rejected"},
            function(err,docs){
                if(docs!=null){
                    res.send(docs);
                }
                else{
                    res.send("there are no any rejected requests")
                }
                if(err)
            res.send(err)
            })
            }}
            catch(error){
                res.status(500).json({error:error.message});
            }


})
router.route('/cancelReq')
.delete(async (req,res)=>{
    try{ const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
   
     var today= new Date();
    
    const result= await requests.findOne({"reqId":req.body.rId,"senderID":mem.id})
    if (result!=null){
        if(result.dayReqOff>today){
           await requests.findOneAndDelete({"reqId":req.body.rId,"senderID":mem.id})
           res.send("request that is yet to come canceled successfuly")
        }
        if(result.state=="pending"){
        await requests.findOneAndDelete({"reqId":req.body.rId,"senderID":mem.id})
        res.send("pending request canceled successfully")

    }}
    else{
        res.send("the request already had a response")
    }}

    catch(error){
        res.status(500).json({error:error.message});
    }
})

router.route('/sendReplacementReq')
.post(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

    const result= await teachingSlot.findOne({"staffID":req.body.replID,"courseName":req.body.cname})
   
    if(result!=null){
        const fady= await teachingSlot.findOne({"staffID":req.body.replID,"slotTime":req.body.sTime,"slotDay":req.body.sDay})
        if(fady==null){
            const request= new requests({
              reciverID:req.body.replID,
             senderID:mem.id,
             type:"replacement",
             dayReqOff:req.body.date
})
            await request.save();
            res.send(request)
             console.log("replacement sent to staff ")
    }
}
const dep= await staffMembers.findOne({"id":mem.id})

if(dep!=null){
   
const hod=await staffMembers.findOne({"department":dep.department,"role":"HOD"})

if(hod!=null){
    console.log("hod foun")
 const request= new requests({
 
     reciverID:hod.id,
     senderID:mem.id,
     type:"replacement",
     dayReqOff:req.body.date

    })
    await request.save();
    res.send(request)
 console.log("replacement sent to HOD")
}
}
 else{
     res.send("there is no such a department ")
 }}
 catch(error){
    res.status(500).json({error:error.message});
}

})
router.route('/viewReplacmentReq')
.get(async(req,res)=>{
    try{ const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
    const result=await requests.find({"senderID":mem.id,"type":"replacement"}||{"reciverID":mem.id,"type":"replacement"},
    function (err,docs) {
        if(docs!=null){
            res.send(docs)
        }
        else{
            res.send("there is no replacmennt requests for this member")
        }
        if(err){
            res.send(err)
        }
    })}
    catch(error){
        res.status(500).json({error:error.message});
    }

})
router.route('/viewSchedule')
.get(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

    await teachingSlot.find({"staffID":mem.id},
    function(err,docs){
        if(docs.length>0){
        res.send(docs);}
        else{
            res.send("there is no staff with this ID")
        }

    } )
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
})

router.route('/changeDayReq')
.post(async (req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

    const dep= await staffMembers.findOne({"id":mem.id})
    if(dep!=null){
               const hod=await staffMembers.findOne({"department":dep.department,"role":"HOD"})
               if(hod!=null){
                const request= new requests({
                
                    reciverID:hod.id,
                    senderID:mem.id,
                    type:"changeDayOff",
                    reason:req.body.reason
    
                   })
                   await request.save();
                res.send(request)
                   
           }}
           else{
           res.send("there is no member with this id")}}
           catch(error){
            res.status(500).json({error:error.message});
        }

})
router.route('/sendSlotLinkingRequest')
.post(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

    
    const course= await teachingSlot.findOne({"staffID":mem.id,"courseName":req.body.cname})
    if(course!=null){

    const cood= await staffMembers.findOne({"courseName":req.body.cname,"role":"coordinator"})
    if(cood!=null){
    const request= new requests({
 
        reciverID:cood.id,
        senderID:mem.id,
        type:"slotLinking",
        slotTime:req.body.stime,
       slotLoc:req.body.sLoc,
       slotDay:req.body.sDay,
       dayReqOff:req.body.sdate
        
   
       })  
       await request.save();
        res.send(request);
    } else{
        res.send("there is no course coordinator")
    }}
    else{
        res.send("you cant place the request")
    }}
    catch(error){
        res.status(500).json({error:error.message});
    }

}
)
router.route('/getNotified')
.get(async(req,res)=>{
    try{
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

    let result= await requests.find({"senderID":mem.id},
    function(err,docs){
        if(docs!=null){
            const messages= docs.map(element => element.message)
            if(messages===0){
                res.send("no notifications")

            }
            else{
                res.send(messages)
            }
        
        }
        else{
            res.send("you didnt place any requests")
        }
        if(err){
            res.send(err)
        }

        
    }
    
    )}
    catch(error){
        res.status(500).json({error:error.message});
    }
}
)
router.route('/sendLeaveRequest')
.post(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

    const dep= await staffMembers.findOne({"id":mem.id})
    if(dep!=null){
            const hod=await staffMembers.findOne({"department":dep.department,"role":"HOD"})
            if(hod!=null){
                if(req.body.leavetype=="compensation"){

             const request= new requests({
             
                 reciverID:hod.id,
                 senderID:mem.id,
                 type:"leave",
                 leaveType:req.body.leavetype,
                 reason:req.body.reason,
                 dayReqOff:req.body.date
 
                })
                await request.save();
             res.send(request);
                
        }
        else {
            const request= new requests({
             
                reciverID:hod.id,
                senderID:mem.id,
                type:"leave",
                leaveType:req.body.leavetype,
                
                dayReqOff:req.body.date

               })
               await request.save();
            res.send(request);

        }
    }
    }
    else{
        res.send("there is no member with this id")

    }}
    catch(error){
        res.status(500).json({error:error.message});
    }

})
    //////////////////Mariam//////////////////
    //1st: Assign/delete/update a course instructor for each course in his department.
router.route('/instructor')

.post(async function(req,res){
    
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role == "hod")
        {
            const hod = await staffMembers.findOne({"id":req.body.mem.id })///token //get the hod from table staffMembers by id

   const member =await staffMembers.findOne({"id": req.body.id})          //get the member from the table staffMembers by id

 if(hod!=null && member!=null){                                           //check if both are actually there in the table
   if(hod.department == member.department)                                //check if hod's department is the same as the member's department
   {
       const dep=await courseDep.findOne({"departmentName":hod.department})//get the department from table courseDep whose name is the same as that of the hod  to access its courses array
       let flg=false
       for(let i=0;i<dep.courseName.length;i++){                           //loop over the array of courses to:
           if(dep.courseName[i]==req.body.courseName)                      //check if the course sent by hod is in the department if the hod
           {
               flg=true;
               break;
           }
       }
       if(flg){
   
    await staffMembers.findOneAndUpdate({"id":req.body.id},{"role":"instructor","courseName":req.body.courseName},{new:true})
     res.send("Instructor Assigned Succesfully")                          //update that member's role in the staffMembers table to become an "instructor", and update the coursename to become the course they're gonna teach
   }
   else 
   {
       res.send("Instructor Does Not Exist In Your Department")
   }
   }
   else
   {
            res.send("This Course Is Not In Your Department")
   }
   }
   else{
       res.send("No such HOD or Member")
   }
        }

   
  }
  catch(error){
      res.status(500).json({error:error.message})
  }
})
.delete(async function(req, res){
    try{
        if(mem.role == "hod")
        {
            const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
   
            const hod = await staffMembers.findOne({"id": req.body.mem.id })  //get the hod from table staffMembers by id
            
            const member = await staffMembers.findOne({"id": req.body.id})   //get the member from table staffMembers by id
         
            if(hod.department == member.department)                          //check if hod's department is the same as the member's department
            {
                 const result = await instructors.findOneAndRemove({"id": req.body.id}) //find that instructor in the instructors table by id and remove them
                 if(result!=null)
                 { await findOneAndUpdate({"id":req.body.id},{"role":null,"courseName":null},{new:true})
                    return res.send("Instructor Deleted Successfully")
                 }
             }
             else
             {
                 return res.send("No Data Provided")
             }
        }
       
}
catch(error){
    res.status(500).json({error:error.message})
}
})

.put(async function(req,res){
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role == "hod")
        {
   const hod = await staffMembers.findOne({"id": req.body.mem.id })    //get the hod from table staffMembers by id
   
   const member = await staffMembers.findOne({"id": req.body.id})     //get the member from table staffMembers by id

   if(hod.departmentName == member.departmentName)                    //check if hod's department is the same as the member's department
   { 
       const dep=await courseDep.findOne({"departmentName":hod.department})  //get the department from table courseDep whose name is the same as that of the hod  to access its courses array
       let flg=false
       for(let i=0;i<dep.courseName.length;i++){                        //loop over the array of courses to: 
       if(dep.courseName[i]==req.body.courseName)                       //check if the course sent by hod is in the department if the hod
       {
           flg=true;
           break;
       }
      }
   if(flg){ //(below) find the instructor by id and update his courseName and departmentName to the courseName and departmentName sent by hod and 
    const output = await instructors.findOneAndUpdate({"id": req.body.id},{"courseName":req.body.courseName,"departmentName":req.body.departmentName},{new:true})
     if(output!=null){       //if there is such instructor then send output
     return res.send(output)
    }
     else
     {
         res.send("No Instructor With This ID ")
     }
   }
   else{res.send("This Course is Not in Your Department")}
}
else{
    res.send("This Member is Not in Your Department")
}

        }
}
catch(error){
    res.status(500).json({error:error.message})
}
})

//2nd: View all the staff in his/her department || View all the staff in his/her department per course along with their profiles
router.route('/Staff')
.get(async function(req,res){
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

        if(mem.role == "hod")
        {
            const hod = await staffMembers.findOne({"id":req.body.mem.id })
            if(req.body.type=="department"){
            const output = await staffMembers.find({"department": hod.department},function(err,docs){
                if(docs!=null){
                    res.send(docs)
                }
                else{
                    res.send(err)
                }
                if(err){
                    res.send(err)
                }
            }) 
         }
             if(req.body.type=="course"){
                 const dep=await courseDep.findOne({"departmentName":hod.department})
                 let flg=false
                 for(let i=0;i<dep.courseName.length;i++){
                     if(dep.courseName[i]==req.body.courseName){
                         flg=true;
                         break;
                     }
                 }
                 if(flg){
                 const output = await staffMembers.find({"courseName": req.body.course},function(err,docs){
                     if(err!=null){
                         res.send(docs)
                     }
                     else{
                         res.send(err)
                     }
                     if(err){
                         res.send(err)
                     }
                 })}
                 else{
                     res.send("this course is not in your dep")
                 }
             }
             else{
                 res.send("please specify course or dep")
             }
        }
       
}
catch(error){
    res.status(500).json({error:error.message})
}
})



//3rd: view the days off of a single staff in his/her department
router.route('/DaysOff')
.get(async function (req,res){
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role == "hod") 
        {

   const hod = await staffMembers.findOne({"id": req.body.mem.id })
   if(req.body.id==null){
   const output = await staffMembers.find({"department": hod.department},('daysOff') )
    if(output!=null){
        res.send(output)
    }
    else{
        res.send("there is no staff in your dep")
    }
}
   else{
       const stf=await staffMembers.findOne({"id":req.body.id})
       if(stf.department==hod.department){
       if(stf!=null){
           res.send(stf.daysOff)
       }
       else{
           res.send("no staff with this id")
       }}
       else{
           res.send("this member is not in your dep")
       }
       
   }
        }
        
}
catch(error){
    res.status(500).json({error:error.message})
}
})

//4th: View all the “change day off/leave” requests sent by staff members in his/her department
router.route('/requests')
.get(async function(req,res){
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

        if(mem.role == "hod") 
        {
   const hod = await staffMembers.findOne({"id":req.body.mem.id})
  
   const output = await requests.find({"type": "Change Day Off", "reciverID":hod.id} || {"type": "Leave", "reciverID":hod.id})
   if(output.length>0) {
       res.send(output)
   }
   else{
       res.send("There Are No Requests ")
   }

        }
}
catch(error){
    res.status(500).json({error:error.message})
}
})

//5th: Accept a request. if a request is accepted, appropriate logic should be executed to handle this request.
router.route('/acceptRequest')
.put(async function(req,res){
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

        if(mem.role == "hod")
        {
   const hod = await staffMembers.findOne({"id": req.body.hodid }) //get the hod by id from staffMembers table

   const request = await requests.findOne({"reqId": req.body.reqId})  //get the id of the request from the requests table
 console.log(request)
   const member = await staffMembers.findOne({"id": request.senderID}) 
    //get the member who sent that request
if(request.reciverID == hod.id)
{
    if(member.department == hod.department)                         //check if memeber is in department of hod
    { 
        //Handling Change Day Off Requests
        if(request.state == "pending" && request.type == "Change Day Off")       //check if request state is pending and its type
        {
         const output = await requests.findOneAndUpdate({"reqId": req.body.reqId}, {"state":"Accepted", "message": "The request with the following request id:"+ req.body.reqId + "is accpeted"}) //find the request by id and update its state to Accepted
         let dyof=["friday",req.body.newdayOff]                         
         await staffMembers.findOneAndUpdate({"id": request.senderID}, {"daysOff":dyof},{new:true}) 
         res.send("Request Accepted")
        }

        //Handling Leave Requests
        if(request.state == "pending" && request.type == "Leave")
        {
            
         const output = await requests.findOneAndUpdate({"reqId": req.body.reqId}, {"state":"Accepted", "message": "The request with the following request id:"+ req.body.reqId + "is accpeted"},{new:true})       
         res.send("Request Accepted")  
        }
        
        else
        {
            res.send("This Request Has Already Been Resolved")
        }
    
    }
    else 
    {
        res.send("This Member Is Not in Your Department")
    }
}
}
}
catch(error){
    res.status(500).json({error:error.message})
}
})

//6th: Reject a request
router.route('/rejectRequest')
.put(async function(req,res){
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

        if(mem.role == "hod")
        {
    const hod = await staffMembers.findOne({"id": req.body.mem.id }) //get the hod by id from staffMembers table
   // const hod = await staffMembers.findOne({"id": req.body.hodid })

    const request = await requests.findOne({"reqId": req.body.reqId})  //get the id of the request from the requests table
 
    const member = await staffMembers.findOne({"id": request.senderID})  //get the member who sent that request
 if(request.reciverID == hod.id)
 {
     if(member.department == hod.department)                         //check if memeber is in department of hod
     {
         if(request.state == "pending" && request.type == "Change Day Off")       //check if request state is pending and its type
         {
          const output = await requests.findOneAndUpdate({"reqId": req.body.reqId}, {"state":"Rejected", "message": "The request with the following request id:"+ req.body.reqId + "is rejected"}) //find the request by id and update its state to Accepted
          res.send("Request Rejected")
         }
         
         else if(request.state == "pending" && request.type == "Leave")
         {
          const output = await requests.findOneAndUpdate({"reqId": req.body.reqId}, {"state":"Rejected", "message": "The request with the following request id:"+ req.body.reqId + "is rejected"})  
          res.send("Request Rejected")       
         }
         
         else
         {
             res.send("This Request Has Already Been Resolved")
         }
     }
    
     else 
     {
         res.send("This Member Is Not in Your Department")
     }
 }
}
}
catch(error){
    res.status(500).json({error:error.message})
}
})


//7th: View the coverage of each course in his/her department
router.route('/coverage')
.get(async function(req,res){
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);

        if(mem.role == "hod")
        {
  
    if(hod!=null)
    {
    const output = await coverage.find({"course": req.body.course,"department": hod.department},('coverage'))
    if(output.length>0)
    {
        res.send(output)
    }
    else
    {
        res.send("no courses available")
    }
    }
else{
    res.send("invalid hod ID")
    } 
}
    }
catch(error){
    res.status(500).json({error:error.message})
}
})

//8th: view teaching assigments of a course offered by his department (view who teaches some course in his department in which slot)
router.route('/teachingAssignments')
.get(async function(req,res){
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role == "hod")
        {
  
  
    const hod = await staffMembers.findOne({"id":req.body.mem.id })
    const courses=await courseDep.findOne({"departmentName":hod.department})
    let fnl=[];
    async function tes(courseName) 
    {
        console.log(courseName)
        let slts=await teachingSlot.find({"courseName":courseName})
        if(slts.length>0)
        {
            fnl.push(slts)
          
        }
        console.log(fnl)
        
    }
   await courses.courseName.forEach(tes)
   res.send(fnl)
}
    }
catch(error){
    res.status(500).json({error:error.message})
}
})



////////INSTRUCTOR&COORD ROUTES///////
router.route('/viewcoursecoverage')
.get(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role=="Instructor"){
        const rec=await coverage.find({"instructorID":mem.id},('-_id coverage course'));
        res.send(rec)
    }
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
})

router.route('/assignedslot')
.get(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role=="instructor"){
        const rec=await course.find({"instructorID":mem.id},('-_id courseName assigned slotTime slotLocation'));
        res.send(rec)
    }
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
})

.put(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role=="instructor"){
            const rec=await course.findOneAndUpdate({"instructorID":mem.id, "course":req.bodycourse},{"assigned":req.body.assigned});
            res.send(rec)
        
        }
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
})
//Assign an academic member to an unassigned slots in course(s) he/she is assigned to
router.route('/assignmember')
.put(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role=="instructor"){
            const rec=await course.findOneAndUpdate({"instructorID":mem.id, "course":req.body.course},{"assigned":req.body.assigned});
            res.send(rec)
        
        }
    }
    catch(error){
        res.status(500).json({error:error.message});
    }
})

router.route('/viewAllStaff')
.get(async(req,res)=>{
    try{
        const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
        if(mem.role=="instructor"){
        const inst= await staffMembers.findOne({"id":mem.id})
    const dep=await staffMembers.find({"department":inst.department}||{"courseName":inst.courseName},
    function(err,docs){
        if(docs!=null){
            res.send(docs)
        }
        if(err){
            res.send(err)
        }
    }
    )}
}
catch(error){
    res.status(500).json({error:error.message});
}


})
//slot linking request.
router.route('/SLreq')
.get(async(req,res)=>{
  try{
    const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
     const reqs= await requests.find({"reciverID":mem.id,"type":"slotLinking"},function (err,docs) {
         if(docs!=null){
             res.send(docs)
         }
         else{
             res.send("there is no resquests sent to you")
         }
         if(err){
             req.send(err)
         }
         
     })}
     catch(error){
        res.status(500).json({error:error.message});
    }
   
   
})

//Accept the request and update the schedule or refuse it.
.put(async(req,res)=>{
   try
   { const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
       const reqs=await requests.findOneAndUpdate({"reqId":req.body.reqID,"reciverID":mem.id},{"state":req.body.state},{new:true})

    if(reqs!=null){
        if(req.body.state=="accepted"){
            const slot=new teachingSlot({
                staffID:reqs.senderID,
                slotTime:reqs.slotTime,
                slotLoc:reqs.slotLoc,
                slotDay:reqs.slotDay,
                courseName:reqs.courseName
            }
            )
            await slot.save();
            res.send("Your request is accepted, please check your schedule.")
        }
        else if(req.body.state == "refused"){
            res.send("Your request is refused.");
            
        }
    }
}
catch(error){
    res.status(500).json({error:error.message});
}
})

//Add/update/delete course slot(s) in his/her course.
router.route('/courseSlotsUpdate')
.post(async(req,res)=>{ 
 try { const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
      const staff = await teachingSlot.findOne({"staffID":req.body.staffID})
    if(staff != null){
        const slot=new teachingSlot({
            staffID:req.body.senderID,
            slotTime:req.body.slotTime,
            slotLoc:req.body.slotLoc,
            slotDay:req.body.slotDay,
            courseName:req.body.courseName
        }
        )
        await slot.save();
        res.send("Your schedule is added.")
    }
    else 
    {
        res.send("There is no such ID.");
        
    }
    if(err){
        res.send(err);
    }}
    catch(error){
        res.status(500).json({error:error.message});
    }
})
.put(async(req,res)=>{
    try
    {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
    const id = await teachingSlot.findOne({"staffID":req.body.teachingSlot});
    const updateSlots = await teachingSlot.findOneAndUpdate(
        {"slotTime":req.body.slotTime},req.body,{new:true},
        {"slotLocation":req.body.slotLoc},req.body,
        {"slotDay":req.body.slotDay},req.body,
        {"slotDate":req.body.slotDate},req.body,
        {"courseName":req.body.courseName},req.body
        )
        await updateSlots.save();
        res.send(updateSlots);}
        catch(error){
            res.status(500).json({error:error.message});
        }
})

.delete(async(req,res)=>{
  try {const mem=jwt.decode(req.header('auth-token'),process.env.JWT_KEY);
       const id = await teachingSlot.findOne({"staffID":req.body.teachingSlot});
    if(id!=null){
        async function removeSlot(id){
            const removed = await teachingSlot.findOneAndRemove({"staffID":id},{"slotTime":req.body.slotTime},{"slotDate":req.body.slotDate})
        }
        id.teachingSlot.forEach(removed);
        res.send("The slot is deleted succesfuly.")
    } 
    else{
        res.send
        ("This staff member has no slots")
    }} catch(error){
        res.status(500).json({error:error.message});
    }
 })
module.exports.app=app;
module.exports= router;
 



  

