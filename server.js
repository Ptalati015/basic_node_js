// server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const sanitize = require('mongo-sanitize');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/my_database')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define a schema and model
const formDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String
});

const FormDataModel = mongoose.model('FormData', formDataSchema);

// Middleware
app.use(bodyParser.json());

app.use(express.static('./'));

app.get('/', (req, res) => {
  res.render("index")
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

// Routes
app.post('/api/submit', async (req, res) => {
  const { name, email, message } = req.body;
  console.log("hey");

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const sanitizedData = {
    name: sanitize(name),
    email: sanitize(email),
    message: sanitize(message)
  };

  const formData = new FormDataModel(sanitizedData);

  try {
    const savedData = await formData.save();
    res.json({ success: true, savedData });
    await mongoose.create(savedData);
    res.render('index')
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/user/:name', async (req, res) => {
    try {
      const name = req.params.name;
      const user = await FormDataModel.findOne({ name });
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, email: user.email });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

// app.post("/api/submit", async (req, res) => {
//     const name = req.body.name;
//     const email = req.body.email;
//     const message = req.body.message;
//     const sanitizedData = {
//     name: sanitize(name),
//     email: sanitize(email),
//     message: sanitize(message)
//   };
//   console.log(sanitizedData);
// })

