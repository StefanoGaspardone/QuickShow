import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';

import { useAppContext } from '../contexts/AppContext';

import { assets } from '../assets/assets';
import isoTimeFormat from '../libs/isoTimeFormat.mjs';

const groupRows = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J']];

const SeatLayout = () => {
    const { id, date } = useParams();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [show, setShow] = useState(null);
    const [occupiedSeats, setOccupiedSeats] = useState([]);

    const navigate = useNavigate();
    const { axios, user, getToken } = useAppContext();

    const renderSeats = (row, count = 9) => (
        <div key = { row } className = 'flex gap-2 mt-2'>
            <div className = 'flex flex-wrap items-center justify-center gap-2'>
                {Array.from({ length: count }, (_, i) => {
                    const seatId = `${row}${i + 1}`;
                    return (
                        <button key = { seatId } onClick = { () => handleSeatClick(seatId) } className = { `h-8 w-8 rounded border border-primary/60 ${selectedSeats.includes(seatId) && 'bg-primary text-white'} ${occupiedSeats.includes(seatId) ? 'opacity-50' : 'cursor-pointer'}` }>
                            {seatId}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const handleSeatClick = (seatId) => {
        if(!selectedTime) return toast('Please select a time first');
        if(!selectedSeats.includes(seatId) && selectedSeats.length > 4) return toast('You can only select 5 seats');
        if(occupiedSeats.includes(seatId)) return toast('This seat is already booked');

        setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]);
    }

    const bookTickets = async () => {
        try {
            if(!user) return toast.error('Please login to proceed');
            if(!selectedTime && !selectedSeats.length) return toast.error('Plase select a time and seats');

            const { data } = await axios.post('/api/bookings', { showId: selectedTime.showId, selectedSeats }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) {
                toast.success(data.message);
                navigate('/my-bookings');
                scrollTo(0, 0);
            } else {
                toast.error(data.message);
            }
        } catch(error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        const getShow = async () => {
            try {
                const { data } = await axios.get(`/api/shows/${id}`); 

                if(data.success) setShow(data);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
                toast.error(error.message);
            }
        }

        if(user) getShow();
    }, [id, user]);

    useEffect(() => {
        const getOccupiedSeats = async () => {
            try {
                const { data } = await axios.get(`/api/bookings/seats/${selectedTime.showId}`);

                if(data.success) setOccupiedSeats(data.occupiedSeats);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
                toast.error(error.message);
            }
        }

        if(selectedTime) getOccupiedSeats();
    }, [selectedTime]);

    return show ? (
        <div className = 'flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
            <div className = 'w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:top-30'>
                <p className = 'text-lg font-semibold px-6'>Available timings</p>
                <div className = 'mt-5 space-y-1'>
                    {show.dateTime[date].map((item, index) => (
                        <div key = { index } onClick = { () => setSelectedTime(item) } className = { `flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? 'bg-primary text-white' : 'hover:bg-primary/20'}` }>
                            <ClockIcon className = 'w-4 h-4'/>
                            <p className = 'text-sm'>{isoTimeFormat(item.time)}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className = 'relative flex-1 flex flex-col items-center max-md:mt-16'>
                <BlurCircle top = '-100px' left = '-100px'/>
                <BlurCircle bottom = '0' left = '0'/>
                <h1 className = 'text-2xl font-semibold mb-4'>Select your seat</h1>
                <img src = { assets.screenImage } alt = ''/>
                <p className = 'text-gray-400 text-sm mb-6'>SCREEN SIDE</p>
                <div className = 'flex flex-col items-center mt-10 text-xs text-gray-300'>
                    <div className = 'grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
                        {groupRows[0].map(row => renderSeats(row))}
                    </div>
                    <div className = 'grid grid-cols-2 gap-11 '>
                        {groupRows.slice(1).map((group, index) => (
                            <div key = { index }>
                                {group.map(row => renderSeats(row))}
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick = { bookTickets } className = 'flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
                    Proceed to checkout
                    <ArrowRightIcon strokeWidth = { 3 } className = 'w-4 h-4'/>
                </button>
            </div>
        </div>
    ) : (
        <Loading/>
    );
}

export default SeatLayout;