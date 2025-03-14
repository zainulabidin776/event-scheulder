const request = require('supertest');
const { app, events, sendReminderEmail } = require('../server'); // Import app and sendReminderEmail
const jwt = require('jsonwebtoken');

// Mock the nodemailer transport to prevent sending real emails during tests
jest.mock('nodemailer');

// Mock user authentication
const mockUser = {
  id: 1,
  email: 'testuser@example.com',
  password: 'Complicated@1',
};

// Generate a mock JWT token
const token = jwt.sign({ userId: mockUser.id, email: mockUser.email }, 'random_jwt_secret', {
  expiresIn: '1h',
});

describe('Event API Tests', () => {
  // Test: Create a new event
  it('should create a new event', async () => {
    const newEvent = {
      name: 'Meeting with John',
      description: 'Discuss project milestones',
      date: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      time: '10:00 AM',
      category: 'Meetings',
      reminder: true,
    };

    const response = await request(app)  // Use app here
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(newEvent);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Meeting with John');
    expect(events.length).toBe(1);
  });

  // Test: Get upcoming events
  it('should return upcoming events', async () => {
    const response = await request(app)  // Use app here
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`);
      console.log('Generated Token:', token);  // Add this line to inspect the token

    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test: Check if reminder email functionality works
  it('should send a reminder email for events with reminder enabled', async () => {
    // Mock the sendMail function
    const mockSendMail = jest.fn();
    require('nodemailer').createTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });

    // Add an event to test reminder
    const newEvent = {
      name: 'Doctor Appointment',
      description: 'Routine checkup',
      date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      time: '2:00 PM',
      category: 'Appointments',
      reminder: true,
    };

    events.push(newEvent);

    // Trigger the reminder manually in the test
    const currentDate = new Date();
    events.forEach(event => {
      if (event.reminder && new Date(event.date) - currentDate <= 30 * 60 * 1000) {
        sendReminderEmail(event);  // Call the actual function from server.js
      }
    });

    expect(mockSendMail).toHaveBeenCalled();
  });
});
