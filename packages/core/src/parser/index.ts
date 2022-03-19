import { CstParser } from "chevrotain";
import { languageTokens } from "../lexer";

export class ArnaCstParser extends CstParser {

  bundleKeyValue = this.RULE('bundleKeyValue', () => {
    this.CONSUME(languageTokens.Bundle);
  });

  colorKeyValue = this.RULE('colorKeyValue', () => {
    this.CONSUME(languageTokens.Color);
    this.CONSUME(languageTokens.Equal);
    this.OR([
      { ALT: () => this.CONSUME(languageTokens.DoubleQuotedString) },
      { ALT: () => this.CONSUME(languageTokens.Identifier) },
    ]);
  });

  labelKeyValue = this.RULE('labelKeyValue', () => {
    this.CONSUME(languageTokens.Label);
    this.CONSUME(languageTokens.Equal);
    this.CONSUME(languageTokens.DoubleQuotedString);
  });
  
  lineWidthKeyValue = this.RULE('lineWidthKeyValue', () => {
    this.CONSUME(languageTokens.LineWidth);
    this.CONSUME(languageTokens.Equal);
    this.CONSUME(languageTokens.Identifier);
  });

  fontKeyValue = this.RULE('fontKeyValue', () => {
    this.CONSUME(languageTokens.Font);
    this.CONSUME(languageTokens.Equal);
    this.CONSUME(languageTokens.DoubleQuotedString);
  });

  fontSizeKeyValue = this.RULE('fontSizeKeyValue', () => {
    this.CONSUME(languageTokens.FontSize);
    this.CONSUME(languageTokens.Equal);
    this.CONSUME(languageTokens.DoubleQuotedString);
  });

  keyValuePair = this.RULE('keyValuePair', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.bundleKeyValue) },
      { ALT: () => this.SUBRULE(this.colorKeyValue) },
      { ALT: () => this.SUBRULE(this.labelKeyValue) },
      { ALT: () => this.SUBRULE(this.lineWidthKeyValue) },
      { ALT: () => this.SUBRULE(this.fontKeyValue) },
      { ALT: () => this.SUBRULE(this.fontSizeKeyValue) },
    ]);
  });

  attribute = this.RULE('attribute', () => {
    this.CONSUME(languageTokens.OpenBracket);
    this.OPTION(() => {
      this.MANY_SEP({
        SEP: languageTokens.Comma,
        DEF: () => {
          this.SUBRULE(this.keyValuePair);
        }
      });
    });
    this.CONSUME(languageTokens.CloseBracket);
  });

  nodeDeclaration = this.RULE('nodeDeclaration', () => {
    this.CONSUME(languageTokens.Identifier);
    this.OPTION2(() => {
      this.SUBRULE(this.attribute);
    });
  });

  edgeDeclaration = this.RULE('edgeDeclaration', () => {
    this.CONSUME(languageTokens.Identifier);
    this.OR([
      { ALT: () => this.CONSUME(languageTokens.EdgeUndirected) },
      { ALT: () => this.CONSUME2(languageTokens.EdgeDirected) }
    ]);
    this.CONSUME2(languageTokens.Identifier);
    this.OPTION2(() => {
      this.SUBRULE(this.attribute);
    });
  });

  public document = this.RULE('document', () => {
    this.CONSUME(languageTokens.Graph);
    this.CONSUME(languageTokens.Identifier);
    this.OPTION1(() => {
      this.SUBRULE(this.attribute);
    });
    this.CONSUME(languageTokens.OpenCurlyBrace);
    this.OPTION2(() => {
      this.MANY(() => {
        this.OR([
          { ALT: () => this.SUBRULE(this.edgeDeclaration) }, // To avoid parser ambiguity, edge should be first
          { ALT: () => this.SUBRULE(this.nodeDeclaration) },
        ]);
      });
    });
    this.CONSUME(languageTokens.CloseCurlyBrace);
  });

  constructor() {
    super(languageTokens);
    this.performSelfAnalysis();
  }
}

export const ArnaParser = new ArnaCstParser();