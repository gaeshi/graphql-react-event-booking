const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const BCRYPT_SALT_ROUNDS = 12;

const app = express();

app.use(bodyParser.json());

const TEMPORARY_HARDCODED_USER_ID = '5c7b7f7d3e970b6d549f7c01';

const events = eventIds => {
    return Event
        .find({_id: {$in: eventIds}})
        .then(events => events.map(event => ({
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event.creator)
        })))
};

const user = userId => {
    return User.findById(userId)
        .then(user => ({
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        }))
        .catch(err => {
            throw err;
        });
};

app.use('/graphql',
    graphqlHttp({
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
                creator: User!
            }
            
            type User {
                _id: ID!
                email: String!
                password: String
                createdEvents: [Event!]
            }
            
            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }
            
            input UserInput {
                email: String!
                password: String!
            }
            
            type RootQuery {
                events: [Event!]!
            }
            
            type RootMutation {
                createEvent(eventInput: EventInput!): Event
                createUser(userInput: UserInput!): User
            }
            
            schema {
                query: RootQuery 
                mutation: RootMutation
            }
        `),
        rootValue: {
            events: () => {
                return Event.find()
                    .populate('creator')
                    .then(events =>
                        events.map(event => ({
                            ...event._doc,
                            _id: event.id,
                            creator: user.bind(this, event._doc.creator)
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
                    date: new Date(args.eventInput.date),
                    creator: TEMPORARY_HARDCODED_USER_ID
                });
                let createdEvent;
                return event
                    .save()
                    .then(result => {
                        createdEvent = {
                            ...result._doc,
                            _id: result._doc._id.toString(),
                            creator: user.bind(this, result._doc.creator)
                        };
                        return User.findById(TEMPORARY_HARDCODED_USER_ID);
                    })
                    .then(user => {
                        if (!user) {
                            throw new Error('User does not exist.');
                        }

                        user.createdEvents.push(event);
                        return user.save();
                    })
                    .then(result => {
                        return createdEvent;
                    })
                    .catch(console.error);
            },
            createUser: args => {
                return User.findOne({email: args.userInput.email})
                    .then(user => {
                        if (user) {
                            throw new Error('User already exists.');
                        }

                        return bcrypt.hash(args.userInput.password, BCRYPT_SALT_ROUNDS)
                    })
                    .then(hashedPassword => {
                        const user = new User({
                            email: args.userInput.email,
                            password: hashedPassword
                        });
                        return user.save()
                    })
                    .then(result => {
                        console.log(result);
                        return {...result._doc, password: null, _id: result.id};
                    })
                    .catch(err => {
                        console.error(err);
                        throw err;
                    });
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