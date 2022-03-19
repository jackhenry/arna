<script lang="ts">
  import { onDestroy } from "svelte";
  import { graphData } from "./store";

  let edgeCountString: string;

  const unsubscribe = graphData.subscribe((value) => {
    edgeCountString = value.edgeCount + "";
  });

  onDestroy(unsubscribe);

  $: {
    try {
      $graphData.edgeCount = +edgeCountString;
    } catch (exception) {
      console.error(exception);
      //invalid numeric input
    }
  }
</script>

<input
  bind:value={edgeCountString}
  class={`px-4 py-2 rounded no-ring focus:shadow-input focus:shadow-red-400 ${$$props.class}`}
/>
