const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema');
const graphQlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use('/graphql',
    graphqlHttp({
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
        graphiql: true
    }));

app.get('/healthz', (req, res) => {
    res.send("Healthy");
});

mongoose.connect(`mongodb+srv://${
    process.env.MONGO_USER}:${
    process.env.MONGO_PASSWORD}@cluster0-6pxl2.mongodb.net/${
    process.env.MONGO_DB
    }?retryWrites=true`)
    .then(() => {
        console.log('connected');
        app.listen(3000)
    })
    .catch(console.error);