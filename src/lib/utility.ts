/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import AsyncStorage from '@react-native-community/async-storage'
import he from 'he'
import { NowPlayingItem } from 'podverse-shared'
import Config from 'react-native-config'
import { getUserAgent } from 'react-native-device-info'
import InAppReview from 'react-native-in-app-review'
import { View } from '../components'
import { PV } from '../resources'

const cheerio = require('react-native-cheerio')

let userAgent = ''

/*
 * getUserAgent sometimes crashes in the iOS simulator. This is apparently related
 * to parallel process handling, so we are trying to only call the getUserAgent
 * method once on app launch, then access that value in the userAgent constant.
 */
export const setAppUserAgent = async () => {
  try {
    userAgent = await getUserAgent()
  } catch (e) {
    console.log('setAppUserAgent', e)
  }
}

export const getAppUserAgent = () => {
  return `${Config.USER_AGENT_PREFIX || 'Unknown App'}/${`${Config.USER_AGENT_APP_TYPE}` ||
    'Unknown App Type'}/${userAgent}`
}

export const safelyUnwrapNestedVariable = (func: any, fallbackValue: any) => {
  try {
    const value = func()
    return value === null || value === undefined ? fallbackValue : value
  } catch (e) {
    return fallbackValue
  }
}

const getMonth = (date: any) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return monthNames[date.getMonth()]
}

export const readableDate = (date: string) => {
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const monthAbbreviation = getMonth(dateObj)
  const day = dateObj.getDate()

  return `${monthAbbreviation} ${day}, ${year}`
}

export const getHHMMSSArray = (sec: number) => {
  sec = sec > -1 ? sec : 0
  const str = convertSecToHHMMSS(sec)
  const delimitedArray = str.split(':')

  if (delimitedArray.length === 1) {
    delimitedArray.unshift('0')
    delimitedArray.unshift('0')
  } else if (delimitedArray.length === 2) {
    delimitedArray.unshift('0')
  }

  const parsedArray = delimitedArray.map((x) => parseInt(x, 10))
  return parsedArray
}

export const convertSecToHHMMSS = (sec: number) => {
  let totalSec = Math.floor(sec)
  const hours = Math.floor(totalSec / 3600)
  totalSec %= 3600
  const minutes = Math.floor(totalSec / 60)
  const seconds = Math.floor(totalSec % 60)
  let result = ''

  if (hours >= 1) {
    result += hours + ':'
  }

  if (minutes >= 10) {
    result += minutes + ':'
  } else if (minutes >= 1 && hours >= 1) {
    result += '0' + minutes + ':'
  } else if (minutes >= 1) {
    result += minutes + ':'
  } else if (minutes === 0 && hours >= 1) {
    result += '00:'
  }

  if (seconds >= 10) {
    result += seconds
  } else if (seconds >= 1) {
    result += '0' + seconds
  } else {
    result += '00'
  }

  if (result.length === 2) {
    result = '0:' + result
  }

  if (result.length === 1) {
    result = '0:0' + result
  }

  return result
}

export const convertSecToHhoursMMinutes = (sec: number) => {
  let totalSec = Math.floor(sec)
  const hours = Math.floor(totalSec / 3600)
  totalSec %= 3600
  const minutes = Math.floor(totalSec / 60)

  let result = `${minutes} min`

  if (hours >= 1) {
    result = `${hours} hr ` + result
  }

  return result
}

export const readableClipTime = (startTime: number, endTime?: number, useTo?: boolean) => {
  const s = convertSecToHHMMSS(startTime)
  if ((startTime || startTime === 0) && endTime) {
    const e = convertSecToHHMMSS(endTime)
    return `${s} ${useTo ? 'to' : '-'} ${e}`
  } else {
    return `Start: ${s}`
  }
}

export const checkIfStringContainsHTMLTags = (text: string) => {
  if (text) {
    // eslint-disable-next-line max-len
    return /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i.test(
      text
    )
  }
  return false
}

export const replaceLinebreaksWithBrTags = (text: string) => {
  if (text && !checkIfStringContainsHTMLTags(text)) {
    const linebreaksRegex = /(?:\r\n|\r|\n)/g
    text = text.replace(linebreaksRegex, '<br>')
  }
  return text
}

export const removeHTMLFromString = (text: string) => {
  if (text) {
    const htmlEntitiesRegex = /<[^>]*>?/gm
    text = text.replace(htmlEntitiesRegex, '')
  }
  return text
}

export const decodeHTMLString = (text: string) => {
  if (text) {
    const limitSingleSpaceRegex = /\s+/g
    const newString = text.replace(limitSingleSpaceRegex, ' ')
    return he.decode(newString)
  }
  return text
}

