import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { toast } from 'react-hot-toast';
import dayjs from "dayjs";
import { useState } from "react";

import BlurCircle from "./BlurCircle";
import { useNavigate } from "react-router";

const DateSelect = ({ dateTime, id }) => {
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    const bookHandler = () => {
        if(!selected) return toast('Please select a date');

        navigate(`/movies/${id}/${selected}`);
    }

    return (
        <div id = 'dateSelect' className = 'pt-20'>
            <p className = 'text-lg font-semibold mb-3'>Shows</p>
            {dateTime && dateTime.length > 0 ? (
                <div className = 'flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
                    <BlurCircle top = '-100px' left = '-100px'/>
                    <BlurCircle top = '100px' right = '0px'/>
                    <div>
                        <p className = 'text-lg font-semibold'>Choose Date</p>
                        <div className = 'flex items-center gap-6 text-sm mt-5'>
                            <ChevronLeftIcon width = { 28 }/>
                            <span className = 'grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
                                {Object.keys(dateTime).map((date, index) => (
                                    <button onClick = { () => setSelected(date) } key = { index } className = { `flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${selected === date ? 'bg-primary txt-white' : 'border border-primary/70'}` }>
                                        <span>{dayjs(date).toDate().getDate()}</span>
                                        <span>{dayjs(date).toDate().toLocaleDateString('en-US', {
                                            month: 'short'
                                        })}</span>
                                    </button>
                                ))}
                            </span>
                            <ChevronRightIcon width = { 28 }/>
                        </div>
                    </div>
                    <button onClick = { bookHandler } className = 'bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'>Book now</button>
                </div>
            ) : (
                <p className = 'text-gray-400'>No shows available</p>
            )}
        </div>
    );
}

export default DateSelect;