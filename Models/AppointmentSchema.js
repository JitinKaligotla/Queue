const mongoose = require("mongoose")


const User = require("./UserSchema")


const AppointmentSchema = new mongoose.Schema({
    User : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    patientname :{
        type: String,
        require : true
    },
    phoneno : {
        type: Number,
        require : true,
        min : [10, "Not a Valid Number"]
    },
    description : {
        type : String,
        require : true
    },
    problem:{
        type:String,
        require:true
    },
    doctor : {
        type : String,
        require: true
    },
    createdat : {
        type : Date,
        require : true
    },
    //status : {
       // type: String,
       // enum: ["pending" , "completed"]
   // }
})


const Appointment = mongoose.model("Appointment" , AppointmentSchema)
module.exports = Appointment