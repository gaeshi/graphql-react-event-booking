import React, {Component} from 'react';
import Spinner from "../components/Spinner/Spinner";
import BookingList from "../components/Bookings/BookingList/BookingList";
import AuthContext from '../context/auth-context';

class BookingsPage extends Component {
    state = {
        isLoading: false,
        bookings: []
    };

    isActive = true;
    static contextType = AuthContext;

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
        const token = this.context.token;

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
    };

    deleteBookingHandler = bookingId => {
        this.setState({isLoading: true});
        const requestBody = {
            query: `
              mutation CancelBooking($id: ID!) {
                cancelBooking(bookingId: $id) {
                  _id
                  title
                }      
              }
            `,
            variables: {id: bookingId}
        };

        console.log(requestBody);

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.context.token
            },
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }

            return res.json();
        }).then(resData => {
            if (this.isActive) {
                this.setState(prevState => {
                    const updatedBookings = prevState.bookings.filter(b => b._id !== bookingId);
                    return {bookings: updatedBookings, isLoading: false};
                });
            }
            console.log(resData);
        }).catch(err => {
            console.log(err);
            if (this.isActive) {
                this.setState({isLoading: false})
            }
        });
    };

    render() {
        return <>
            {this.state.isLoading ?
                <Spinner/> :
                <BookingList
                    bookings={this.state.bookings}
                    onCancelBooking={this.deleteBookingHandler}
                />
            }
        </>;
    }
}

export default BookingsPage;