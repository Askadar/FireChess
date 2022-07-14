import { collection, query } from 'firebase/firestore'
import { collectionData } from 'rxfire/firestore'
import { from } from 'rxjs'
import { map, startWith, switchMap, toArray } from 'rxjs/operators'
import { Option } from '../Components/ZInput/common'

import { db } from '../firebase'
import { useObservable } from './useObservable'
import { useTypedCollection } from './useTypedCollection'

export interface RulesetSchema {
	id: string
	duration: number
	extraTime: number
	type: 'rapid' | 'bullet' | 'classic'
}

export interface RulesetOption extends Option {
	ruleset: RulesetSchema
}

const i18nTypeHash = {
	rapid: 'Рапид',
	bullet: 'Пуля',
	classic: 'Классика',
}

export const useRulesetsCollection = () => {
	const rulesetsCollection = useTypedCollection<RulesetSchema>(collection(db, 'rulesets'))

	const rulesetsQuery = query(rulesetsCollection)
	const rulesetsData = collectionData<RulesetSchema>(rulesetsQuery, { idField: 'id' }).pipe(
		startWith([] as RulesetSchema[])
	)
	const rulesets = useObservable(rulesetsData)

	const pipedRulesets = rulesetsData.pipe(
		switchMap((rulesets) =>
			from(rulesets).pipe(
				map((ruleset) => ({
					label: `${ruleset.duration}|${ruleset.extraTime || 0} ${
						i18nTypeHash[ruleset.type] || ''
					}`.trim(),
					value: ruleset.id,
					ruleset,
				})),
				toArray()
			)
		)
	)
	const rulesetOptions = useObservable<RulesetOption[]>(pipedRulesets)

	return {
		_query: rulesetsQuery,
		rulesets,
		rulesetOptions,
	}
}
