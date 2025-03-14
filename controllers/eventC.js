let events = [];  

const createEvent = (req, res) => {
  const { name, description, date, time, category, reminder } = req.body;
  const userId = req.user.userId || req.user.id; 

  const event = {
    id: events.length + 1,  
    name,
    description,
    date,
    time,
    category,
    reminder,
    userId,
  };

  events.push(event);
  res.status(200).json(event); 
};

const getEvents = (req, res) => {
  const userId = req.user.userId || req.user.id; 
  const filteredEvents = events.filter(event => event.userId === userId);

  res.status(200).json(filteredEvents); 
};

module.exports = { createEvent, getEvents, events };