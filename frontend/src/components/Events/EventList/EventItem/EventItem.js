import React from 'react';

import './EventItem.css';

const eventItem = props => <li key={props.eventId} className="events__list-item">
    <div>
        <h1>{props.title}</h1>
        <h2>${props.price} - {new Date(props.date).toLocaleDateString()}</h2>
    </div>
    <div>
        {props.userId !== props.creatorId ?
            <button className="btn">View Details</button> :
            <p>You're the owner of this event.</p>}
    </div>
</li>;

export default eventItem;