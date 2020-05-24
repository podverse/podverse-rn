import linkifyHtml from 'linkifyjs/html'
const badWordsRegex = require('badwords-list').regex
const regex = new RegExp(badWordsRegex, 'gi')

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
