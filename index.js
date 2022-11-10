const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/mongoose');
const PORT = 8000;

// middlewares
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use('/', require('./routes/index'));

// starting the server
app.listen(PORT, (error) => {
    if(error) {
        consolee.log("Server is down!!!");
    }
    console.log(`Server is up and running at port: ${PORT}`);
})
