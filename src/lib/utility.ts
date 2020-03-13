import AsyncStorage from '@react-native-community/async-storage'
import he from 'he'
import { PV } from '../resources'
import { NowPlayingItem } from './NowPlayingItem'

const cheerio = require('react-native-cheerio')

export const safelyUnwrapNestedVariable = (func: any, fallbackValue: any) => {
  try {
    const value = func()
    return value === null || value === undefined ? fallbackValue : value
  } catch (e) {
    return fallbackValue
  }
}

export const readableDate = (date: string) => {
  const dateObj = new Date(date)
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  return month + '/' + day + '/' + year
}

export const getHHMMSSArray = (sec: number) => {
  sec = sec > -1 ? sec : 0
  const str = convertSecToHHMMSS(sec)
  const delimitedArray = str.split(':')

  if (delimitedArray.length === 1) {
    delimitedArray.unshift(0)
    delimitedArray.unshift(0)
  } else if (delimitedArray.length === 2) {
    delimitedArray.unshift(0)
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

export const readableClipTime = (startTime: number, endTime?: number) => {
  const s = convertSecToHHMMSS(startTime)
  if ((startTime || startTime === 0) && endTime) {
    const e = convertSecToHHMMSS(endTime)
    return `${s} - ${e}`
  } else {
    return `Start: ${s}`
  }
}

export const removeHTMLFromString = (text: string) => {
  const htmlEntitiesRegex = /(<([^>]+)>)|(\r?\n|\r)/gi
  return text.replace(htmlEntitiesRegex, '')
}

export const decodeHTMLString = (text: string) => {
  const limitSingleSpaceRegex = /\s+/g
  const newString = text.replace(limitSingleSpaceRegex, ' ')
  return he.decode(newString)
}

export const removeHTMLAttributesFromString = (html: string) => {
  const $ = cheerio.load(html)
  $('*').each(function(x: any) {
    this.attribs = {
      ...(this.attribs && this.attribs.href ? { href: this.attribs.href } : {})
    }
  })

  return $.html()
}

export const formatTitleViewHtml = (episode: any) => {
  if (episode.podcast && episode.podcast.title && episode.title && episode.pubDate) {
    return `<p>${episode.podcast.title}</p><p>${episode.title}</p><p>${readableDate(episode.pubDate)}</p>`
  } else if (episode && episode.title && episode.pubDate) {
    return `<p>${episode.title}</p><p>${readableDate(episode.pubDate)}</p>`
  } else if (episode.title) {
    return `<p>${episode.title}</p>`
  } else {
    return 'untitled episode'
  }
}

export const convertURLToSecureProtocol = (url?: string) => {
  if (url && url.indexOf('http://') > -1) {
    return url.replace('http://', 'https://')
  } else {
    return url
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
        label: category.title,
        value: category.id
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
    } else {
      remainingPlaylistItems.push(x)
    }
  })

  const sortedItems = itemsOrder.map((id: string) => {
    const items = remainingPlaylistItems.filter((x: any) => x.id === id)
    if (items.length > 0) {
      return items[0]
    }
  })

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

export const checkIfIdMatchesClipIdOrEpisodeId = (
  id?: string,
  clipId?: string,
  episodeId?: string,
  addByRSSPodcastFeedUrl?: string
) => {
  return (
    id === clipId ||
    (!clipId && addByRSSPodcastFeedUrl && id === addByRSSPodcastFeedUrl) ||
    (!clipId && episodeId && id === episodeId)
  )
}

export const createEmailLinkUrl = (email: string, subject?: string, body?: string) => {
  let str = 'mailto:' + email + '?'
  str += encodeURI(subject ? 'subject=' + subject + '&' : '')
  str += encodeURI(body ? 'body=' + body : '')
  return str
}

export const getHHMMSSMatchesInString = (str: string) => {
  const regex = /(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]/g
  return str.match(regex)
}

const createHHMMSSAnchorTag = (hhmmss: string) => {
  const sec = convertHHMMSSToSeconds(hhmmss)
  return `<a data-start-time='${sec}' href='#'>${hhmmss}</a>`
}

export const convertHHMMSSToAnchorTags = (html: string) => {
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

export function validateHHMMSSString(hhmmss: string) {
  const regex = new RegExp(
    // tslint:disable-next-line: max-line-length
    '^(([0-9][0-9]):([0-5][0-9]):([0-5][0-9]))$|(([0-9]):([0-5][0-9]):([0-5][0-9]))$|^(([0-5][0-9]):([0-5][0-9]))$|^(([0-9]):([0-5][0-9]))$|^([0-5][0-9])$|^([0-9])'
  )
  return regex.test(hhmmss)
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
      minutes = minutes * 60
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

export const hasAtLeastXCharacters = (str?: string, x: number = 8) => {
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
  let isPublic = false
  if (isPublicString) {
    isPublic = JSON.parse(isPublicString)
  }

  return isPublic
}

export const isOdd = (num: number) => num % 2 === 1
