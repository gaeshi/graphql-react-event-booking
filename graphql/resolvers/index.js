const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const BCRYPT_SALT_ROUNDS = 12;
const TEMPORARY_HARDCODED_USER_ID = '5c7b7f7d3e970b6d549f7c01';

const events = eventIds => {
    return Event
        .find({_id: {$in: eventIds}})
        .then(events => events.map(event => ({
            ...event._doc,
            _id: event.id,
            date: new Date(event._doc.date).toISOString(),
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

module.exports = {
    events: () => {
        return Event.find()
            .populate('creator')
            .then(events =>
                events.map(event => ({
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
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
                    date: new Date(event._doc.date).toISOString(),
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
};