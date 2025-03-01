const mongoose = require("mongoose")

const Appointment = require("./AppointmentSchema")

const TonkenSchema = new mongoose.Schema({
    token : {
        type: Number,
        required : true
    },
    doctorName :{
        type:String,
        require:true
    },
    Appointment :{
        type : mongoose.Schema.Types.ObjectId,
        ref : Appointment
    }
})

const Token = mongoose.model("Token" , TonkenSchema)

module.exports = Token


