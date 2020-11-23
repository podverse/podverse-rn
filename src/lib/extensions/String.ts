import linkifyHtml from 'linkifyjs/html'

String.prototype.linkifyHtml = function() {
  return this ? linkifyHtml(this) : ''
}

let badWordsRegexString = require('badwords-list').regex.toString()

// replace double first character
badWordsRegexString = badWordsRegexString.replace('/\\b', '\\b')

// remove words from the blacklist here
badWordsRegexString = badWordsRegexString.replace('|God', '')

// append additional words to the blacklist here
badWordsRegexString = badWordsRegexString.replace(')\\b/gi', '|dicks)\\b')
const badWordsRegex = new RegExp(badWordsRegexString, 'gi')

String.prototype.sanitize = function(nsfw: boolean) {
  return nsfw && this
    ? this.replace(badWordsRegex, function(a) {
        return '*'.repeat(a.length)
      }).toString()
    : this.toString()
}
