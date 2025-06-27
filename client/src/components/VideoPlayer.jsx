import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ options, onReady }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if(!playerRef.current) {
            const videoElement = document.createElement("video-js");
      
            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current.appendChild(videoElement);
			
			const player = playerRef.current = videojs(videoElement, options, () => {
				videojs.log('player is ready');
				onReady && onReady(player);
			});
		} else {
			const player = playerRef.current;

			if(player.src() !== options.sources[0].src) player.src(options.sources);
			player.autoplay(options.autoplay);
		}
	}, [options]);

	useEffect(() => {
		const player = playerRef.current;

		return () => {
			if(player && !player.isDisposed()) {
				player.dispose();
				playerRef.current = null;
			}
		};
	}, [playerRef]);

    return (
		<div data-vjs-player className = 'h-full w-full'>
			<div ref = {videoRef }/>
		</div>
    );
}

export default VideoPlayer;