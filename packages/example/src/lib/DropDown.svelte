<script lang="ts">
  import ArrowIcon from "../assets/ArrowIcon.svelte";
  import type { Writable } from "svelte/store";
  import { onMount } from "svelte";

  export let text: string;
  export let show: Writable<boolean>;
  let rootElement: HTMLDivElement;
  let svgElement: SVGElement;

  const updateRotation = () => {
    if ($show) {
      svgElement.classList.add("-rotate-90");
    } else {
      svgElement.classList.remove("-rotate-90");
    }
  };

  onMount(() => {
    updateRotation();
    rootElement.addEventListener("click", () => {
      $show = !$show;
      updateRotation();
    });
  });
</script>

<div bind:this={rootElement} class={`flex items-center ${$$props.class}`}>
  <span class="underline hover:text-override-fg focus:text-override-neutral-200"
    >{text}</span
  >
  <ArrowIcon bind:svgElement class="!fill-override-yellow transition" />
</div>
