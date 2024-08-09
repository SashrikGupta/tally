const morgan = require('morgan') ; 
const express = require('express');
const cors = require('cors')
const app = express();
const user_router = require('./routes/user_router') ;
const query_router = require('./routes/query_router') ; ;
const nodemailer = require('nodemailer');
app.use(morgan('dev')) ;  
app.use(express.json());
app.use(cors()) ; 
// app.use((req , res , next)=>{
//     req.requestTime = new Date().toISOString() ; 
//     next() ; 
// })
// app.use('/api/v1/tours' , tour_router) ; 
 app.use('/query' , query_router ) ; 
 app.use('/' , user_router) 
const auth = nodemailer.createTransport({
   service: "gmail",
   secure: true,
   port: 465,
   auth: {
      user: "codeconnect.mail@gmail.com",
      pass: "edka lhlw sque qmgc"
   }
});
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.post('/mail', (req, res) => {
   const { mailId, subject, message } = req.body; // Assuming mailId, subject, and message are sent in the request body
   const receiver = {
      from: "codeconnect.mail@gmail.com",
      to: mailId,
      subject: subject,
      text: message
   };
   auth.sendMail(receiver, (err, emailResponse) => {
      if (err) {
         console.log(err);
         res.status(500).send("Error sending email");
      } else {
         console.log("Email sent successfully");
         res.status(200).send("Email sent successfully");
      }
   });
});


module.exports = app ; 