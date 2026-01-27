---
name: Vue 3 Component Generator
description: Create a Vue 3 component using Composition API and TypeScript.
dependencies: "vue"
---

## Guidelines
- Use \`<script setup lang="ts">\`.
- Define props and emits using type-only declarations.
- Keep template simple and logic in script.

## Template
\`\`\`vue
<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});

const emit = defineEmits<{
  (e: 'update', value: number): void;
}>();

const doubleCount = computed(() => props.count * 2);

function increment() {
  emit('update', props.count + 1);
}
</script>

<template>
  <div class="vue-component">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }} (Double: {{ doubleCount }})</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<style scoped>
.vue-component {
  padding: 1rem;
  border: 1px solid #eee;
}
</style>
\`\`\`
