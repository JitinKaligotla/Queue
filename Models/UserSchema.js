const mongoose = require("mongoose")

const passportlocalmongoose = require("passport-local-mongoose")


const UserSchema = new mongoose.Schema({
    email :{
        type:String,
        required : true
    }
})


UserSchema.plugin(passportlocalmongoose)

const User = mongoose.model("User" , UserSchema)

module.exports = User


