const express = require('express');
const cors = require('cors');
const meetupsList = require('./model/meetupsList');

const app = express();
const port = 4000;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/meetups',(req, res) => {
    res.json(meetupsList);
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});