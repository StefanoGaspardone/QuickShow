import axios from 'axios';
import fs from 'fs';
import path from 'path';

import TvSeries from "../models/TvSeries.mjs";

export const getSeries = async (req, res) => {
    try {
        const series = await TvSeries.find({}).sort({ title: 1 });
        res.status(200).json({ success: true, series });
    } catch(error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addSeries = async (req, res) => {
    try {
        const { seriesId, episodeFiles } = req.body;

        if(!seriesId || !episodeFiles) return res.status(400).json({ success: false, message: 'Missing required fields' });

        const series = await TvSeries.findOne({ _id: seriesId });
        if(series) return res.status(409).json({ success: false, message: 'Tv series already present' });

        const [seriesDetailsRes, creditsRes, videosRes] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/tv/${seriesId}`, {
                headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
            }),
            axios.get(`https://api.themoviedb.org/3/tv/${seriesId}/credits`, {
                headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
            }),
            axios.get(`https://api.themoviedb.org/3/tv/${seriesId}/videos`, {
                headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
            })
        ]);

        const seriesData = seriesDetailsRes.data;
        const creditsData = creditsRes.data;
        const videosData = videosRes.data;

        const trailers = videosData.results.filter(v => v.type === 'Trailer' && v.site === 'YouTube')
                                            .map(v => ({
                                                url: `https://www.youtube.com/watch?v=${v.key}`,
                                                thumbnail: `https://img.youtube.com/vi/${v.key}/hqdefault.jpg`
                                            }));

        const seasons = await Promise.all(
            seriesData.seasons.filter(season => season.season_number > 0).map(async (season) => {
                const seasonRes = await axios.get(`https://api.themoviedb.org/3/tv/${seriesId}/season/${season.season_number}`,{ 
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } 
                });
                const seasonData = seasonRes.data;

                if(!seasonData.episodes || seasonData.episodes.length === 0) return null;

                return {
                    season_number: season.season_number,
                    name: season.name,
                    overview: season.overview,
                    air_date: season.air_date,
                    episodes: seasonData.episodes.map(ep => ({
                        episode_number: ep.episode_number,
                        name: ep.name,
                        overview: ep.overview,
                        air_date: ep.air_date,
                        still_path: ep.still_path,
                        video: episodeFiles?.[`${season.season_number}_${ep.episode_number}`] || null,
                    }))
                };
            })
        );

        const filteredSeasons = seasons.filter(Boolean);

        const tvSeriesDetails = {
            _id: seriesId,
            title: seriesData.name,
            overview: seriesData.overview,
            poster_path: seriesData.poster_path,
            backdrop_path: seriesData.backdrop_path,
            release_date: seriesData.first_air_date,
            original_language: seriesData.original_language,
            tagline: seriesData.tagline || '',
            genres: seriesData.genres,
            casts: creditsData.cast,
            vote_average: seriesData.vote_average,
            vote_count: seriesData.vote_count,
            trailers,
            seasons: filteredSeasons
        };

        await TvSeries.create(tvSeriesDetails);
        res.status(201).json({ success: true, message: 'Tv series added successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSerie = async (req, res) => {
    try {
        const { seriesId } = req.params;

        const series = await TvSeries.findById(seriesId);
        if(!series) return res.status(404).json({ success: false, message: `No tv series with id ${seriesId}` });

        res.status(200).json({ success: true, series });
    } catch(error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteSerie = async (req, res) => {
    try {
        const { seriesId } = req.params;

        const series = await TvSeries.findById(seriesId);
        if(!series) return res.status(404).json({ success: false, message: `No tv series with id ${seriesId}` });

        if(series.seasons && Array.isArray(series.seasons)) {
            for(const season of series.seasons) {
                if(season.episodes && Array.isArray(season.episodes)) {
                    for(const episode of season.episodes) {
                        if(episode.video && episode.video.startsWith('/videos/')) {
                            const filePath = path.join(process.cwd(), 'public', episode.video);
                            fs.unlink(filePath, (err) => {
                                if(err) console.log('Errore eliminazione file episodio:', err.message);
                            });
                        }
                    }
                }
            }
        }

        await TvSeries.findByIdAndDelete(seriesId);
        
        res.status(200).json({ success: true, message: 'Tv series deleted successfully' });
    } catch(error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}