export const removeHTMLAttributesFromString = (html: string) => {
  const $ = cheerio.load(html)
  $('*').each(function() {
    this.attribs = {
      ...(this.attribs && this.attribs.href ? { href: this.attribs.href } : {})
    }
  })

  return $.html()
}

export const removeExtraInfoFromEpisodeDescription = (html: string) => {
  html = html.replace('<p>Episode Summary</p>', '')
  return html.replace(/<p>\s*<\/p>/, '')
}

export const filterHTMLElementsFromString = (html: string) => {
  if (html) {
    // eslint-disable-next-line max-len
    const finalHtml = html.replace(/<audio.*>.*?<\/audio>|<video.*>.*?<\/video>|<iframe.*>.*?<\/iframe>|<img.*>.*?<\/img>|<img.*>/gi, '')
    return finalHtml
  }
  return html
}

export const formatTitleViewHtml = (episode: any) => {
  if (episode.podcast && episode.podcast.title && episode.title && episode.pubDate) {
    return `<p>${episode.podcast.title}</p><p>${episode.title}</p><p>${readableDate(episode.pubDate)}</p>`
  } else if (episode && episode.title && episode.pubDate) {
    return `<p>${episode.title}</p><p>${readableDate(episode.pubDate)}</p>`
  } else if (episode.title) {
    return `<p>${episode.title}</p>`
  } else {
    return 'Untitled Episode'
  }
}

export const generateAuthorsText = (authors: any) => {
  let authorText = ''

  if (authors) {
    for (let i = 0; i < authors.length; i++) {
      const author = authors[i]
      authorText += `${author.name}${i < authors.length - 1 ? ', ' : ''}`
    }
  }

  return authorText
}

export const generateCategoriesText = (categories: any) => {
  let categoryText = ''

  if (categories) {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]
      categoryText += `${category.title}${i < categories.length - 1 ? ', ' : ''}`
    }
  }

  return categoryText
}

export const generateCategoryItems = (categories: any[]) => {
  const items = []

  if (categories && categories.length > 0) {
    for (const category of categories) {
      items.push({
        label: category?.title,
        value: category?.id
      })
    }
  }

  return items
}

export const combineAndSortPlaylistItems = (episodes: [any], mediaRefs: [any], itemsOrder: [string]) => {
  const allPlaylistItems = [...episodes, ...mediaRefs]
  const remainingPlaylistItems = [] as any[]

  const unsortedItems = allPlaylistItems.filter((x: any) => {
    const isSortedItem = Array.isArray(itemsOrder) && itemsOrder.some((id) => x.id === id)
    if (!isSortedItem) {
      return x
    } else if (x) {
      remainingPlaylistItems.push(x)
    }
  })

  const sortedItems = itemsOrder.reduce((results: any[], id: string) => {
    const items = remainingPlaylistItems.filter((x: any) => x.id === id)
    if (items.length > 0) {
      results.push(items[0])
    }
    return results
  }, [])

  return [...sortedItems, ...unsortedItems]
}

export const haveNowPlayingItemsChanged = (lastItem: NowPlayingItem, nextItem: NowPlayingItem) =>
  (nextItem.clipId && nextItem.clipId !== lastItem.clipId) ||
  (nextItem.episodeId && nextItem.episodeId !== lastItem.episodeId)

export const getMembershipStatus = (user: any) => {
  const { freeTrialExpiration, membershipExpiration } = user
  let freeTrialExpirationDate
  let membershipExpirationDate

  if (freeTrialExpiration) {
    freeTrialExpirationDate = new Date(freeTrialExpiration)
  }

  if (membershipExpiration) {
    membershipExpirationDate = new Date(membershipExpiration)
  }

  const currentDate = new Date()
  const weekBeforeCurrentDate = new Date()
  weekBeforeCurrentDate.setDate(weekBeforeCurrentDate.getDate() + 7)

  if (!membershipExpirationDate && freeTrialExpirationDate && freeTrialExpirationDate <= currentDate) {
    return PV.MembershipStatus.FREE_TRIAL_EXPIRED
  } else if (!membershipExpirationDate && freeTrialExpirationDate && freeTrialExpirationDate <= weekBeforeCurrentDate) {
    return PV.MembershipStatus.FREE_TRIAL_EXPIRING_SOON
  } else if (!membershipExpirationDate && freeTrialExpirationDate && freeTrialExpirationDate > currentDate) {
    return PV.MembershipStatus.FREE_TRIAL
  } else if (membershipExpirationDate && membershipExpirationDate <= currentDate) {
    return PV.MembershipStatus.PREMIUM_EXPIRED
  } else if (membershipExpirationDate && membershipExpirationDate <= weekBeforeCurrentDate) {
    return PV.MembershipStatus.PREMIUM_EXPIRING_SOON
  } else if (membershipExpirationDate && membershipExpirationDate > currentDate) {
    return PV.MembershipStatus.PREMIUM
  }

  return ''
}

