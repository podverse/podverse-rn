/*
  Special thanks to Steven Bell of Curiocaster who wrote the original version of this script.
  Check out his Podcasting 2.0 Certified app by visiting https://curiocaster.com
*/

import { getSubscribedPodcasts } from '../state/actions/podcast'

export const exportSubscribedPodcastsAsOPML = async () => {
  const subscribedPodcasts = await getSubscribedPodcasts()
  const blob = opmlExport(subscribedPodcasts)
  downloadOPMLExport(blob)
}

const downloadOPMLExport = (blob: any) => {
  console.log('downloadOPMLExport', blob)
  // TODO: DOWNLOAD THE OPML FILE LOCALLY
}

const opmlExport = (podcastList: any) => {
  const newOpml = jsonToXML(podcastList)
  const file = new Blob([newOpml], { type: 'text/xml' })

  return file
  
  function escapeEntities(str: string) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
  // need to fix podcast.url below
  function jsonToXML(json: any[]) {
    return `
      <?xml version="1.0"?>
      <opml version="1.0">
        <head>
          <title>OPML exported from Podverse</title>
          <dateCreated>${new Date()}</dateCreated>
          <dateModified>${new Date()}</dateModified>
        </head>
        <body>
          ${json.map((podcast: any) =>
            `<outline text="${escapeEntities(podcast.title)}" type="rss" xmlUrl="${encodeURIComponent(podcast.url)}"/>`
          )}
        </body>
      </opml>
    `.trim()
  }
}
