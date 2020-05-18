import linkifyHtml from 'linkifyjs/html'
const BadWords = require('bad-words')
const badWords = new BadWords()

String.prototype.linkifyHtml = function() {
  return this ? linkifyHtml(this) : ''
}

String.prototype.sanitize = function() {
  return this ? badWords.clean(this) : ''
}