export const shouldShowMembershipAlert = (user: any) => {
  const status = getMembershipStatus(user)
  const shouldAlert = [
    PV.MembershipStatus.FREE_TRIAL_EXPIRED,
    PV.MembershipStatus.FREE_TRIAL_EXPIRING_SOON,
    PV.MembershipStatus.PREMIUM_EXPIRED,
    PV.MembershipStatus.PREMIUM_EXPIRING_SOON
  ]
  return shouldAlert.includes(status)
}

export const getMembershipExpiration = (user: any) => {
  const { freeTrialExpiration, membershipExpiration } = user

  if (!membershipExpiration && freeTrialExpiration) {
    return freeTrialExpiration
  } else if (membershipExpiration) {
    return membershipExpiration
  }
  return
}

export const getExtensionFromUrl = (url: string) => {
  const path = url.split('?') // Remove query params

  if (path[0]) {
    const filePathArr = path[0].split('/') // Split url in paths
    if (filePathArr.length > 0) {
      const filePath = filePathArr.pop() || '' // Grab last path in url
      if (filePath) {
        const extension = filePath.split('.').pop() // Split last path in name.extension and grab extension
        return `.${extension || 'mp3'}`
      }
    }
  }

  return '.mp3' // If all else fails, assume mp3
}

export const convertBytesToHumanReadableString = (bytes: number) => {
  const thresh = 1000
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B'
  }
  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  let u = -1
  do {
    bytes /= thresh
    ++u
  } while (Math.abs(bytes) >= thresh && u < units.length - 1)
  return bytes.toFixed(1) + ' ' + units[u]
}

export const removeArticles = (str: string) => {
  const words = str.split(' ')
  if (words.length <= 1) return str
  if (words[0] === 'a' || words[0] === 'the' || words[0] === 'an') {
    return words.splice(1).join(' ')
  }
  return str
}

export const checkIfIdMatchesClipIdOrEpisodeIdOrAddByUrl = (
  id?: string,
  clipId?: string,
  episodeId?: string,
  addByRSSPodcastFeedUrl?: string
) => {
  let matches = false

  if (addByRSSPodcastFeedUrl) {
    matches = addByRSSPodcastFeedUrl === id
  } else if (clipId) {
    matches = clipId === id
  } else if (episodeId) {
    matches = episodeId === id
  }

  return matches
}

export const createEmailLinkUrl = (obj: any) => {
  let str = 'mailto:' + obj.email + '?'
  str += encodeURI(obj.subject ? 'subject=' + obj.subject + '&' : '')
  str += encodeURI(obj.body ? 'body=' + obj.body : '')
  return str
}

export const getHHMMSSMatchesInString = (str: string) => {
  const regex = /([0-9]?[0-9]:[0-5]?[0-9]:[0-5][0-9])|([0-5]?[0-9]:[0-5][0-9])/g
  return str.match(regex)
}

const createHHMMSSAnchorTag = (hhmmss: string) => {
  const sec = convertHHMMSSToSeconds(hhmmss)
  return `<a data-start-time='${sec}' href='#'>${hhmmss}</a>`
}

export const convertTranscriptTimestampToSeconds = (timestamp: string) => {
  // SRT time stamps use this formatting: 00:02:45,170
  let hhmmss = timestamp.split(',')[0]
  // VTT time stamps use this formatting: 00:02:45.170
  hhmmss = timestamp.split('.')[0]
  return convertHHMMSSToSeconds(hhmmss)  
}

export const convertHHMMSSToAnchorTags = (html: string) => {
  if (html) {
    const matches = getHHMMSSMatchesInString(html) || []
    let formattedHtml = html
    for (const match of matches) {
      const replace = match
      const regex = new RegExp(replace, 'g')
      const anchorTag = createHHMMSSAnchorTag(match)
      formattedHtml = formattedHtml.replace(regex, anchorTag)
    }

    return formattedHtml
  }
  return html
}

export function validateHHMMSSString(hhmmss: string) {
  const regex = new RegExp(
    // eslint-disable-next-line max-len
    '^(([0-9][0-9]):([0-5][0-9]):([0-5][0-9]))$|(([0-9]):([0-5][0-9]):([0-5][0-9]))$|^(([0-5][0-9]):([0-5][0-9]))$|^(([0-9]):([0-5][0-9]))$|^([0-5][0-9])$|^([0-9])'
  )
  return regex.test(hhmmss)
}

