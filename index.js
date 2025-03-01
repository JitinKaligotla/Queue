const express = require("express")
const passport = require("passport")
const passportlocal = require("passport-local")
const session = require('express-session')
const ejsMate = require ('ejs-mate')
const path = require('path')
const methodOverride = require('method-override')
const mongoose = require("mongoose")
const flash = require("connect-flash")
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const sendEmail= require("./Middleware/SendMail")
const generatePDF = require("./Middleware/pdfGenerator")
const User = require("./Models/UserSchema")
const Appointment = require("./Models/AppointmentSchema")
const Token = require("./Models/TokenSchema")
const Doctors = require("./Seeds/Helpers")

require("dotenv").config();


const ExpressError = require("./Uitls/ExpressError")
const doctors = require("./Seeds/Helpers")

const app = express()

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


mongoose.connect('mongodb://127.0.0.1:27017/Queue', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;      

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});  

app.use(session({
    secret: "yourSecretKey", 
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());  
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.error = req.flash("error")
    res.locals.success= req.flash("success")
    res.locals.currentUser = req.user
    next();
})




app.get("/Register" , (req,res) =>{
    res.render("Register")
})

app.post("/Register" , async (req,res,next) =>{
    try{
    const {email , username , password} = req.body
    const newUser = new User({email , username})
    await User.register(newUser , password)
    req.login(newUser, err => {
        if (err) {
            return next(new ExpressError(err.message, err.statuscode));
        }
        res.render("Appointment"); 
    });
} catch (err) {
    next(new ExpressError(err.message, err.statuscode));
}
})

app.get("/Login" , (req,res) => {
    res.render("Login")
})

app.post("/Login" , passport.authenticate('local' , { failureFlash : true , failureRedirect : "/Login"}) , (req,res) => {
    res.redirect("/MakeAppointment")
})

app.get("/Logout" , (req,res,next) =>{
    req.logout((err) => {
        if (err) {
            return next(new ExpressError(err.message , err.statuscode))

        }
        res.redirect("/login"); 
    });
})

app.get("/MakeAppointment" , (req, res) => {
    if (req.isAuthenticated()){
    res.render("Appointment")
    }
    else {
        res.send("You need to be Login or Register")
    }
})

let doctorIndex = 0; 
app.post("/MakeAppointment", async(req, res , next) => {
    const { problem, patientname , phoneno , description } = req.body;
    const availableDoctors = Doctors.filter(doc => doc.specialty === problem);
    //if (availableDoctors.length === 0) {
    //return res.status(400).send("No doctors available for this problem.");
    //}
    const doctor = availableDoctors[doctorIndex];
    doctorIndex = (doctorIndex + 1) % availableDoctors.length;
    const currentDate = new Date(); 
    const createdat = currentDate.toLocaleDateString(); 
    try {
    const TakeCarer = req.user ? req.user.username : "Jitin"; 
    const TakeCarerEmail = req.user ? req.user.email : "jitin258963@gmail.com"; 
    //console.log(TakeCarerEmail)
    const qrData = JSON.stringify({ patientname, phoneno, description, problem, TakeCarer, TakeCarerEmail });
    const qrImage = await QRCode.toDataURL(qrData);
    const NewAppointment = new Appointment({patientname, 
        phoneno , 
        description, 
        problem, 
        doctor: doctor.doctorName, 
        createdat})
    await NewAppointment.save();
    //const body = "Please come back soon you have your appointment at 9:30"
    //await sendEmail(TakeCarerEmail, body , qrImage);
    //console.log(NewAppointment)
    const Appointmentid = NewAppointment._id
    const lastToken = await Token.findOne({ doctor : doctor.doctorName })
      .sort({ token: -1 })
      .limit(1);

    const nextTokenNumber = lastToken?.token ? lastToken.token + 1 : 1
    const newToken = new Token({
        token : nextTokenNumber ,  
        doctor : doctor.doctorName, 
        Appointment : Appointmentid})
    await newToken.save();
    console.log(newToken)
    const pdfBuffer = await generatePDF({
            patientname,
            phoneno,
            description,
            problem,
            doctor: doctor.doctorName,
            createdat,
            nextTokenNumber
        });
    const pdfAttachment = {
            filename: "appointment.pdf",
            content: pdfBuffer,
            encoding: "base64",  
        };
    const body = "Bring this pdf when you came for the appointment "
    await sendEmail(TakeCarerEmail, body , pdfAttachment)
    res.render("Show", { doctor: doctor, patientname , phoneno , description , qrImage, TakeCarer, createdat, nextTokenNumber  });
   } catch (err) {
    next(new ExpressError(err.message , err.statuscode))
}
});






































app.use((err , req , res , next) => {
    const msg = "Something Went Wrong We Will Get Back To You Shortly 😁😁"
    const { message = msg, statuscode = 500} = err;
    res.status(statuscode).send(message)
})

app.get("/home" , (req,res) => {
    res.send("viewing home")
})

app.listen("4000" , (req,res) => {
    console.log("listening")
})