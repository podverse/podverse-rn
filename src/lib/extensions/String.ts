import linkifyHtml from 'linkifyjs/html'
const BadWords = require('bad-words')
const badWords = new BadWords()

String.prototype.linkifyHtml = function() {
  return this ? linkifyHtml(this) : ''
}

String.prototype.sanitize = function(nsfw: boolean) {
  return nsfw && this ? badWords.clean(this) : this
}
