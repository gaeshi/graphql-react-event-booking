import React, {Component} from 'react';
import Spinner from "../components/Spinner/Spinner";

class BookingsPage extends Component {
    state = {
        isLoading: false,
        bookings: []
    };

    isActive = true;

    componentDidMount() {
        this.fetchBookings();
    }

    fetchBookings = () => {
        this.setState({isLoading: true});

        const requestBody = {
            query: `query {
              bookings {
                _id
                createdAt
                event {
                  _id
                  title
                  date
                }
              }
            }
            `
        };

        console.log(requestBody);

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }

            return res.json();
        }).then(resData => {
            const bookings = resData.data.bookings;
            if (this.isActive) {
                this.setState({bookings, isLoading: false});
            }
            console.log(resData);
        }).catch(err => {
            console.log(err);
            if (this.isActive) {
                this.setState({isLoading: false})
            }
        });
    };

    componentWillUnmount() {
        this.isActive = false;
    }

    render() {
        return <>
            {this.state.isLoading ?
                <Spinner/> :
                <ul>
                    {this.state.bookings.map(booking =>
                        <li key={booking._id}>
                            {booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}
                        </li>)}
                </ul>
            }
        </>;
    }
}

export default BookingsPage;