import linkifyHtml from 'linkifyjs/html'
const badWordsRegex = require('badwords-list').regex
const appendedBadWordsRegex = '|dicks)\b/gi'
let badWordsRegexString = badWordsRegex.toString()
badWordsRegexString = badWordsRegexString.substr(0, badWordsRegexString.length - 6) + appendedBadWordsRegex
const regex = new RegExp(badWordsRegexString, 'gi')

String.prototype.linkifyHtml = function() {
  return this ? linkifyHtml(this) : ''
}

String.prototype.sanitize = function(nsfw: boolean) {
  return nsfw && this
    ? this.replace(regex, function(a) {
        return '*'.repeat(a.length)
      }).toString()
    : this.toString()
}