export function convertHoursMinutesSecondsToSeconds(hours: number, minutes: number, seconds: number) {
  let totalSeconds = hours * 3600
  totalSeconds += minutes * 60
  totalSeconds += seconds
  return totalSeconds
}

export function convertHHMMSSToSeconds(hhmmssString: string) {
  if (hhmmssString) {
    if (!validateHHMMSSString(hhmmssString)) {
      return -1
    }

    const hhmmssArray = hhmmssString.split(':') || 0
    let hours = 0
    let minutes = 0
    let seconds = 0

    if (hhmmssArray.length === 3) {
      hours = parseInt(hhmmssArray[0], 10)
      minutes = parseInt(hhmmssArray[1], 10)
      seconds = parseInt(hhmmssArray[2], 10)

      if (hours < 0 || minutes > 59 || minutes < 0 || seconds > 59 || seconds < 0) {
        console.log('Invalid time provided.')
        return -1
      }

      hours = hours * 3600
      minutes = minutes ? minutes * 60 : 0
    } else if (hhmmssArray.length === 2) {
      minutes = parseInt(hhmmssArray[0], 10)
      seconds = parseInt(hhmmssArray[1], 10)

      if (minutes > 59 || minutes < 0 || seconds > 59 || seconds < 0) {
        console.log('Invalid time provided.')
        return -1
      }

      minutes = minutes * 60
    } else if (hhmmssArray.length === 1) {
      seconds = parseInt(hhmmssArray[0], 10) || 0

      if (seconds > 59 || seconds < 0) {
        console.log('Invalid time provided.')
        return -1
      }
    } else {
      console.log('Invalid time provided.')
      return -1
    }

    return hours + minutes + seconds
  } else {
    return null
  }
}

