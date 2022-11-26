import { Episode, Podcast } from 'podverse-shared';
import { CarPlay, ListTemplate, NowPlayingTemplate, TabBarTemplate } from 'react-native-carplay';
import { getEpisodesForPodcast, loadEpisodeInPlayer } from './helpers';

const subscribedPodcastsList = (podcasts: Podcast[]) => {
    const subscribedList = new ListTemplate({
        sections: [
          {
            header: 'Subscribed',
            items: podcasts.map((podcast) => {
                return {
                    text: podcast.title || "Undefined", 
                    imgUrl: podcast.shrunkImageUrl || podcast.imageUrl || null
                }}),
          },
        ],
        title: 'Podcasts',
        tabSystemImg:"list.star",
        onItemSelect: async (item) => {
            const podcast = podcasts[item.index]
            const [episodes] = await getEpisodesForPodcast(podcast)
            showEpisodesList(podcast, episodes)
        }
    });

    return subscribedList
}

const historyItemsList = (historyItems: any[]) => {
    const subscribedList = new ListTemplate({
        sections: [
          {
            header: 'Recently Played',
            items: historyItems.map((historyItems) => {return {text: historyItems?.episodeTitle || "Undefined"}}),
          },
        ],
        title: 'History',
        tabSystemImg:"timer"
    });

    return subscribedList
}

const showEpisodesList = (podcast: Podcast, episodes: Episode[]) => {
    const episodesList = new ListTemplate({
        sections: [
          {
            header: podcast.title || "Untitled Podcast",
            items: episodes.map((episode) => {
                const imgUrl =  episode.imageUrl
                  || podcast.shrunkImageUrl
                  || podcast.imageUrl
                  || null
                return {
                    text: episode.title || "Untitled Episode",
                    imgUrl
                }}),
          },
        ],
        onItemSelect: async ({index}) => {
            return showCarPlayerForEpisode(episodes[index], podcast)
        }
    });

    CarPlay.pushTemplate(episodesList)
}

export const showCarPlayerForEpisode = async (episode: Episode, podcast: Podcast) => {
    await loadEpisodeInPlayer(episode, podcast)
    const playerTemplate = new NowPlayingTemplate({})
    CarPlay.pushTemplate(playerTemplate)
    CarPlay.enableNowPlaying(true)
}
  
  
export const showRootView = (podcasts: Podcast[], historyItems: any[] ) => {   
    const tabBarTemplate = new TabBarTemplate({
        templates: [subscribedPodcastsList(podcasts), historyItemsList(historyItems)],
        onTemplateSelect(e: any) {
            console.log('selected', e);
        },
    });

    CarPlay.setRootTemplate(tabBarTemplate);
}

export const registerCarModule = (onConnect, onDisconnect) => {
    CarPlay.registerOnConnect(onConnect);
    CarPlay.registerOnDisconnect(onDisconnect);
}

export const unregisterCarModule = (onConnect, onDisconnect) => {
    CarPlay.unregisterOnConnect(onConnect);
    CarPlay.unregisterOnDisconnect(onDisconnect);
}