<template>
  <div id="app">
    <GameWindow :unitData="unitData" :imagePath="imagePath" />
  </div>
</template>

<script>
import GameWindow from "./components/GameWindow.vue";

export default {
  name: "App",
  components: {
    GameWindow,
  },
  data() {
    return {
      imagePath: "/logo.png", // Adjust the image path to point to the public folder
      unitData: {
        name: "Велиты",
        attribute1: "Солдаты",
        value1: 160,
        attribute2: "Опыт",
        value2: 0,
        stats: [
          { name: "Ближний бой", value: 6 },
          { name: "Стрелковая атака", value: 8 },
          { name: "Улучшение при штурме", value: 2 },
          { name: "Тип оружия", value: "Стрелки" },
          { name: "Общая защита", value: 7 },
          { name: "Доспехи", value: 2 },
          { name: "Навык защиты", value: 3 },
          { name: "Щит", value: 2 },
          { name: "Здоровье", value: 1 },
          { name: "Стоимость найма", value: 270 },
          { name: "Обслуживание", value: 170 },
        ],
        qualityOverview: {
          title: "Обзор качеств",
          points: [
            "Могут прятаться в высокой траве",
            "Улучшение против слонов и колесниц",
            "Улучшение при битве в лесу",
            "Быстро двигаются",
            "Могут устраивать подкопы",
          ],
        },
        description: {
          title: "Описание",
          text: "Велиты -- легковооруженные застрельщики, прикрывающие основную часть раннего римского легиона во время наступления. Они вооружены метательными копьями и колющими мечами и не носят никаких доспехов, кроме небольшого круглого щита. Их задача -- измотать и ослабить противника перед началом боя.",
        },
      },
    };
  },
};
</script>

<style>
#app {
  padding: 20px;
}
</style>
