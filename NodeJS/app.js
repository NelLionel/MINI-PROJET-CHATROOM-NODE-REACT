require('newrelic'); // Importer l'agent New Relic en premier
const express = require('express');
const cors = require('cors');  // Importation de CORS

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//Bring in the routes
app.use("/user", require('./routes/user'));
app.use("/chatroom", require('./routes/chatroom'));

//Setup Cross Origin
app.use(cors());  // Configuration de CORS
//Setup Error Handlers
const errorHandlers = require("./handlers/errorHandlers");
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if (process.env.ENV ==="DEVELOPMENT"){
    app.use(errorHandlers.developmentErrors);
} else {
    app.use(errorHandlers.productionErrors);
}


module.exports = app;