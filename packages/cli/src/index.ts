import * as fs from 'fs';
import { ArnaAstSemanticAnalyzer, ArnaParser, ArnaLexer, DocumentAstNode, ArnaAstVisitor } from '@arna/core';

const cliArgs = process.argv.slice(2);
if (cliArgs.length < 1) {
  console.error("Need a path.");
  process.exit(1);
}

const filePathArg = cliArgs[0];
const fileContent = fs.readFileSync(filePathArg, 'utf-8');
const lexResults = ArnaLexer.tokenize(fileContent);
// Set input and run the parser
ArnaParser.input = lexResults.tokens;
const rootNode = ArnaParser.document();

// Check for parsing errors
if (ArnaParser.errors.length > 0) {
  console.error("Encountered errors during parsing");
  ArnaParser.errors.forEach(err => {
    console.error(err);
  });
  process.exit(1);
}
const ast = (ArnaAstVisitor.visit(rootNode) as DocumentAstNode);
const graph = new ArnaAstSemanticAnalyzer({}).analyze(ast);

// We have our parse tree now
// Fetch all the statements. In the future, more checking will need to be done.