export const convertToSortableTitle = (title: string) => {
  const sortableTitle = title
    ? title
        .toLowerCase()
        .replace(/\b^the\b|\b^a\b|\b^an\b/i, '')
        .trim()
    : ''
  return sortableTitle ? sortableTitle.replace(/#/g, '') : ''
}

export const hasAtLeastXCharacters = (str?: string, x = 8) => {
  return str && str.match(`^(?=.{${x},})`) ? true : false
}

export const hasLowercase = (str?: string) => {
  return str && str.match('^(?=.*[a-z])') ? true : false
}

export const hasMatchingStrings = (str1?: string, str2?: string) => {
  return str1 && str1 === str2 ? true : false
}

export const hasNumber = (str?: string) => {
  return str && str.match('^(?=.*[0-9])') ? true : false
}

export const hasUppercase = (str?: string) => {
  return str && str.match('^(?=.*[A-Z])') ? true : false
}

export const getMakeClipIsPublic = async () => {
  const isPublicString = await AsyncStorage.getItem(PV.Keys.MAKE_CLIP_IS_PUBLIC)
  let isPublic = true
  if (isPublicString) {
    isPublic = JSON.parse(isPublicString)
  }

  return isPublic
}

export const isOdd = (num: number) => num % 2 === 1

export const setCategoryQueryProperty = (queryFrom?: any, selectedCategory?: any, selectedCategorySub?: any) => {
  if (queryFrom === PV.Filters._categoryKey && selectedCategory) {
    return { categories: selectedCategory }
  } else if (queryFrom === PV.Filters._categoryKey && selectedCategorySub) {
    return { categories: selectedCategorySub }
  } else {
    return {}
  }
}

export const isValidDate = (date: any) => date instanceof Date && !isNaN(date as any)

export const isValidUrl = (str?: string) => {
  const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/
  return str ? regex.test(str) : false
}

export const convertUrlToSecureHTTPS = (originalUrl: string) => {
  return originalUrl ? originalUrl.replace('http://', 'https://') : ''
}

export const getUniqueArrayByKey = (arr: any[], key: string) => {
  return [...new Map(arr.map((item: any) => [item[key], item])).values()]
}

export const generateQueryParams = (query: any) => {
  return Object.keys(query)
    .map((key) => {
      return `${key}=${query[key]}`
    })
    .join('&')
}

export const overrideImageUrlWithChapterImageUrl = (nowPlayingItem: any, currentChapter: any) => {
  let imageUrl = nowPlayingItem ? nowPlayingItem.podcastImageUrl : ''
  if (nowPlayingItem && !nowPlayingItem.clipId && currentChapter && currentChapter.imageUrl) {
    imageUrl = currentChapter.imageUrl
  }
  return imageUrl
}

export const requestAppStoreReview = () => {
  if (InAppReview.isAvailable()) {
    InAppReview.RequestInAppReview()
  }
}

export const requestAppStoreReviewForEpisodePlayed = async () => {
  const EPISODES_PLAYED_LIMIT = 10
  const numberOfPlayedEpisodesString: string | null = await AsyncStorage.getItem(PV.Keys.NUMBER_OF_EPISODES_PLAYED)
  let numberOfPlayedEpisodes = numberOfPlayedEpisodesString ? Number(numberOfPlayedEpisodesString) : 0
  if (numberOfPlayedEpisodes < EPISODES_PLAYED_LIMIT) {
    numberOfPlayedEpisodes += 1
    await AsyncStorage.setItem(PV.Keys.NUMBER_OF_EPISODES_PLAYED, String(numberOfPlayedEpisodes))
  } else {
    await AsyncStorage.setItem(PV.Keys.NUMBER_OF_EPISODES_PLAYED, '0')
    requestAppStoreReview()
  }
}

export const requestAppStoreReviewForSubscribedPodcast = async () => {
  const SUBSCRIBED_PODCASTS_REQUEST_LIMIT = 5
  const numberOfSubscritptionsString: string | null = await AsyncStorage.getItem(PV.Keys.NUMBER_OF_SUBSCRIBED_PODCASTS)
  let numberOfSubscribedPodcasts = numberOfSubscritptionsString ? Number(numberOfSubscritptionsString) : 0
  if (numberOfSubscribedPodcasts < SUBSCRIBED_PODCASTS_REQUEST_LIMIT) {
    numberOfSubscribedPodcasts += 1
    await AsyncStorage.setItem(PV.Keys.NUMBER_OF_SUBSCRIBED_PODCASTS, String(numberOfSubscribedPodcasts))
  } else {
    await AsyncStorage.setItem(PV.Keys.NUMBER_OF_SUBSCRIBED_PODCASTS, '0')
    requestAppStoreReview()
  }
}

export const parseOpmlFile = (data: any, topLevel = false): string[] => {
  let outlineArr = data
  if (topLevel) {
    outlineArr = data.opml?.body[0]?.outline || []
  }

  const resultArr = new Array<string>()
  for (const item of outlineArr) {
    if (item.$?.type?.toLowerCase() === 'rss') {
      const url = item.$?.xmlurl || item.$?.xmlUrl
      if (url) {
        resultArr.push(url)
      }
    } else {
      if (item.outline) {
        resultArr.push(...parseOpmlFile(item.outline))
      }
    }
  }

  return resultArr
}

export const numberWithCommas = (x?: number) => {
  if (!x || x === 0) return x  
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const safeKeyExtractor = (listName: string, index: number, id?: string) => {
  if (id) {
    return id
  } else {
    return `${listName}_${index}`
  }
}

export const checkIfNowPlayingItem = (item?: any, nowPlayingItem?: any) => {
  return item && nowPlayingItem && (nowPlayingItem.clipId === item.id || nowPlayingItem.episodeId === item.id)
}

export const getAuthorityFeedUrlFromArray = (feedUrlObjects: any[]) => {
  const obj = feedUrlObjects.find((feedUrlObject) => feedUrlObject.isAuthority)
  return obj?.url || null
}

export const getUsernameAndPasswordFromCredentials = (credentials: string) => {
  let username = ''
  let password = ''

  if (credentials) {
    const splitCredentials = credentials.split(':')
    username = splitCredentials[0] || ''
    password = splitCredentials[1] || ''
  }

  return {
    username,
    password
  }
}

export const getTimeLabelText = (mediaFileDuration?: number, episodeDuration?: number,
  userPlaybackPosition?: number, clipTime?: string) => {
  const hasStartedItem = !!mediaFileDuration
  const totalTime = mediaFileDuration || episodeDuration || 0
  const playedTime = userPlaybackPosition || 0

  let timeLabel = ''
  if (totalTime) {
    timeLabel = convertSecToHhoursMMinutes(totalTime)
    if (hasStartedItem) {
      timeLabel = convertSecToHhoursMMinutes(totalTime - playedTime) + ' left'
    }
  }

  if (clipTime) {
    timeLabel = clipTime
  }

  return timeLabel
}

export const getMediaRefStartPosition = (clipStartTime?: number | null, sliderWidth?: number, duration?: number) => {
  let clipStartTimePosition = 0

  if (duration && clipStartTime && sliderWidth) {
    clipStartTimePosition = sliderWidth * (clipStartTime / duration)
  }

  return clipStartTimePosition
}
