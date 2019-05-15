const express = require('express');
const cors = require('cors')
const app = express();

const port = 3003;


// cors
var whitelist = ['http://libdev.cmsstage.manchester.ac.uk', 'https://www.library.manchester.ac.uk']
var corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    }
};

app.use(cors(corsOptions), express.static('online-resources/client'));

app.listen(
    port,
    function() {
        console.log("MLE Online Resources App listening on port: " + port);
    }
);