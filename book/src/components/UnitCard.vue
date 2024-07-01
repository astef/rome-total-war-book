<template>
  <H1>UnitCard</H1>
  <p>Description</p>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UnitCard",
  props: {
    msg: String,
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
