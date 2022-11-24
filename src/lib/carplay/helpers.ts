import { checkIfNowPlayingItem, convertToNowPlayingItem } from 'podverse-shared';
import {getGlobal} from "reactn"
import { playerLoadNowPlayingItem } from '../../state/actions/player';
import { getEpisodes } from '../../services/episode';
import { playerTogglePlay } from '../../services/player';

export const getEpisodesForPodcast = (podcast: any): Promise<any[]> => {
    return getEpisodes({podcastId:podcast.id, maxResults: true, sort: "most-recent"})
}

export const loadNowPlayingItem = async (item: any) => {
    const {player: {nowPlayingItem}} = getGlobal()
    // TODO: Handle restoring playback position on track change
    const isNowPlayingItem = checkIfNowPlayingItem(item, nowPlayingItem)
    if (isNowPlayingItem) {
        await playerTogglePlay()
    } else {
        const newNowPlayingItem = convertToNowPlayingItem(item)
        const shouldPlay = true
        const forceUpdateOrderDate = true
        const setCurrentItemNextInQueue = false // TODO: Determine correctly
        await playerLoadNowPlayingItem(newNowPlayingItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
    }
}