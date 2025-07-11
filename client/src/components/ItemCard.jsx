import { useNavigate } from "react-router";
import dayjs from 'dayjs';
import { StarIcon } from "lucide-react";

import { useAppContext } from "../contexts/AppContext";

import timeFormat from "../libs/timeFormat.mjs";

const ItemCard = ({ item, link }) => {
    const navigate = useNavigate();
    const { image_base_url } = useAppContext();

    return (
        <div className = 'flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66'>
            <img onClick = { () => navigate(`/${link}/${item._id}`) } className = 'rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer' src = { `${image_base_url}/${item.backdrop_path}` } alt = ''/>
            <p className = 'font-semibold mt-2 truncate'>{item.title}</p>
            <p className = 'text-sm text-gray-400 mt-2'>{dayjs(item.release_date).format('YYYY')} • {item.genres.slice(0, 2).map(genre => genre.name).join(' | ')}{link === 'movies' && ` • ${timeFormat(item.runtime)}`}</p>
            <div className = 'flex items-center justify-between mt-4 pb-3'>
                {link === 'movies' && <button onClick = { () => navigate(`/${link}/${item._id}`) } className = 'px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>Buy tickets</button>}
                <p className = 'flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
                    <StarIcon className = 'w-4 h-4 text-primary fill-primary'/>
                    {item.vote_average.toFixed(1)}
                </p>
            </div>
        </div>
    );  
}

export default ItemCard;