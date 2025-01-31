import createScoresService from '../../../../services/beatleader/scores';
// import createAccSaberService from '../../../../services/accsaber';
import createBeatSaviorService from '../../../../services/beatsavior';
import {capitalize} from '../../../../utils/js';
import {BL_API_URL} from '../../../../network/queues/beatleader/api-queue';
import {processScore} from '../../../../network/clients/beatleader/scores/utils/processScore';
import {fetchJson} from '../../../../network/fetch';
import {getResponseBody} from '../../../../network/queues/queues';
import makePendingPromisePool from '../../../../utils/pending-promises';

let scoreFetcher = null;

let blScoresService = null;
// let accSaberService = null;
let beatSaviorService = null;

const resolvePromiseOrWaitForPending = makePendingPromisePool();

export default () => {
	if (scoreFetcher) return scoreFetcher;

	blScoresService = createScoresService();
	// accSaberService = createAccSaberService();
	beatSaviorService = createBeatSaviorService();

	const processServiceParamsFilters = serviceParams => {
		if (!serviceParams) return serviceParams;

		const {filters: {stars = {}, ...restFilters} = {}, ...restParams} = serviceParams;

		return {
			...restParams,
			filters: {
				...restFilters,
				...Object.entries(stars ?? {}).reduce(
					(starFilter, [key, value]) => ({
						...starFilter,
						[`stars${capitalize(key)}`]: value,
					}),
					{}
				),
			},
		};
	};

	const fetchLiveScores = async (playerId, service, serviceParams = {sort: 'date', order: 'desc', page: 1}, otherParams = {}) => {
		const processedServiceParams = processServiceParamsFilters(serviceParams);

		switch (service) {
			case 'user-friends':
				return blScoresService.fetchFollowedScores(
					processedServiceParams,
					otherParams?.refreshInterval,
					otherParams?.priority,
					otherParams?.signal,
					otherParams?.force
				);
			case 'beatsavior':
				return beatSaviorService.getPlayerScoresPage(playerId, processedServiceParams);
			// case 'accsaber':
			// 	return accSaberService.getPlayerScoresPage(player?.playerId, processedServiceParams);
			case 'beatleader':
			default:
				return blScoresService.fetchScoresPageOrGetFromCache(
					playerId,
					processedServiceParams,
					otherParams?.refreshInterval,
					otherParams?.priority,
					otherParams?.signal,
					otherParams?.force
				);
		}
	};

	const fetchPinnedScores = async id => {
		if (!id) return;

		return resolvePromiseOrWaitForPending(`pinnedScores/${id}`, () =>
			fetchJson(BL_API_URL + `player/${id}/pinnedScores`).then(data => getResponseBody(data)?.map(s => processScore(s)) ?? [])
		);
	};

	scoreFetcher = {fetchCachedScores: fetchLiveScores, fetchLiveScores, fetchPinnedScores};

	return scoreFetcher;
};
