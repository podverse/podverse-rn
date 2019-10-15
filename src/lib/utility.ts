import he from 'he'
import { PV } from '../resources'
import { NowPlayingItem } from './NowPlayingItem'

export const safelyUnwrapNestedVariable = (func: any, fallbackValue: any) => {
  try {
    const value = func()
    return (value === null || value === undefined) ? fallbackValue : value
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
    return `${s} to ${e}`
  } else {
    return `Start: ${s}`
  }
}

export const removeHTMLFromString = (text: string) => {
  const htmlEntitiesRegex = /(<([^>]+)>)|(\r?\n|\r)/ig
  return text.replace(htmlEntitiesRegex, '')
}

export const decodeHTMLString = (text: string) => {
  const limitSingleSpaceRegex = /\s+/g
  const newString = text.replace(limitSingleSpaceRegex, ' ')
  return he.decode(newString)
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

export const haveNowPlayingItemsChanged = (lastItem: NowPlayingItem, nextItem: NowPlayingItem) => (
  (nextItem.clipId && nextItem.clipId !== lastItem.clipId) ||
  (nextItem.episodeId && nextItem.episodeId !== lastItem.episodeId)
)

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

  if (!membershipExpirationDate && freeTrialExpirationDate && freeTrialExpirationDate > currentDate) {
    return PV.MembershipStatus.FREE_TRIAL
  } else if (!membershipExpirationDate && freeTrialExpirationDate && freeTrialExpirationDate <= currentDate) {
    return PV.MembershipStatus.FREE_TRIAL_EXPIRED
  } else if (membershipExpirationDate && membershipExpirationDate <= currentDate) {
    return PV.MembershipStatus.PREMIUM_EXPIRED
  } else if (membershipExpirationDate && membershipExpirationDate <= weekBeforeCurrentDate) {
    return PV.MembershipStatus.PREMIUM_EXPIRING_SOON
  } else if (membershipExpirationDate && membershipExpirationDate > currentDate) {
    return PV.MembershipStatus.PREMIUM
  }

  return
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

export const checkIfIdMatchesClipIdOrEpisodeId = (id?: string, clipId?: string, episodeId?: string) => {
  return id === clipId || (!clipId && episodeId && id === episodeId)
}

export const validateEmail = (email?: string) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}
