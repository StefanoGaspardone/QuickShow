import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { StarIcon, TrashIcon } from 'lucide-react';

import Title from '../../components/admin/Title';

import { useAppContext } from '../../contexts/AppContext';

import kConverter from '../../libs/kConverter.mjs';

const ListTvSeries = () => {
    const [series, setSeries] = useState([]);
    const { axios, getToken, image_base_url } = useAppContext();

    const handleDeleteSerie = async (id) => {
        try {
            const { data } = await axios.delete(`api/series/${id}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if(data.success) {
                toast.success(data.message);
                setSeries(prev => prev.filter(s => s._id !== id));
            } else toast.error(data.message);
        } catch(error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        const getSeries = async () => {
            try {
                const { data } = await axios.get('/api/series', {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                });

                if(data.success) setSeries(data.series);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
                toast.error(error.message);
            }
        }

        getSeries();
    }, []);

    return (
        <>
            <Title text1 = 'List' text2 = 'Tv Series'/>
            {series.length === 0 ? (
                <div className = 'mt-10 text-gray-400'>No tv series available.</div>
            ) : (
                <div className = 'mt-10 group flex flex-wrap gap-4'>
                    {series.map((serie, index) => (
                        <div key = { index } className = { `group/item relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 group-hover/item:opacity-100 hover:-translate-y-1 transition duration-300 ` } title = { serie.title }>
                            <button onClick = { () => handleDeleteSerie(serie._id) } className = 'absolute top-2 right-2 z-10 bg-gray-800 rounded-md p-1.5 opacity-0 group-hover/item:opacity-100 transition active:scale-95 cursor-pointer'>
                                <TrashIcon className = 'w-5 h-5 text-white'/>
                            </button>
                            <div className = 'relative rounded-lg overflow-hidden'>
                                <img className = 'w-full object-cover brightness-90' src = { `${image_base_url}/${serie.poster_path}` } alt = ''/>
                                <div className = 'text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0'>
                                    <p className = 'flex items-center gap-1 text-gray-400'>
                                        <StarIcon className = 'w-4 h-4 text-primary fill-primary'/>
                                        {serie.vote_average.toFixed(1)}
                                    </p>
                                    <p className = 'text-gray-300'>{kConverter(serie.vote_count)} Votes</p>
                                </div>
                            </div>
                            <p className = 'font-medium truncate'>{serie.title}</p>
                            <p className = 'text-gray-400 text-sm'>{serie.release_date}</p>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default ListTvSeries;