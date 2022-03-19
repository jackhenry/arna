<script lang="ts">
  import CodeMirror from "codemirror";
  import { onMount } from "svelte";

  import createArnaMode from "./lib/arna_mode";
  import H from "./lib/Highlight.svelte";

  let parentElement: HTMLDivElement;

  const injectCssClasses = () => {
    const editorElements = parentElement.getElementsByClassName("CodeMirror");
    [...Array(editorElements.length)].forEach((_, index) => {
      console.log(index);
      const element = editorElements.item(index) as HTMLDivElement;
      element.classList.add("!font-mono");
      element.classList.add("!h-auto");
    });
  };

  const snippet = (node: HTMLTextAreaElement, snippetText: string) => {
    try {
      CodeMirror.fromTextArea(node, {
        readOnly: true,
        mode: "arna",
        theme: "midnight",
        cursorHeight: 0,
      }).setValue(snippetText);
    } catch (exception) {
      console.error("Expected node to be of type HTMLTextAreaElement");
    }
  };

  onMount(() => {
    createArnaMode();
    injectCssClasses();
  });
</script>

<div
  bind:this={parentElement}
  class="rounded flex flex-col w-full p-4 bg-override-neutral-800/30 outline outline-1 outline-override-neutral-50/50"
>
  <textarea use:snippet={"graph Name [bundle] {"} />
  <span class="mt-2"
    >To begin defining a graph, use the <H>graph</H> keyword followed by the name
    of the graph. Following the name of the graph, you may choose to include the
    <H>[bundle]</H> attribute. Including this will enable edge bundling.</span
  >
  <br />
  <textarea
    use:snippet={'N0 [color="rgba(164,6,6,0.6)",label="A message to show."]'}
  />
  <span class="mt-2"
    >After defining the graph name, node and edge declarations are required. In
    this example, <H>N0</H> is the node identifier. Within the square brackets, attributes
    of the node can be defined.</span
  >
  <br />
  <span>
    The <H>color</H> attribute specifies the color of the graph vertex when drawn.
    You may use RGB, RGBA, Hex, or other color formats supported by CSS3. The <H
      >label</H
    > attribute defines a string that will be displayed when the vertex is hovered
    over.
  </span>
  <br />
  <textarea use:snippet={'N0--N5  [line-width=3,color="rgba(164,6,6,0.2)"]'} />
  <span class="mt-2"
    >Edge declarations define an edge between two defined nodes. The nodes must
    be defined somewhere in the program or a compiler error will be thrown. In
    this example, <H>N0--N5</H> defines an edge between the nodes with the identifiers
    <H>N0</H> and <H>N5</H>. Even though this is an undirected edge, <H>N0</H> is
    treated as the tail of the edge. While <H>N5</H> is treated as the head.</span
  >
  <br />
  <span
    >The current supported attributes for edge declarations include <H
      >line-width</H
    > and <H>color</H>. <H>line-width</H> defines the width of the rendered edge
    on the canvas. The <H>color</H> attribute defines the color of the rendered edge
    on the canvas. The same color formats accepted for node declarations are supported
    for edge declarations.</span
  >
  <br />
  <span>Finally, don't forget to end the graph declaration with a <H>}</H></span
  >
</div>
