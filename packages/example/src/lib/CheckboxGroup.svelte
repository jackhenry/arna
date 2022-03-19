<script lang="ts">
  import Checkbox from "./Checkbox.svelte";

  export let label: string;
  export let values: number[] | string[];
  export let onIndexChange: (index: number) => void;
  export let defaultIndex: number;

  let chosenIndex = defaultIndex;
  function createHandler(index: number): () => void {
    return () => {
      chosenIndex = index;
      onIndexChange(index);
    };
  }
</script>

<div class={`flex flex-col ${$$props.class}`}>
  <span class="mb-4 text-center italic text-override-yellow">{label}</span>
  <div class="grid grid-cols-custom gap-y-6 gap-x-4 px-1 justify-items-center">
    {#each values as value, i (i)}
      <Checkbox
        label={value + ""}
        onSelect={createHandler(i)}
        isChecked={chosenIndex === i ? true : false}
      />
    {/each}
  </div>
</div>
