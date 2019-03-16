const DataLoader = require('dataloader');

const {dateToString} = require("../../helpers/date");

const Event = require('../../models/event');
const User = require('../../models/user');

const eventLoader = new DataLoader(eventIds => events(eventIds));
const userLoader = new DataLoader(userIds => User.find({_id: {$in: userIds}}));

const events = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});
        events.sort((a, b) => eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString()));
        return events.map(event => transformEvent(event));
    } catch (e) {
        throw e;
    }
};

const user = async userObj => {
    try {
        const user = await userLoader.load(userObj);
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: () => eventLoader.loadMany(user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    }
};

const singleEvent = async eventId => {
    try {
        return await eventLoader.load(eventId.toString());
    } catch (err) {
        throw err;
    }
};

const transformBooking = booking => ({
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
});

const transformEvent = event => ({
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator)
});

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;