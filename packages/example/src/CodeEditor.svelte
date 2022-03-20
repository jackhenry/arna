<script lang="ts">
  import CodeMirror from "codemirror";
  import "codemirror/lib/codemirror.css";
  import "codemirror/theme/midnight.css";
  import { afterUpdate, onMount } from "svelte";
  import CameraIcon from "./assets/CameraIcon.svelte";
  import createArnaMode from "./lib/arna_mode";
  import Button from "./lib/Button.svelte";
  import DropDown from "./lib/DropDown.svelte";
  import RandomGraph from "./lib/random_graph";
  import {
    code,
    edgeCount,
    graphData,
    showHelp,
    showParameters,
  } from "./lib/store";

  let editorElement: HTMLTextAreaElement;
  let editor: CodeMirror.Editor;

  const handleGenerateRandom = () => {
    const newEdgeCount = edgeCount.choices[$edgeCount];
    const generatedData = RandomGraph.generate(newEdgeCount);
    $code = generatedData.code;
    $graphData = generatedData;
  };

  const handleRefresh = () => {
    const temp = $code;
    $code = undefined;
    $code = temp;
  };

  const handleSubmit = () => {
    $code = editor.getValue();
  };

  const handleDownload = () => {
    try {
      const collection = document.getElementsByTagName("canvas");
      if (collection.length < 0) {
        throw new Error("Konva canvas is not loaded. Cannot create image.");
      }
      const canvas = collection.item(0);
      const img = canvas.toDataURL("image/png");
      const ghostLink = document.createElement("a");
      ghostLink.setAttribute("href", img);
      ghostLink.setAttribute("download", img);
      ghostLink.click();
      ghostLink.remove();
    } catch (error) {
      console.error(error);
    }
  };

  onMount(() => {
    // create arna mode
    createArnaMode();
    editor = CodeMirror.fromTextArea(editorElement, {
      theme: "midnight",
      mode: "arna",
      value: $code,
      lineNumbers: true,
      tabSize: 2,
    });
    // Override the font of the editor with theme monospace font.
    try {
      const codemirrorElement = document
        .getElementsByClassName("CodeMirror")
        .item(0) as HTMLDivElement;
      codemirrorElement.classList.add("!font-mono");
      codemirrorElement.classList.add("!text-sm");
      codemirrorElement.classList.add("!font-semibold");
    } catch (exception) {
      console.warn(
        "Failed to changed editor font. Unable to retrieve CodeMirror editor element."
      );
    }
  });

  afterUpdate(() => {
    if (editor.getValue() !== $code) {
      editor.setValue($code);
    }
  });
</script>

<div id="code-wrapper" class="w-full h-22 mb-2">
  <textarea bind:this={editorElement} id="editor" />
  <div class="flex flex-col items-center pt-2">
    <div
      class="grid grid-cols-custom gap-y-2 gap-x-2 min-w-full justify-items-center"
    >
      <Button
        onClick={handleGenerateRandom}
        type="primary"
        class="bg-override-blue hover:bg-override-blue/75 text-override-bg w-full"
      >
        <svelte:fragment>Random</svelte:fragment>
      </Button>
      <Button
        onClick={handleRefresh}
        label="Refresh"
        class="bg-override-yellow hover:bg-override-yellow/75 text-override-bg w-full"
      >
        <svelte:fragment>Refresh</svelte:fragment>
      </Button>
      <Button
        onClick={handleSubmit}
        label="Submit"
        class="bg-override-green hover:bg-override-green/75 text-override-bg w-full"
      >
        <svelte:fragment>Submit</svelte:fragment>
      </Button>
      <Button
        onClick={handleDownload}
        label="Download"
        class="bg-override-purple hover:bg-override-purple/75 text-override-bg w-full max-h-[28px] flex items-center justify-center"
      >
        <CameraIcon class="!fill-override-neutral-900 mx-3" />
      </Button>
    </div>
    <div
      class="flex flex-grow mt-2 cursor-pointer text-override-blue text-xs font-semibold"
    >
      <DropDown show={showHelp} text="syntax help" />
      <DropDown show={showParameters} text="adjust parameters" class="ml-2" />
    </div>
  </div>
</div>
