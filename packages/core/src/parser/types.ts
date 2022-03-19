import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface BundleKeyValueCstNode extends CstNode {
  name: "bundleKeyValue";
  children: BundleKeyValueCstChildren;
}

export type BundleKeyValueCstChildren = {
  Bundle: IToken[];
};

export interface ColorKeyValueCstNode extends CstNode {
  name: "colorKeyValue";
  children: ColorKeyValueCstChildren;
}

export type ColorKeyValueCstChildren = {
  Color: IToken[];
  Equal: IToken[];
  DoubleQuotedString?: IToken[];
  Identifier?: IToken[];
};

export interface LabelKeyValueCstNode extends CstNode {
  name: "labelKeyValue";
  children: LabelKeyValueCstChildren;
}

export type LabelKeyValueCstChildren = {
  Label: IToken[];
  Equal: IToken[];
  DoubleQuotedString: IToken[];
};

export interface LineWidthKeyValueCstNode extends CstNode {
  name: "lineWidthKeyValue";
  children: LineWidthKeyValueCstChildren;
}

export type LineWidthKeyValueCstChildren = {
  LineWidth: IToken[];
  Equal: IToken[];
  Identifier: IToken[];
};

export interface FontKeyValueCstNode extends CstNode {
  name: "fontKeyValue";
  children: FontKeyValueCstChildren;
}

export type FontKeyValueCstChildren = {
  Font: IToken[];
  Equal: IToken[];
  DoubleQuotedString: IToken[];
};

export interface FontSizeKeyValueCstNode extends CstNode {
  name: "fontSizeKeyValue";
  children: FontSizeKeyValueCstChildren;
}

export type FontSizeKeyValueCstChildren = {
  FontSize: IToken[];
  Equal: IToken[];
  DoubleQuotedString: IToken[];
};

export interface KeyValuePairCstNode extends CstNode {
  name: "keyValuePair";
  children: KeyValuePairCstChildren;
}

export type KeyValuePairCstChildren = {
  bundleKeyValue?: BundleKeyValueCstNode[];
  colorKeyValue?: ColorKeyValueCstNode[];
  labelKeyValue?: LabelKeyValueCstNode[];
  lineWidthKeyValue?: LineWidthKeyValueCstNode[];
  fontKeyValue?: FontKeyValueCstNode[];
  fontSizeKeyValue?: FontSizeKeyValueCstNode[];
};

export interface AttributeCstNode extends CstNode {
  name: "attribute";
  children: AttributeCstChildren;
}

export type AttributeCstChildren = {
  OpenBracket: IToken[];
  keyValuePair?: KeyValuePairCstNode[];
  Comma?: IToken[];
  CloseBracket: IToken[];
};

export interface NodeDeclarationCstNode extends CstNode {
  name: "nodeDeclaration";
  children: NodeDeclarationCstChildren;
}

export type NodeDeclarationCstChildren = {
  Identifier: IToken[];
  attribute?: AttributeCstNode[];
};

export interface EdgeDeclarationCstNode extends CstNode {
  name: "edgeDeclaration";
  children: EdgeDeclarationCstChildren;
}

export type EdgeDeclarationCstChildren = {
  Identifier: (IToken)[];
  EdgeUndirected?: IToken[];
  EdgeDirected?: IToken[];
  attribute?: AttributeCstNode[];
};

export interface DocumentCstNode extends CstNode {
  name: "document";
  children: DocumentCstChildren;
}

export type DocumentCstChildren = {
  Graph: IToken[];
  Identifier: IToken[];
  attribute?: AttributeCstNode[];
  OpenCurlyBrace: IToken[];
  edgeDeclaration?: EdgeDeclarationCstNode[];
  nodeDeclaration?: NodeDeclarationCstNode[];
  CloseCurlyBrace: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  bundleKeyValue(children: BundleKeyValueCstChildren, param?: IN): OUT;
  colorKeyValue(children: ColorKeyValueCstChildren, param?: IN): OUT;
  labelKeyValue(children: LabelKeyValueCstChildren, param?: IN): OUT;
  lineWidthKeyValue(children: LineWidthKeyValueCstChildren, param?: IN): OUT;
  fontKeyValue(children: FontKeyValueCstChildren, param?: IN): OUT;
  fontSizeKeyValue(children: FontSizeKeyValueCstChildren, param?: IN): OUT;
  keyValuePair(children: KeyValuePairCstChildren, param?: IN): OUT;
  attribute(children: AttributeCstChildren, param?: IN): OUT;
  nodeDeclaration(children: NodeDeclarationCstChildren, param?: IN): OUT;
  edgeDeclaration(children: EdgeDeclarationCstChildren, param?: IN): OUT;
  document(children: DocumentCstChildren, param?: IN): OUT;
}
