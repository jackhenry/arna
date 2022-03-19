import * as chevrotain from 'chevrotain';

const { createToken, Lexer } = chevrotain;

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: chevrotain.Lexer.SKIPPED
});

const Identifier = createToken({ name: 'Identifier', pattern: /[a-zA-Z0-9#]\w*/ });
// Identifier tokens
const Graph = createToken({ name: 'Graph', pattern: /GRAPH/i, longer_alt: Identifier });
const Bundle = createToken({ name: 'Bundle', pattern: /BUNDLE/i, longer_alt: Identifier });
const Color = createToken({ name: 'Color', pattern: /COLOR/i, longer_alt: Identifier });
const Label = createToken({ name: 'Label', pattern: /LABEL/i, longer_alt: Identifier });
const LineWidth = createToken({ name: 'LineWidth', pattern: /LINE-WIDTH/i, longer_alt: Identifier});
const FontSize = createToken({ name: 'FontSize', pattern: /FONT-SIZE/i, longer_alt: Identifier });
const Font = createToken({ name: 'Font', pattern: /PLONT/i, longer_alt: Identifier });
// Keyword tokens
const EdgeUndirected = createToken({ name: 'EdgeUndirected', pattern: /--/ });
const EdgeDirected = createToken({ name: 'EdgeDirected', pattern: /->/ });
const OpenBracket = createToken({ name: 'OpenBracket', pattern: /\[/, });
const CloseBracket = createToken({ name: 'CloseBracket', pattern: /\]/, });
const Equal = createToken({ name: 'Equal', pattern: /=/, });
const Comma = createToken({ name: 'Comma', pattern: /,/, });
//const DoubleQuotedString = createToken({ name: 'DoubleQuotedString', pattern: /"[^]+"/ });
const DoubleQuotedString = createToken({ name: 'DoubleQuotedString', pattern: /".*?"/ });
const OpenCurlyBrace = createToken({ name: 'OpenCurlyBrace', pattern: /{/ });
const CloseCurlyBrace = createToken({ name: 'CloseCurlyBrace', pattern: /}/ });
const Variable = createToken({ name: 'Variable', pattern: /[a-zA-Z]+/ });
const SingleLineComment = createToken({
  name: "SingleLineComment",
  pattern: /\/\/.+/,
  group: "comments"
});

export const languageTokens = {
  WhiteSpace,
  // Identifiers
  Color,
  Label,
  LineWidth,
  FontSize,
  Font,
  Bundle,
  Graph,
  Identifier,
  // Keywords
  EdgeUndirected,
  EdgeDirected,
  Equal,
  Comma,
  DoubleQuotedString,
  OpenBracket,
  CloseBracket,
  OpenCurlyBrace,
  CloseCurlyBrace,
  SingleLineComment,
  Variable
};

// Create the lexer with array of initialized language tokens
const arnaLexer = new Lexer(Object.values(languageTokens));

export const ArnaLexer = {
  languageTokens: languageTokens,
  tokenize: (text: string) => {
    const lexResult = arnaLexer.tokenize(text);
    if (lexResult.errors.length > 0) {
      console.error('Lexing errors detected.');
    }
    return lexResult;
  }
};
