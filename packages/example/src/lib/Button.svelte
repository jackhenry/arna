<script lang="ts">
  export let onClick: () => void;
</script>

<button
  on:click={onClick}
  class={`rounded px-2 py-1 mx-1 text-override-fg text-sm font-semibold ${$$props.class}`}
  ><slot /></button
>
