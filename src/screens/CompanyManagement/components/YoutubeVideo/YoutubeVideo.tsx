// YouTubeVideo.js
import React, {useMemo} from 'react';
import YouTube from 'react-youtube';

const YouTubeVideo = ({ video }: any) => {
    const videoID = useMemo(() => {
        return video?.length > 15 ? video?.split('v=')[1] : video;
    }, [video]);

    const opts = {
        width: '100%',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: 0,
        },
    };

    return <YouTube videoId={videoID} opts={opts} />;
};

export default YouTubeVideo;
