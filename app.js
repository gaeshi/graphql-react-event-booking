const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

app.use('/graphql',
    graphqlHttp({
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }
            
            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }
            
            type RootQuery {
                events: [Event!]!
            }
            
            type RootMutation {
                createEvent(eventInput: EventInput!): Event
            }
            
            schema {
                query: RootQuery 
                mutation: RootMutation
            }
        `),
        rootValue: {
            events: () => {
                return Event.find()
                    .then(events =>
                        events.map(event => ({
                            ...event._doc,
                            _id: event.id
                        }))
                    )
                    .catch(err => {
                        throw err
                    });
            },
            createEvent: (args) => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)
                });
                return event
                    .save()
                    .then(result => {
                        console.log(result);
                        return {
                            ...result._doc, _id: event.id
                        };
                    })
                    .catch(console.error);
            }
        },
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