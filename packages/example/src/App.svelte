<script lang="ts">
  import "./index.css";
  import CodeEditor from "./CodeEditor.svelte";
  import GraphCanvas from "./GraphCanvas.svelte";
  import SyntaxHelp from "./SyntaxHelp.svelte";
  import { showHelp, showParameters } from "./lib/store";
  import GraphParameters from "./GraphParameters.svelte";
  import SunIcon from "./assets/SunIcon.svelte";
  import NavBar from "./NavBar.svelte";
  import Footer from "./Footer.svelte";
</script>

<main>
  <NavBar />
  <div class="flex flex-col max-w-4xl items-center mx-auto pt-4 px-4">
    <div class="flex items-center mb-4">
      <SunIcon class="!fill-override-yellow mt-1 mr-2 animate-spin-slow" />
      <span class="font-sans">
        <span class="font-serif text-3xl text-override-blue font-semibold"
          >Арна</span
        >
        <span class="text-3xl text-override-yellow font-semibold"
          >Graph DSL</span
        >
      </span>
    </div>
    <CodeEditor />
    {#if $showParameters}
      <GraphParameters />
    {/if}
    {#if $showHelp}
      <SyntaxHelp />
    {/if}
    <GraphCanvas />
    <Footer />
  </div>
</main>
