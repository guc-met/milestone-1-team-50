const mongoose=require('mongoose')
const app=require ('./app')
//require('dotenv').config()


mongoose.connect( "mongodb+srv://advancedpro:advanced1234@cluster0.lugj5.mongodb.net/acml?retryWrites=true&w=majority"
, { useNewUrlParser: true },{ useUnifiedTopology: true }).then(console.log("thank you , you're in "))
