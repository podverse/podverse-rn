import { request } from './request'

export const getPodcasts = async (ids: [string]) => {
    const response = await request({
        endpoint: '/podcast',
        query: {
            sort: 'alphabetical',
            podcastId: ids.join('&'),
            page: 1
        }
    })

    return response.json()
}
