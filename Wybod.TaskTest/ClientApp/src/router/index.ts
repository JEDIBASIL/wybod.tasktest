import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/components/layouts/DefaultLayout.vue'
import TasksView from '@/views/TasksView.vue'
import TaskDetails from '@/views/TaskDetails.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '/',
          name: 'tasks',
          component: TasksView
        },
        {
          path: '/tasks/:id',
          name: 'tasks-id',
          component: TaskDetails
        }
      ]
    }
  ]
})

export default router
