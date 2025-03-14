const request = require('supertest');
const { app, events, sendReminderEmail } = require('../server'); 


jest.mock('nodemailer');


const mockUser = {
  id: 1,
  email: 'testuser@example.com',
  password: 'Complicated@1',
};

const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, 'random_jwt_secret', {
  expiresIn: '1h',
});

describe('Event API Tests', () => {
 
  it('should create a new event', async () => {
    const newEvent = {
      name: 'Meeting with John',
      description: 'Discuss project milestones',
      date: new Date(Date.now() + 60 * 60 * 1000).toISOString(), 
      time: '10:00 AM',
      category: 'Meetings',
      reminder: true,
    };

    const response = await request(app)  
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(newEvent);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Meeting with John');
    expect(events.length).toBe(1);
  });

 
  it('should return upcoming events', async () => {
    const response = await request(app)  
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`);
      console.log('Generated Token:', token);  

    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });


  it('should send a reminder email for events with reminder enabled', async () => {

    const mockSendMail = jest.fn();
    require('nodemailer').createTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });

   
    const newEvent = {
      name: 'Doctor Appointment',
      description: 'Routine checkup',
      date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      time: '2:00 PM',
      category: 'Appointments',
      reminder: true,
    };

    events.push(newEvent);

    const currentDate = new Date();
    events.forEach(event => {
      if (event.reminder && new Date(event.date) - currentDate <= 30 * 60 * 1000) {
        sendReminderEmail(event);  
      }
    });

    expect(mockSendMail).toHaveBeenCalled();
  });
});
