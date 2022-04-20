import { createRouter, createWebHashHistory } from 'vue-router'
import { createApp } from 'vue'

import Toast, { PluginOptions as ToastPluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import { Main } from './Main'
import { routes } from './router'

const router = createRouter({
	history: createWebHashHistory(),
	routes,
})
createApp(Main)
	.use(router)
	.use(Toast, {} as ToastPluginOptions)
	.mount('#chess')
