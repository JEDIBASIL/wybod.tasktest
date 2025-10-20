<script setup lang="ts">
import { ref, watch } from "vue";
import { useTaskStore } from "@/store/tasks.store";

interface FieldError {
  title?: string;
  description?: string;
}

const emit = defineEmits(['task-created'])
const taskStore = useTaskStore()

const title = ref("");
const description = ref("");

const errors = ref<FieldError>({});
const submitting = ref(false);


const rules = {
  title: [
    (val: string) => !!val.trim() || "Title is required.",
    (val: string) =>
      val.trim().length >= 3 || "Title must be at least 3 characters.",
  ],
  description: [
    (val: string) => !!val.trim() || "Description is required.",
    (val: string) =>
      val.trim().length >= 10 || "Description must be at least 10 characters.",
  ],
};


const validateField = (field: keyof typeof rules, value: string) => {
  for (const rule of rules[field]) {
    const valid = rule(value);
    if (valid !== true) {
      errors.value[field] = valid as string;
      return false;
    }
  }
  delete errors.value[field];
  return true;
};


const validateForm = () => {
  let isValid = true;
  for (const field of Object.keys(rules) as (keyof typeof rules)[]) {
    const valid = validateField(field, (eval(field) as any).value);
    if (!valid) isValid = false;
  }
  return isValid;
};


watch([title, description], ([newTitle, newDesc]) => {
  if (newTitle) validateField("title", newTitle);
  if (newDesc) validateField("description", newDesc);
});

const handleSubmit = async () => {
  if (!validateForm()) return;

  submitting.value = true;

  try {
    const newTaskPayload = {
      title: title.value.trim(),
      description: description.value.trim(),
    };

    await taskStore.createTask(newTaskPayload);

    title.value = "";
    description.value = "";
    errors.value = {};

    emit('task-created');
  } catch (err) {
    console.error("Failed to create task:", err);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="pt-10 space-y-4 rounded-lg w-full max-w-md mx-auto">
    <h1 class="text-2xl mb-6 font-semibold text-gray-900 dark:text-gray-100">Create New Task</h1>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="text-sm mb-2 font-medium text-gray-700 dark:text-gray-300 block" for="title">
          Title
        </label>
        <input v-model="title" name="title" type="text" placeholder="Do something amazing..."
          class="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md w-full px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-colors" />
        <p v-if="errors.title" class="text-red-500 dark:text-red-400 text-sm mt-1">
          {{ errors.title }}
        </p>
      </div>

      <div>
        <label class="text-sm mb-2 font-medium text-gray-700 dark:text-gray-300 block" for="description">
          Description
        </label>
        <textarea v-model="description" name="description" placeholder="Add more details about your task..."
          class="min-h-[120px] max-h-[200px] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-colors resize-none" />
        <p v-if="errors.description" class="text-red-500 dark:text-red-400 text-sm mt-1">
          {{ errors.description }}
        </p>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <button type="button" @click="$emit('task-created')"
          class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors font-medium">
          Cancel
        </button>
        <button type="submit" :disabled="submitting"
          class="px-6 py-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium flex items-center gap-2">
          <span v-if="!submitting" class="material-symbols-outlined text-lg">
            add
          </span>
          <span>{{ submitting ? "Creating..." : "Create Task" }}</span>
        </button>
      </div>
    </form>
  </div>
</template>