
//working on this script
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb://10.20.8.4:27017'; // Change this to your MongoDB URI
const DB_NAME = 'oplatform_analytics'; // Change this to your MongoDB database name
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
// MongoDB client setup
let db;
app.use(express.static(path.join(__dirname)));
MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        db = client.db(DB_NAME);
    })
    .catch(error => console.error('Failed to connect to MongoDB', error));
   
// Route to handle data collection
app.post('/collect', async (req, res) => {
   
    try {
      let data = req.body.data;
      let type  = req.body.type;
        // Check if the data with the same session and user ID already exists
        const collection = db.collection('analytics_data');
        const existingData = await collection.findOne({
            'data.userId': data.userId,
            'data.sessionId': data.sessionId
        });

        if (existingData) {
            return res.status(400).json({ success: false, message: 'Data already exists for this session and user ID' });
        }
        // If not exists, insert the data into the database
        const result = await collection.insertOne(data);
        res.status(200).json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving data', error });
    }
});

app.post('/checktag', async (req, res) => {
  let data = req.body;
  
   const existingData = await db.collection('analytics_tags').findOne({
    'tag': data.tag,
    'domain': { $regex: new RegExp(data.domain, 'i') } // 'i' for case-insensitive
  });
  res.status(200).json({ success: 'success', data: existingData });
});
app.get('/checkAlltag', async (req, res) => {
  try {
    // Retrieve all documents from the analytics_tags collection
    const existingData = await db.collection('analytics_tags').find().toArray();
    
    console.log(existingData); // You can log the data to verify

    // Send the documents as a JSON response
    res.status(200).json({ success: true, data: existingData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Route to serve the JavaScript file
app.get('/script/v1/o-analytics.js', (req, res) => {
  const filePath = path.join(__dirname, 'scripts/v1/o-analytics.js');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
    }
  });
});
app.listen(PORT, () => {
});

