import { createRouter, createWebHashHistory } from 'vue-router'
import { createApp } from 'vue'

import { Main } from './Main'
import { routes } from './router'

const router = createRouter({
	history: createWebHashHistory(),
	routes,
})
createApp(Main).use(router).mount('#chess')
