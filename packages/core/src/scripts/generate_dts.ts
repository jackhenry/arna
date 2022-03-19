import { writeFileSync } from "fs";
import { resolve } from "path";
import { generateCstDts } from "chevrotain";
import { ArnaParser } from "../parser";

const definitions = generateCstDts(ArnaParser.getGAstProductions());
const definitions_path = resolve(__dirname, "..", "..", "src", "parser", "types.ts");
writeFileSync(definitions_path, definitions, { flag: "w+" });