import { CarPlay, ListTemplate, TabBarTemplate } from 'react-native-carplay';
import { getEpisodesForPodcast, loadNowPlayingItem } from './helpers';

const subscribedPodcastsList = (podcasts: any[]) => {
    const subscribedList = new ListTemplate({
        sections: [
          {
            header: 'Subscribed',
            items: podcasts.map((podcast) => {
                return {
                    text: podcast.title || "Undefined", 
                    imgUrl:podcast.shrunkImageUrl || podcast.imageUrl || null
                }}),
          },
        ],
        title: 'Podcasts',
        tabSystemImg:"list.star",
        onItemSelect: async (item) => {
            const podcast = podcasts[item.index]
            const [episodes] = await getEpisodesForPodcast(podcast)
            showEpisodesList(podcast.title, episodes)
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

const showEpisodesList = (podcastTitle: string, episodes: any[]) => {
    const episodesList = new ListTemplate({
        sections: [
          {
            header: podcastTitle,
            items: episodes.map((episode) => {
                const imgUrl =  episode.shrunkImageUrl || episode.imageUrl || 
                                episode.podcast?.shrunkImageUrl || episode.podcast?.imageUrl || null
                return {
                    text: episode.title || "Untitled Episode",
                    imgUrl
                }}),
          },
        ],
        onItemSelect: async ({index}) => {
            return loadNowPlayingItem(episodes[index])
        }
    });

    CarPlay.pushTemplate(episodesList)
}
  
  
export const showRootView = (podcasts: any[], historyItems: any[] ) => {   
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