const Booking = require('../../models/booking');
const Event = require('../../models/event');
const {transformBooking, transformEvent} = require('./merge');
const {checkAuth} = require("../../helpers/auth");

module.exports = {
    bookings: async (_, req) => {
        checkAuth(req);
        try {
            const bookings = await Booking.find({user: req.userId});
            return bookings.map(booking => transformBooking(booking));
        } catch (err) {
            throw err;
        }

    },
    bookEvent: async (args, req) => {
        checkAuth(req);
        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: req.userId,
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    cancelBooking: async (args, req) => {
        checkAuth(req);
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