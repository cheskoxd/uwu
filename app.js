//Handles the sessions
const express = require('express');
const session = require('express-session')
const morgan = require('morgan');
const bodyParser = require('body-parser')
const apiRouter = require('./routes/api')


//connection to the database
const pool = require('./database')

//helpers for hash and other stuff
const helpers = require('./lib/helpers.js')

const app = express();

//Sets view engine
app.set('view engine', 'ejs');

//session
// app.use(session({
//     secret: 'uwuxdthisissecure',
//     resave: false,
//     saveUninitialized: false
// }))

//middleware
app.use(express.static('public'))
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

let port = 3000

app.use('/api', apiRouter);

app.listen(port, ()=>{
    console.log('Server running on port ' + port)
})
