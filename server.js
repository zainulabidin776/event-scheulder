const express = require('express');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authR');
const eventRoutes = require('./routes/eventR');
const protect = require('./middleware/authMiddleware');
const { events } = require('./controllers/eventC'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());


let users = [];

app.use('/api/auth', authRoutes);
app.use('/api/events', protect, eventRoutes);  


if (process.env.NODE_ENV !== 'test') {  
  cron.schedule('* * * * *', async () => {
    const currentDate = new Date();
    events.forEach(event => {
      
      if (event.reminder && new Date(event.date) - currentDate <= 30 * 60 * 1000) {
        sendReminderEmail(event);
      }
    });
  });
}


const sendReminderEmail = (event) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'user@example.com',  
    subject: `Reminder: ${event.name}`,
    text: `Reminder for your event: ${event.name} at ${event.time} on ${event.date}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Reminder email sent: ' + info.response);
    }
  });
};


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, events, sendReminderEmail };  