import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';

import { useAppContext } from '../contexts/AppContext';

import timeFormat from '../libs/timeFormat.mjs';
import dateFormat from "../libs/dateFormat.mjs";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { axios, user, getToken, image_base_url } = useAppContext();

    useEffect(() => {
        const getBookings = async () => {
            try {
                const { data } = await axios.get('/api/user/bookings', {
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
        if(user) getBookings();
        setIsLoading(false);
    }, [user]);

    return !isLoading ? (
        <div className = 'relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
            <BlurCircle top = '100px' left = '100px'/>
            <div>
                <BlurCircle bottom = '0px' left = '600px'/>
            </div>
            {bookings.length > 0 ? (
                <>
                    <h1 className = 'text-lg font-semibold mb-4'>My Bookings</h1>
                    {bookings.map((booking, index) => (
                        <div key = { index } className = 'flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
                            <div className = 'flex flex-col md:flex-row'>
                                <img className = 'md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' src = { `${image_base_url}/${booking.show.movie.poster_path}` } alt = ''/>
                                <div className = 'flex flex-col p-4'>
                                    <p className = 'text-lg font-semibold'>{booking.show.movie.title}</p>
                                    <p className = 'text-gray-400 text-sm'>{timeFormat(booking.show.movie.runtime)}</p>
                                    <p className = 'text-gray-400 text-sm mt-auto'>{dateFormat(booking.show.showDateTime)}</p>
                                </div>
                            </div>
                            <div className = 'flex flex-col md:items-end md:text-right justify-between p-4'>
                                <div className = 'flex items-center gap-4'>
                                    <p className = 'text-2xl font-semibold mb-3'>&euro; {booking.amount}</p>
                                    {!booking.isPaid && <button className = 'bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium active:scale-95 cursor-pointer transition'>Pay now</button>}
                                </div>
                                <div className = 'text-sm'>
                                    <p><span className = 'text-gray-400'>Total tickets:</span> {booking.bookedSeats.length}</p>
                                    <p><span className = 'text-gray-400'>Seat number:</span> {booking.bookedSeats.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <div className = 'flex flex-col items-center justify-center h-screen'>
                    <h1 className = 'text-3xl font-bold text-center'>No bookings available</h1>
                </div>
            )}
        </div>
    ) : (
        <Loading/>
    );
}

export default MyBookings;