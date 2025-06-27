import { useState } from 'react';
import ReactPlayer from 'react-player';
import { PlayCircleIcon } from 'lucide-react';

import BlurCircle from './BlurCircle';

const TrailersSection = ({ trailers }) => {
    const [currentTrailer, setCurrentTrailer] = useState(0);

    if(!trailers || trailers.length === 0)
        return (
            <div className = 'py-20 text-center text-gray-400'>
                No trailer available.
            </div>
        );

    return (
        <div className = 'pt-20 overflow-hidden' id = 'trailers'>
            <p className = 'text-lg font-semibold'>Trailers</p>
            <div className = 'relative mt-6'>
                <ReactPlayer className = 'mx-auto' width = '960px' height = '540px' url = { trailers[currentTrailer].url } controls = { false }/>
            </div>
            <div className = 'group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
                {trailers.map((trailer, index) => (
                    <div onClick = { () => setCurrentTrailer(index) } className = 'relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer' key = { index }>
                        <img className = 'rounded-lg w-full h-full object-cover brightness-75' src = {trailer.thumbnail} alt = ''/>
                        <PlayCircleIcon className = 'absolute top-1/2 left-1/2 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2' strokeWidth = { 0.6 }/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TrailersSection;