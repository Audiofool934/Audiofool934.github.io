---
project: "can-you-see-the-music"
repo: "Audiofool934/Can-You-See-The-Music"
sourceUrl: "https://github.com/Audiofool934/Can-You-See-The-Music"
syncedAt: "2026-05-30T10:16:31.575Z"
---

# Can You See The Music

<p align="center">
    <em>Without music, life would be a mistake - Friedrich Nietzsche</em>
</p>

## Background

Music, an indispensable part of human culture, has long been a powerful medium for expressing emotions, thoughts, and cultural values. As Friedrich Nietzsche put it, "Without music, life would be a mistake," highlighting the profound significance of music in our lives. From the harmonious symphonies of classical music to the dynamic rhythms of modern pop music, music has evolved over time, adapting to cultural changes and technological advancements.

[full report (in Chinese)](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/report.pdf)

### Approach

This project aims to fill this research gap by comprehensively studying the direct and indirect attributes of music through data visualization analysis. By analyzing three different datasets, we attempt to answer the following questions: How do the themes and languages in lyrics evolve over time? What are the differences in audio features among different music styles? What are the main emotions expressed in popular music, and how do these emotions change over time? How do the careers and collaboration patterns of artists develop? What can we learn about users' preferences from music playlists?

We will first introduce the related research work in the field of music data analysis. Then, it will elaborate on the methods of classifying and analyzing music attributes, followed by an in-depth discussion of the datasets used. The main part of the report will present the results of data visualization and analysis for each key music attribute, such as lyrics, audio features, sentiment, artists, and playlists. Finally, conclusions will be drawn based on the research results, highlighting the contributions of this study and suggesting potential directions for future research.

To make the entire analysis process more logical, the attributes of music are classified as shown in the following table:
| Direct Attributes | lyrics, features, album, artist, release time |
| --- | --- |
| Indirect Attributes | sentiment, genre, playlist, popularity |
**Table 1: Music Attribute Classification**

- **Direct attributes cover the following aspects**:
    - **lyrics**: By deeply analyzing the lyrics content, we can excavate the emotions and themes contained therein.
    - **features**: Audio features (such as frequency, loudness, etc.). With the help of professional technical means, we extract key features of the audio, such as rhythm, pitch, and loudness, to analyze the differences in audio features among different music genres and styles.
    - **album, artist, release time**: These belong to basic metadata.
- **Indirect attributes mainly involve the following contents**:
    - **sentiment**: Conduct sentiment analysis based on lyrics text or audio data to reveal the emotional trends presented in different musical works.
    - **genre**: The style or genre of a song (usually a song may contain multiple styles, and the definition is not absolute). By studying the distribution and evolution of genres, we can gain insights into the musical style characteristics of different periods and the cultural development trends reflected behind them.
    - **playlist**: That is, a music playlist, which is the result of music listeners rearranging existing music (this is very common among users of music streaming platforms).
    - **popularity**: It is used to measure the popularity of a song. It is affected by many factors, and its definition is not unique. Common measurement methods include referring to song sales, rankings on major music charts, etc.


## Datasets

In this project, we utilized three datasets to analyze various aspects of music:

1. [50 Years of Pop Music Lyrics](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Chttps%3A/github.com/walkerkq/musiclyrics%3E): This dataset comprises the lyrics of songs listed in Billboard’s Year-End Hot 100 charts from 1965 to 2015, totaling 5,100 entries. Each entry includes the song’s rank, title, artist, year, lyrics, and source. The lyrics were primarily sourced from websites such as metrolyrics.com, songlyrics.com, and lyricsmode.com. Approximately 3.6% of the lyrics were unavailable. The dataset provides a comprehensive overview of popular music trends over five decades.

2. [Million Playlist Dataset (MPD)](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Chttps%3A/research.atspotify.com/2020/09/the-million-playlist-dataset-remastered%3E): Released by Spotify as part of the RecSys Challenge 2018, the MPD contains 1,000,000 user-generated playlists. Each playlist includes information such as playlist title, track titles, and track ordering. The dataset is instrumental in developing and evaluating music recommendation systems, particularly for tasks like automatic playlist continuation.

3. [GTZAN Music Genre Classification Dataset](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Chttps%3A/www.kaggle.com/datasets/andradaolteanu/gtzan-dataset-music-genre-classification%3E): This dataset is a benchmark for music genre classification tasks. It consists of 1,000 audio tracks, each 30 seconds long, evenly distributed across 10 genres: blues, classical, country, disco, hip-hop, jazz, metal, pop, reggae, and rock. The dataset is widely used for evaluating machine learning models in genre recognition studies.

These datasets collectively provide a robust foundation for analyzing lyrical content, user engagement through playlists, and genre classification, thereby facilitating a comprehensive exploration of music trends and patterns.


