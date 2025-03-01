const mongoose = require("mongoose")

const passportlocalmongoose = require("passport-local-mongoose")

const DoctorSchema = new mongoose.Schema({
    id : {
        type: Number,
        require : true
    },
    email :{
        type : String,
        require : true
    },
    specality : {
        type: String,
        require : true,
    },
    cabinno :{
        type: String,
        require : true
    }
})

DoctorSchema.plugin(passportlocalmongoose)

const Doctor = mongoose.model("Doctor" , DoctorSchema)

