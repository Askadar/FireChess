import { RouteRecordRaw } from 'vue-router'

import { Room } from './Room'
import { Game } from './Game'

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		component: Room,
	},
	{
		path: '/:roomId',
		component: Game,
	},
]
