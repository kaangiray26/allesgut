import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: "/",
    component: NavBar,

  },
  {
    path: "/session/:id",
    component: NavBar
  },
  {
    path: '/:catchAll(.*)',
    component: PageNotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router