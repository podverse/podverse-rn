import { setGlobal } from 'reactn'

export const setShouldshowPodcastsListPopover = (value: boolean) => {
    setGlobal({ showPodcastsListPopover: value })
}