## Data Visualization and Analysis Ⅰ: Lyrics

<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/lyrics/Most%20Characteristic%20Lyrics%20by%20Decade(line).png" alt="Most Characteristic Lyrics by Decade(line)" width="500px">

<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/lyrics/Words_per_Song_Combined(left%3Alength%2C%20right%3Avocabulary).png" alt="Words_per_Song" width="500px">

- [x] [word cloud](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/results/lyrics/wordcloud_all_lyrics.pdf)
- [x] [most characteristic lyrics by decade](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/lyrics/Most%20Characteristic%20Lyrics%20by%20Decade_bar.pdf%3E)
- [x] [growing vocabulary and song length](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/lyrics/Words_per_Song_Combined(left%3Alength%2C%20right%3Avocabulary).pdf>)

<!-- https://data.mendeley.com/datasets/3t9vbwxgr5/2
https://www.kaylinpavlik.com/50-years-of-pop-music/
https://github.com/walkerkq/musiclyrics?tab=readme-ov-file -->



## Data Visualization and Analysis Ⅱ: Features

<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/features/MFCCs_PCA_vs_tSNE.png" alt="MFCCs_PCA_vs_tSNE" width="500px">
<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/features/MFCCs_PCA_vs_tSNE_filtered.png" alt="MFCCs_PCA_vs_tSNE_filtered" width="500px">

<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/features/Genre%20vs%20RMS%20(Energy).png" alt="RMS" width="500px">
<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/features/Genre%20vs%20Rolloff%20(Frequency).png" alt="Rolloff" width="500px">
<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/features/Genre%20vs%20Zero%20Crossing%20Rate.png" alt="ZCR" width="500px">

- [x] [mel-spectrogram](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/features/example_mel_spectrogram.pdf%3E)

- [x] [genre vs everything]
  - [x] [genre vs rms(energy)](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/features/Genre%20vs%20RMS%20(Energy).pdf>)
  - [x] [genre vs roll-off(frequency)](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/features/Genre%20vs%20Rolloff%20(Frequency).pdf>)
  - [x] [genre vs zero-crossing-rate](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/features/Genre%20vs%20Zero%20Crossing%20Rate.pdf%3E)

- [x] [MFCCs vector t-SNE/PCA scatter plot](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/features/MFCCs_PCA_n_tSNE.pdf%3E)


## Data Visualization and Analysis Ⅲ: Sentiment


<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/sentiment/sentiment_over_time.png" alt="sentiment_over_time" width="500px">

- [x] [sentiment over time](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/sentiment/sentiment_over_time.pdf%3E)
- [x] [all time most positive/negative songs](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/sentiment/Most%20Positive%20Songs%20of%20All%20Time.pdf%3E)
- [x] [all time most positive/negative artists](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/sentiment/Most%20Positive%20Artists%20of%20All%20Time.pdf%3E)

<!-- https://www.graphext.com/post/sentiment-analysis-billboard-top-100-the-changing-mood-of-popular-music -->


## Data Visualization and Analysis Ⅳ: Artist


<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/artists/Career_Spans_of_Top_20_Most_Charted_Artists.png" alt="Career Spans" width="500px">

- [x] [58% One-Hit Wonders (number of songs per artist)](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/artists/Number_of_Songs_per_Artist.png%3E)
- [x] [Career Span](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/artists/Career_Spans_of_Top_20_Most_Charted_Artists.png%3E)
- [x] [song frequency by career span](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/artists/Song_Frequency_by_Career_Span.pdf%3E)

## Data Visualization and Analysis Ⅴ: Playlist

<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/MPD/top_tracks.png" alt="top_tracks" width="500px">
<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/MPD/top_artists.png" alt="top_artists" width="500px">
<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/MPD/top_playlist_titles.png" alt="top_playlist_titles" width="500px">
<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/results/MPD/numedits_histogram.png" alt="numedits_histogram" width="500px">

- [x] [playlist followers](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/MPD/num_followers_histogram.pdf%3E)
- [x] [top artists](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/MPD/top_artists.pdf%3E)
- [x] [top tracks](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/MPD/top_tracks.pdf%3E)
- [x] [top playlist titles](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/MPD/top_playlist_titles.pdf%3E)
- [x] [playlist length](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/MPD/playlist_length_histogram.pdf%3E)
- [x] [number edits](https://github.com/Audiofool934/Can-You-See-The-Music/blob/master/%3Cresults/MPD/numedits_histogram.pdf%3E)

---

<p align="center">
<img src="https://raw.githubusercontent.com/Audiofool934/Can-You-See-The-Music/master/assets/cover/can-you-see-the-music.png" alt="CYSTM" width="500px">
</p>
<p align = 'center'>
Can You See The Music <i> - artwork inspired by the movie Oppenheimer, "Can You Hear The Music"</i>
</p>
