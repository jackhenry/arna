<script lang="ts">
  import { onMount } from "svelte";

  import ArrowIcon from "../assets/ArrowIcon.svelte";

  let show: boolean = false;
  let rootElement: HTMLDivElement;
  let svgElement: SVGElement;

  const borderClass = "border-b-[1px] border-override-blue";

  const handleClick = () => {
    show = !show;

    if (show) {
      svgElement.classList.add("-rotate-90");
    } else {
      svgElement.classList.remove("-rotate-90");
    }
  };

  onMount(() => {
    rootElement.addEventListener("click", () => {
      handleClick();
    });
    rootElement.addEventListener("mouseover", () => {
      svgElement.classList.add("!fill-override-blue");
      rootElement.classList.add("!text-override-blue");
    });
    rootElement.addEventListener("mouseleave", () => {
      svgElement.classList.remove("!fill-override-blue");
      rootElement.classList.remove("!text-override-blue");
    });
  });

  const shadow = "border-b-[1px] last:border-b-0 border-override-neutral-50/25";
</script>

<div class={`${shadow}`}>
  <div
    bind:this={rootElement}
    class={`py-3 cursor-pointer ${show ? borderClass : ""}`}
  >
    <div class="flex justify-between px-2">
      <slot name="label" />
      <ArrowIcon
        bind:svgElement
        class="fill-override-neutral-50 justify-self-end transition"
      />
    </div>
  </div>
  {#if show}
    <div class="py-4 px-2">
      <slot name="content" />
    </div>
  {/if}
</div>
