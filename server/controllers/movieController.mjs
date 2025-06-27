import axios from 'axios';

import Movie from '../models/Movie.mjs';

export const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({}).sort({ title: 1 });
        res.status(200).json({ success: true, movies });
    } catch(error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addMovie = async (req, res) => {
    try {
        const { movieId, video } = req.body;

        if(!movieId || !video) return res.status(400).json({ success: false, message: 'Missing required fields' });

        const movie = await Movie.findOne({ _id: movieId });
        if(movie) return res.status(409).json({  success: false, message: 'Movie already present'});

        const [movieDetailsResponse, movieCreditsResponse, movieVideosResponse] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                }
            }),
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                }
            }),
            axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_API_KEY}`
                }
            })
        ]);
        
        const movieApiData = movieDetailsResponse.data;
        const movieCreditsData = movieCreditsResponse.data;
        const movieVideosData = movieVideosResponse.data;

        const trailers = movieVideosData.results.filter(res => res.type === 'Trailer' && res.site === 'YouTube')
                                                .map(res => ({ url: `https://www.youtube.com/watch?v=${res.key}`, thumbnail: `https://img.youtube.com/vi/${res.key}/hqdefault.jpg` }));

        const movieDetails = {
            _id: movieId,
            title: movieApiData.title,
            overview: movieApiData.overview,
            poster_path: movieApiData.poster_path,
            backdrop_path: movieApiData.backdrop_path,
            genres: movieApiData.genres,
            release_date: movieApiData.release_date,
            original_language: movieApiData.original_language,
            tagline: movieApiData.tagline || '',
            vote_average: movieApiData.vote_average,
            runtime: movieApiData.runtime,
            casts: movieCreditsData.cast,
            trailers,
            video,
        };

        await Movie.create(movieDetails);
        res.status(201).json({ success: true, message: 'Movie added successfully' });
    } catch(error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getMovie = async (req, res) => {
    try {
        const { movieId } = req.params;

        const movie = await Movie.findById(movieId);
        if(!movie) return res.status(404).json({ success: false, message: `No movie with id ${movieId}` });

        res.status(200).json({ success: true, movie });
    } catch(error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}