const fs = require('fs');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const port = 4000;

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.f1oomps.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

client.connect(function (err) {
  if (err) console.log(err);

  console.log('Connected successfully to server');

  const db = client.db('meetupsData');
  const collection = db.collection('meetups');

  // Find some documents
  collection.find({}).toArray(function (err, docs) {
    if (err) console.log(err);

    console.log('Found the following records');
    console.log('docs', docs);
  });

  client.close();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/meetups', async (req, res) => {
  console.log('api/meetups data requested');

  const result = await client
    .db('meetupsData')
    .collection('meetups')
    .find({})
    .toArray();

  res.json(result);
});

app.get('/api/meetups/favorites', async (req, res) => {
  console.log('api/meetups favorites data requested');

  const result = await client
    .db('meetupsData')
    .collection('meetups')
    .find({favorite: true})
    .toArray();

  res.json(result);
});

app.put('/api/meetups/favorites/:id', async (req, res) => {
  console.log('api/meetups favorites data requested');
  const meetupId = req.params.id;
  const meetupById = await client
                      .db('meetupsData')
                      .collection('meetups')
                      .findOne({id: meetupId});
  
  const favorite = !meetupById.favorite;
  const result = await client
    .db('meetupsData')
    .collection('meetups')
    .updateOne({id: meetupId}, {$set: {favorite: favorite}});

    res.json(result);
});

app.post('/api/meetups', async (req, res) => {
  console.log('api/meetups data posted');
  const meetup = req.body;
  if (!meetup) {
    return res.status(400).json({ message: 'No meetup data provided' });
  }

  const id = uuidv4();
  const newMeetup = { ...meetup, id };

  try {
    await client.db('meetupsData').collection('meetups').insertOne(newMeetup);
    return res.json(newMeetup);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error occurred DB error' });
  }
});

app.delete('/api/meetups/:id', async(req, res) => {
  console.log('api/meetups data deleted');
  const meetupId = req.params.id;
  
  const result = await client.db('meetupsData').collection('meetups').deleteOne({id: meetupId});
  res.json(result);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});