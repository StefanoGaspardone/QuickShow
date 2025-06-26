import { useEffect, useState } from "react";

import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';

import { useAppContext } from '../../contexts/AppContext';

import dateFormat from '../../libs/dateFormat.mjs';
import toast from "react-hot-toast";

const ListBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { axios, user, getToken } = useAppContext();

    useEffect(() => {
        const getAllBookings = async () => {
            try {
                const { data } = await axios.get('/api/admin/bookings', {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                });

                if(data.success) setBookings(data.bookings);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
                toast.error(error.message);
            }
        }

        setIsLoading(true);
        if(user) getAllBookings();
        setIsLoading(false);
    }, [user]);

    return !isLoading ? (
        <>
            <Title text1 = 'List' text2 = 'Bookings'/>
            <div className = 'max-w-4xl mt-6 overflow-x-auto'>
                <table className = 'w-full border-colapse rounded-md overflow-hidden text-nowrap'>
                    <thead>
                        <tr className = 'bg-primary/20 text-left text-white'>
                            <th className = 'p-2 font-medium pl-5'>User Name</th>
                            <th className = 'p-2 font-medium'>Movie Name</th>
                            <th className = 'p-2 font-medium'>Show Time</th>
                            <th className = 'p-2 font-medium'>Seats</th>
                            <th className = 'p-2 font-medium'>Amount</th>
                        </tr>
                    </thead>
                    <tbody className = 'text-sm font-light'>
                        {bookings.map((booking, index) => (
                            <tr key = { index } className = 'border-b border-primary/20 bg-primary/5 even:bg-primary/10'>
                                <td className = 'p-2 min-w-45 pl-5'>{booking.user.name}</td>
                                <td className = 'p-2'>{booking.show.movie.title}</td>
                                <td className = 'p-2'>{dateFormat(booking.show.showDateTime)}</td>
                                <td className = 'p-2'>{Object.keys(booking.bookedSeats).map(seat => booking.bookedSeats[seat]).join(', ')}</td>
                                <td className = 'p-2'>&euro; {booking.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    ) : (
        <Loading/>
    );
}

export default ListBookings;