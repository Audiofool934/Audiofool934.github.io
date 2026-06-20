import { loadAllEpisodes } from "../../utils/loadEpisodes";
import { sortEpisodesDesc } from "../../utils/parseAudioshow";
import { audioImage } from "../../utils/audioImages";

const placeholderImage = "/images/placeholder-album.svg";

export async function GET() {
    const allEpisodes = loadAllEpisodes();
    const tracks = sortEpisodesDesc(allEpisodes)
        .filter((ep) => ep.appleMusicUrl || ep.audioPreviewUrl)
        .map((ep) => {
            const url = ep.audioPreviewUrl || ep.appleMusicUrl;
            return {
                n: ep.number,
                t: ep.songTitle,
                a: ep.artist,
                url,
                img: audioImage(ep.imageUrl || placeholderImage, 320) || placeholderImage,
                type: url!.includes("music.apple.com") ? "apple" : "local",
            };
        });

    return new Response(JSON.stringify({ tracks }), {
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=3600",
        },
    });
}
