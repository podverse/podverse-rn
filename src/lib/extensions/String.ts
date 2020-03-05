import linkifyHtml from 'linkifyjs/html'

String.prototype.linkifyHtml = function() {
  return this ? linkifyHtml(this) : ''
}
