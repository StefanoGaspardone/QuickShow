import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import ItemCard from './ItemCard';

import { useAppContext } from '../contexts/AppContext';
import Loading from './Loading';

const SeriesSection = () => {
    const [series, setSeries] = useState([]);
    
    const navigate = useNavigate();
    const { axios, getToken, setIsLoading, isLoading } = useAppContext();
    
    useEffect(() => {
        const getSeries = async () => {
            try {
                setIsLoading(true);

                const { data } = await axios.get('/api/series', {
                    headers: { Authorization: `Bearer ${await getToken()}` }
                });

                if(data.success) setSeries(data.series);
                else toast.error(data.message);
            } catch(error) {
                console.log(error);
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        getSeries();
    }, []);

    return (
         <div className = 'px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden mt-'>
            <div className = 'relative flex items-center justify-between pt-20'>
                <p className = 'text-white font-medium text-2xl'>Tv Series</p>
                <button onClick = { () => navigate('/series') } className = 'group flex items-center gap-2 text-md text-gray-300 cursor-pointer'>
                    View all <ArrowRight className = 'group-hover:translate-x-0.5 transition w-4.5 h-4.5'/>
                </button>
            </div>
            {isLoading ? (
                <Loading/>
            ) : (
                series.length > 0 ? (
                    <>
                        <div className = 'flex flex-wrap max-sm:justify-center gap-8 mt-8'>
                            {series.slice(0, 4).map((serie, index) => (
                                <ItemCard key = { index } item = { serie } link = 'series'/>
                            ))}
                        </div>
                        <div className = 'flex justify-center mt-10'>
                            <button onClick = { () => navigate('/series') } className = 'px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show more</button>
                        </div>
                    </>
                ) : (
                    <p className = 'text-gray-400 mt-3'>No tv series avaiable</p>
                )
            )}
        </div>
    );
}

export default SeriesSection;