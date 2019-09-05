// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import movieQuotes from 'movie-quotes';
const defaultExport = {};

defaultExport.randomQuoteGenerator = () => movieQuotes.random().split('\"')[1];

defaultExport.randomColorGenerator = function() {
    // There are other color generators that might be more interesting. See http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html
    const letters = '0123456789ABCDEF';
    return '#' + ([0, 1, 2, 3, 4, 5].map(i => _l.sample(letters))).join('');
};

defaultExport.randomImageGenerator = function() {
    const valid_ids = _l.concat(__range__(1050, 1084, true), [1008, 1028]);
    return `https://unsplash.it/200/300?image=${_l.sample(valid_ids)}`;
};

export default defaultExport;

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}