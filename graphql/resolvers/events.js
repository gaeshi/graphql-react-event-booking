const Event = require('../../models/event');
const User = require('../../models/user');

const {transformEvent} = require("./merge");

const TEMPORARY_HARDCODED_USER_ID = '5c7b7f7d3e970b6d549f7c01';

module.exports = {
    events: async () => {
        try {
            const events = await Event.find().populate('creator');
            return events.map(event => transformEvent(event));
        } catch (e) {
            throw e;
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
};