import React from 'react';

import './BookingList.css';
import BookingItem from "./BookingItem/BookingItem";

const bookingList = props => {
    const bookings = props.bookings.map(booking => (
        <BookingItem
            key={booking._id}
            bookingId={booking._id}
            title={booking.event.title}
            createdAt={booking.createdAt}
            onDelete={props.onCancelBooking.bind(this, booking._id)}/>)
    );

    return <ul className="bookings__list">{bookings}</ul>;
};

export default bookingList;