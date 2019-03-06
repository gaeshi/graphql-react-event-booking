const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const BCRYPT_SALT_ROUNDS = 12;
const TEMPORARY_HARDCODED_USER_ID = '5c7b7f7d3e970b6d549f7c01';

const events = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});
        return events.map(event => ({
            ...event._doc,
            _id: event.id,
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, event.creator)
        }));
    } catch (e) {
        throw e;
    }
};

const user = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find().populate('creator');
            return events.map(event => ({
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event._doc.creator)
            }));
        } catch (e) {
            throw err
        }
    },
    createEvent: async args => {
        try {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: TEMPORARY_HARDCODED_USER_ID
            });

            const result = await event.save();
            let createdEvent = {
                ...result._doc,
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };

            const creator = await User.findById(TEMPORARY_HARDCODED_USER_ID);
            if (!creator) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('User does not exist.');
            }

            creator.createdEvents.push(event);
            await creator.save();

            return createdEvent;
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    createUser: async args => {
        const existingUser = await User.findOne({email: args.userInput.email});
        try {
            if (existingUser) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('User already exists.');
            }

            const hashedPassword = await bcrypt.hash(args.userInput.password, BCRYPT_SALT_ROUNDS);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });

            const result = await user.save();
            return {...result._doc, password: null, _id: result.id};
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
};