const protocol = 'https://'
const domain = 'podverse.fm' // __DEV__ ? 'stage.podverse.fm' : 'podverse.fm'
const root = protocol + domain

export const URLs = {
  about: `${root}/about`,
  // tslint:disable-next-line: max-line-length
  baseUrl: 'https://api.podverse.fm/api/v1', // __DEV__ ? 'https://api.stage.podverse.fm/api/v1' : 'https://api.podverse.fm/api/v1',
  clip: `${root}/clip/`,
  contact: 'https://docs.google.com/forms/d/e/1FAIpQLSe-1_1qmv5Z21ZLc37KWke3cXFluItnzmstjqGwm9_BT7BGRg/viewform',
  episode: `${root}/episode/`,
  playlist: `${root}/playlist/`,
  podcast: `${root}/podcast/`,
  profile: `${root}/profile/`,
  // tslint:disable-next-line: max-line-length
  requestPodcast: `https://docs.google.com/forms/d/e/1FAIpQLSdewKP-YrE8zGjDPrkmoJEwCxPl_gizEkmzAlTYsiWAuAk1Ng/viewform?usp=sf_link`,
  terms: `${root}/terms`
}
