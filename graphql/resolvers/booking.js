const Booking = require('../../models/booking');
const Event = require('../../models/event');
const {transformBooking, transformEvent} = require('./merge');

const TEMPORARY_HARDCODED_USER_ID = '5c7b7f7d3e970b6d549f7c01';

module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => transformBooking(booking));
        } catch (err) {
            throw err;
        }

    },
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: TEMPORARY_HARDCODED_USER_ID,
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
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