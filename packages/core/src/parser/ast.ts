import { ArnaParser } from "../parser";
import { AttributeCstChildren, BundleKeyValueCstChildren, ColorKeyValueCstChildren, DocumentCstChildren, EdgeDeclarationCstChildren, FontKeyValueCstChildren, FontSizeKeyValueCstChildren, ICstNodeVisitor, KeyValuePairCstChildren, LabelKeyValueCstChildren, LineWidthKeyValueCstChildren, NodeDeclarationCstChildren } from "./types";

abstract class ArnaAstNode {
  abstract type: string;
}

export interface BundleKeyValueAstNode {
  bundle?: boolean;
}

export interface ColorKeyValueAstNode {
  color?: string;
}

export interface LabelKeyValueAstNode {
  label?: string;
}

export interface LineWidthValueAstNode {
  lineWidth?: string;
}

export interface FontValueAstNode {
  font?: string;
}

export interface FontSizeValueAstNode {
  fontSize?: string;
}

type CompositeKeyValueAstNodes = BundleKeyValueAstNode
  & ColorKeyValueAstNode 
  & LabelKeyValueAstNode 
  & LineWidthValueAstNode 
  & FontValueAstNode 
  & FontSizeValueAstNode;

type GraphAttributesKeyValueAstNodes = BundleKeyValueAstNode;

interface AttributeAstNode extends ArnaAstNode {
  keyValuePairs: CompositeKeyValueAstNodes;
}

export interface NodeDeclarationAstNode extends ArnaAstNode {
  identifier: string;
  attributes?: AttributeAstNode;
}

export interface EdgeDeclarationAstNode extends ArnaAstNode {
  tail: string;
  head: string;
  directed: boolean;
  attributes?: AttributeAstNode;
}

interface GraphAttributeAstNode {
  keyValuePairs: GraphAttributesKeyValueAstNodes;
}

export interface DocumentAstNode extends ArnaAstNode {
  graphType: string;
  graphName: string;
  graphAttributes: GraphAttributeAstNode;
  nodeDeclarations: NodeDeclarationAstNode[];
  edgeDeclarations: EdgeDeclarationAstNode[];
}
// The CstVisitor api for chevrotain is severely lacking and does not allow for proper explicit typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BaseVisitor = ArnaParser.getBaseCstVisitorConstructor<never, any>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class AstVisitor extends BaseVisitor implements ICstNodeVisitor<never, any> {

  bundleKeyValue(_context: BundleKeyValueCstChildren, _param?: never) {
    return {
      bundle: true
    };
  }

  colorKeyValue(context: ColorKeyValueCstChildren, _param?: never) {
    if (context.DoubleQuotedString !== undefined) {
      return {
        color: context.DoubleQuotedString[0].image.slice(1, -1)
      };
    }
    
    if (context.Identifier !== undefined) {
      return {
        color: context.Identifier[0].image
      };
    }
  }

  labelKeyValue(context: LabelKeyValueCstChildren, _param?: never) {
    return {
      label: context.DoubleQuotedString[0].image.slice(1, -1)
    };
  }
  
  lineWidthKeyValue(context: LineWidthKeyValueCstChildren, _param?: never) {
    return {
      lineWidth: context.Identifier[0].image
    };
  }
  
  fontKeyValue(context: FontKeyValueCstChildren, _param?: never) {
    return {
      font: context.DoubleQuotedString[0].image.slice(1, -1)
    };
  }
  
  fontSizeKeyValue(context: FontSizeKeyValueCstChildren, _param?: never) {
    return {
      fontSize: context.DoubleQuotedString[0].image.slice(1, -1)
    };
  }

  keyValuePair(context: KeyValuePairCstChildren, _param?: never) {
    return {
      type: 'KEY_VALUE_PAIR',
      children: Object.values(context).map(value => this.visit(value))
    };
  }

  attribute(context: AttributeCstChildren, _param?: never) {
    const keyValuePairsAst = context?.keyValuePair ? context.keyValuePair.map(kv => this.visit(kv)) : [];
    const attributes = keyValuePairsAst.map(pair => pair.children[0]).reduce((result, current) => Object.assign(result, current), {});
    return {
      type: "ATTRIBUTES",
      keyValuePairs: attributes,
    };
  }

  nodeDeclaration(context: NodeDeclarationCstChildren, _param?: never): NodeDeclarationAstNode {
    const attributes = context?.attribute ? this.visit(context.attribute[0]) : undefined;
    return {
      type: 'NODE_DECLARATION',
      identifier: context.Identifier[0].image,
      attributes
    };
  }

  edgeDeclaration(context: EdgeDeclarationCstChildren, _param?: never): EdgeDeclarationAstNode {
    const attributes = context?.attribute ? this.visit(context.attribute[0]) : undefined;
    return {
      type: 'EDGE_DECLARATION',
      directed: context?.EdgeDirected ? true : false,
      tail: context.Identifier[0].image,
      head: context.Identifier[1].image,
      attributes
    };
  }

  document(context: DocumentCstChildren, _param?: never): DocumentAstNode {
    const nodeDeclarations = context?.nodeDeclaration ? context.nodeDeclaration.map(dec => this.visit(dec)) : [];
    const edgeDeclarations = context?.edgeDeclaration ? context.edgeDeclaration.map(dec => this.visit(dec)) : [];
    const attributeAstNode = context?.attribute ? this.visit(context.attribute) : false;
    const attributes = attributeAstNode?.keyValuePairs ? { keyValuePairs: attributeAstNode.keyValuePairs } : { keyValuePairs: {}};
    return {
      type: 'DOCUMENT',
      graphType: context.Graph[0].image,
      graphName: context.Identifier[0].image,
      graphAttributes: attributes,
      nodeDeclarations,
      edgeDeclarations
    };
  }
}

export const ArnaAstVisitor = new AstVisitor();