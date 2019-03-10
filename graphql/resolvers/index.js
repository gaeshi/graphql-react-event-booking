const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const BCRYPT_SALT_ROUNDS = 12;
const TEMPORARY_HARDCODED_USER_ID = '5c7b7f7d3e970b6d549f7c01';

const transformEvent = event => ({
    ...event._doc,
    _id: event.id,
    date: new Date(event._doc.date).toISOString(),
    creator: user.bind(this, event.creator)
});

const events = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});
        return events.map(event => transformEvent(event));
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

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (err) {
        throw err;
    }
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find().populate('creator');
            return events.map(event => transformEvent(event));
        } catch (e) {
            throw e;
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(b => {
                return {
                    ...b._doc,
                    _id: b.id,
                    user: user.bind(this, b._doc.user),
                    event: singleEvent.bind(this, b._doc.event),
                    createdAt: new Date(b._doc.createdAt).toISOString(),
                    updatedAt: new Date(b._doc.updatedAt).toISOString()
                }
            })
        } catch (err) {
            throw err;
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
            let createdEvent = transformEvent(result);

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
    },
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: TEMPORARY_HARDCODED_USER_ID,
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result.id,
            user: user.bind(this, result._doc.user),
            event: singleEvent.bind(this, result._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        }
    },
    cancelBooking: async args => {
        const booking = await Booking.findById({_id: args.bookingId}).populate('event');
        const event = transformEvent(booking.event);
        if (!booking) {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('Booking does not exist.');
        }
        await Booking.deleteOne({_id: args.bookingId});
        return event;
    }
};