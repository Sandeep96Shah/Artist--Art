const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

// middlewares
app.use(cors());
app.use(express.urlencoded({extended: true}));

// starting the server
app.listen(PORT, (error) => {
    if(error) {
        consolee.log("Server is down!!!");
    }
    console.log(`Server is up and running at port: ${PORT}`);
})
