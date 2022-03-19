import { ArnaEdge, ArnaGraph, ArnaNode } from './graph';
import { DocumentAstNode, EdgeDeclarationAstNode, NodeDeclarationAstNode } from './parser/ast';
import { Graph, GraphParameters, OptionalGraphParameters } from './types';

class GraphSemanticAnalyzer {
  private graphParameters: GraphParameters;

  constructor(optionalParameters: OptionalGraphParameters) {
    this.graphParameters = Graph.buildParameters(optionalParameters);
  }

  private buildNode(declaration: NodeDeclarationAstNode): ArnaNode {
    const attributes = declaration.attributes?.keyValuePairs || {};
    return new ArnaNode(
      declaration.identifier,
      this.graphParameters.maxRepulsiveDistance,
      this.graphParameters.maxVertexDisplacement,
      attributes,
    );
  }

  private buildEdge(tail: ArnaNode, head: ArnaNode, declaration: EdgeDeclarationAstNode): ArnaEdge {
    const attributes = declaration.attributes?.keyValuePairs || {};
    return new ArnaEdge(tail, head, attributes);
  }

  private buildGraph(
    nodeDeclarations: NodeDeclarationAstNode[],
    edgeDeclarations: EdgeDeclarationAstNode[],
  ): ArnaGraph {
    const nodeMap = new Map<string, ArnaNode>();
    nodeDeclarations.forEach((declaration) => {
      if (nodeMap.has(declaration.identifier)) return;
      const newNode = this.buildNode(declaration);
      // TODO: remove
      newNode.options.label = declaration.attributes?.keyValuePairs.label || undefined;
      nodeMap.set(declaration.identifier, newNode);
    });
    const nodes = Array.from(nodeMap.values());

    // Prevent duplicate edges being added to the Graph object
    const edgeIds = new Set<string>();
    const edgeDeclarationsNoDuplicates = edgeDeclarations.filter((declaration) => {
      // TODO: check for directed edges
      const edgeIdKey = `${declaration.tail}--${declaration.head}`;
      if (edgeIdKey in edgeIds) return false;
      edgeIds.add(edgeIdKey);
      return true;
    });
    // For every edge declaration, create a Edge object.
    const edges = edgeDeclarationsNoDuplicates.map((declaration) => {
      const tail = nodeMap.get(declaration.tail);
      const head = nodeMap.get(declaration.head);
      if (tail === undefined) {
        throw new Error(`Invalid edge declaration. No node with identifier ${declaration.tail} found.`);
      }
      if (head === undefined) {
        throw new Error(`Invalid edge declaration. No node with identifier ${declaration.head} found.`);
      }
      return this.buildEdge(tail, head, declaration);
    });

    return new ArnaGraph(nodes, edges, this.graphParameters);
  }

  public analyze(ast: DocumentAstNode): ArnaGraph {
    this.graphParameters.bundle = ast.graphAttributes.keyValuePairs?.bundle || false;
    const graph = this.buildGraph(ast.nodeDeclarations, ast.edgeDeclarations);
    graph.computeLayout();
    return graph;
  }
}

export { GraphSemanticAnalyzer };
