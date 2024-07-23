<script setup lang="ts">
import UnitPage from "./components/UnitPage.vue";
import ContentsPage from "./components/ContentsPage.vue";
import { UnitsType } from "./types";
import unitsJson from "./units.json";

let units = UnitsType.parse(unitsJson);
units.sort((a, b) => {
    return a.text.localeCompare(b.text);
});
</script>

<template>
    <ContentsPage :units="units" />
    <UnitPage v-for="(u, i) in units" :unit="u" :page="i + 1" />
</template>

<style></style>
