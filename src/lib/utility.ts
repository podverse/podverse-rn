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
  } else if (seconds >= 1 && minutes >= 1) {
    result += '0' + seconds
  } else if (seconds >= 1) {
    result += seconds
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
  const regex = /(<([^>]+)>)/ig
  return text.replace(regex, '')
}

export const generateAuthorsText = (authors: any) => {
  let authorText = ''
  for (let i = 0; i < authors.length; i++) {
    const author = authors[i]
    authorText += `${author.name}${i < authors.length - 1 ? ', ' : ''}`
  }

  return authorText
}

export const generateCategoriesText = (categories: any) => {
  let categoryText = ''
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    categoryText += `${category.title}${i < categories.length - 1 ? ', ' : ''}`
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
