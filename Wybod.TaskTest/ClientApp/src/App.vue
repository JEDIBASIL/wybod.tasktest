<template>
  <router-view />
  <Toaster position="bottom-left" />
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>
