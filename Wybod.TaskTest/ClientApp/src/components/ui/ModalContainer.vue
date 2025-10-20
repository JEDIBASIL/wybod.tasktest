<template>
  <div class="top-0 fixed h-screen w-screen flex justify-center items-center left-0 z-20">
    <div @click="onClose" class="bg-black/50 w-full h-full absolute" />
    <div
      class="relative z-2 border border-neutral-300 dark:border-neutral-800 mw-500px w-[600px] max-h-[70vh] bg-background shadow-2xl rounded-2xl p-5 pb-20">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  onClose: {
    type: Function,
  },
});
</script>
