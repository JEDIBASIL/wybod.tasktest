<template>
  <div :class="['bg-neutral-200 rounded', customClass, 'animate-pulse']"></div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  /** Custom Tailwind classes for size/shape */
  customClass: {
    type: String,
    default: 'h-4 w-full'
  }
});
</script>
