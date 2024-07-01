<template>
  <div class="game-window">
    <div class="header">
      <img
        :src="imagePath"
        alt="Unit Image"
        class="unit-image"
        @error="imageError"
      />
      <div class="unit-info">
        <h1>{{ unitData.name }}</h1>
        <div>
          <span>{{ unitData.attribute1 }}: {{ unitData.value1 }}</span>
          <span>{{ unitData.attribute2 }}: {{ unitData.value2 }}</span>
        </div>
      </div>
    </div>
    <div class="stats">
      <div v-for="(stat, index) in unitData.stats" :key="index">
        <span>{{ stat.name }}</span
        >: <span>{{ stat.value }}</span>
      </div>
    </div>
    <div class="description">
      <h2>{{ unitData.qualityOverview.title }}</h2>
      <div
        v-for="(quality, index) in unitData.qualityOverview.points"
        :key="index"
      >
        {{ quality }}
      </div>
      <h2>{{ unitData.description.title }}</h2>
      <p>{{ unitData.description.text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "GameWindow",
  props: {
    unitData: {
      type: Object,
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
  },
  methods: {
    imageError(event) {
      console.error("Image failed to load:", event.target.src);
      event.target.src = "path/to/default/image.png"; // Fallback image path
    },
  },
};
</script>

<style scoped>
.game-window {
  width: 100%;
  background-color: white;
  color: black;
  padding: 10px;
}

.header {
  display: flex;
  align-items: center;
}

.unit-image {
  width: 100px;
  height: auto;
  margin-right: 10px;
}

.unit-info {
  flex-grow: 1;
  text-align: left;
}

.stats {
  margin-top: 10px;
  text-align: left;
}

.description {
  margin-top: 10px;
  text-align: left;
}
</style>
