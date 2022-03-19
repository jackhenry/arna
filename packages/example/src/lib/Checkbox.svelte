<script lang="ts">
  import { onMount } from "svelte";

  export let label: string;
  export let onSelect: () => void;
  export let isChecked = false;
  let selectableElement: HTMLDivElement;

  const selectedClasses = ["!bg-override-yellow", "text-override-neutral-900"];

  const addClasses = () => {
    selectedClasses.forEach((cssClass) => {
      selectableElement.classList.add(cssClass);
    });
  };

  const removeClasses = () => {
    selectedClasses.forEach((cssClass) => {
      selectableElement.classList.remove(cssClass);
    });
  };

  $: {
    if (!isChecked) {
      if (selectableElement) {
        removeClasses();
      }
    }
  }

  onMount(() => {
    if (isChecked) addClasses();
    selectableElement.addEventListener("click", () => {
      onSelect();
      addClasses();
    });
  });
</script>

<div class="flex items-center min-w-full text-center">
  <div
    bind:this={selectableElement}
    class="min-w-full cursor-pointer rounded shadow-[0_0_2pt_1px] shadow-override-bg/30 px-2 bg-override-neutral-500/50"
  >
    <span class="text-lg font-center font-mono font-semibold">{label}</span>
  </div>
</div>
