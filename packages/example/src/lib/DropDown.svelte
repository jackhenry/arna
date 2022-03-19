<script lang="ts">
  import type { Writable } from "svelte/store";

  export let text: string;
  export let show: Writable<boolean>;
</script>

<div
  on:click={() => {
    $show = !$show;
  }}
  class={`${$$props.class}`}
>
  <span class="underline hover:text-override-fg focus:text-override-neutral-200"
    >{text}</span
  >
  <span class="text-override-yellow">{$show ? "▼" : "►"}</span>
</div>
