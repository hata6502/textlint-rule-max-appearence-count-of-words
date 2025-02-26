'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _lodashAssign = require('lodash.assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _kuromojin = require('kuromojin');

var defaultOptions = {
  limit: 4,
  lang: 'en'
};

function filterToken(token) {
  return token.pos === '名詞' && token.pos_detail_1 !== '数' && token.pos_detail_1 !== '非自立' && token.surface_form.length > 1;
}

function formatReport(word, count, limit) {
  var lang = arguments.length <= 3 || arguments[3] === undefined ? 'en' : arguments[3];

  switch (lang) {
    case 'ja':
      return '「' + word + '」が' + count + '段落目で' + limit + '回以上登場しています。';
    default:
      return word + ' appears over ' + limit + ' count in Paragraph ' + count;
  }
}

exports['default'] = function (context) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var Syntax = context.Syntax;
  var report = context.report;
  var getSource = context.getSource;
  var RuleError = context.RuleError;

  options = (0, _lodashAssign2['default'])({}, defaultOptions, options);

  var globalParagraphCount = 0;
  return _defineProperty({}, Syntax.Paragraph, function (node) {
    var paragraphCount = ++globalParagraphCount;
    var paragraph = getSource(node);

    // 非同期でkuromoji.jsの初期化&ロック&キャッシュ
    return (0, _kuromojin.getTokenizer)().then(function (tokenizer) {
      var tokens = tokenizer.tokenizeForSentence(paragraph);
      var uniqueTokens = [];

      tokens.forEach(function (token) {
        if (uniqueTokens.some(function (uniqueToken) {
          return uniqueToken.surface_form === token.surface_form;
        })) {
          return;
        }

        uniqueTokens.push(token);
      });

      uniqueTokens.filter(filterToken).filter(function (token) {
        return paragraph.split(token.surface_form).length - 1 > options.limit;
      }).forEach(function (token) {
        return report(node, new RuleError(formatReport(token.surface_form, paragraphCount, options.limit, options.lang)));
      });
    });
  });
};

;
module.exports = exports['default'];
//# sourceMappingURL=max-appearence-count-of-words.js.map