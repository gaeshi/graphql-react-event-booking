import React from 'react';

import './BookingItem.css';

const bookingItem = props => <li key={props.bookingId} className="bookings__item">
    <div className="bookings__item-data">{props.title} - {new Date(props.createdAt).toLocaleDateString()}</div>
    <div className="bookings__item-actions">
        <button
            className="btn"
            onClick={props.onDelete}>Cancel
        </button>
    </div>
</li>;

export default bookingItem;