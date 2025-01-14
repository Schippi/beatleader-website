<script>
	import {navigate} from 'svelte-routing';
	import {flip} from 'svelte/animate';
	import Badge from '../Common/Badge.svelte';
	import {dndzone} from 'svelte-dnd-action';

	export let player;
	export let editModel;

	function invertColor(hex) {
		if (hex.indexOf('#') === 0) {
			hex = hex.slice(1);
		}
		// convert 3-digit hex to 6-digits.
		if (hex.length === 3) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		if (hex.length === 6) {
			hex = hex + 'FF';
		}
		var r = parseInt(hex.slice(0, 2), 16),
			g = parseInt(hex.slice(2, 4), 16),
			b = parseInt(hex.slice(4, 6), 16),
			a = parseInt(hex.slice(6, 8), 16);
		// https://stackoverflow.com/a/3943023/112731
		return r * 0.299 + g * 0.687 + b * 0.114 > 186 && a > 128 ? '#000000' : '#FFFFFF';
	}

	var clans = null;

	function initClans(player) {
		clans = player?.clans ?? null;
	}

	function handleDndConsider(e) {
		clans = e.detail.items;
	}
	function handleDndFinalize(e) {
		clans = e.detail.items;
		editModel.data.clanOrder = clans.map(c => c.tag).join(',');
	}

	$: initClans(player);
</script>

{#if clans}
	{#if editModel}
		<span
			use:dndzone={{items: clans, flipDurationMs: 300}}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}
			class="clan-badges">
			{#each clans as clan (clan.id)}
				<a class="change-wobble" href={`/clan/${clan?.tag}`} animate:flip={{duration: 300}} on:click|stopPropagation>
					<Badge
						label={clan?.tag ?? '???'}
						onlyLabel={true}
						fluid={true}
						color={invertColor(clan?.color ?? '#000000')}
						bgColor={clan?.color ?? 'var(--dimmed)'}
						style="animation-delay: -.{Math.round(Math.random() * 40)}s; animation-duration: .{20 + Math.round(Math.random() * 30)}s"
						title="Change clan order" />
				</a>
			{/each}
		</span>
	{:else}
		<span class="clan-badges">
			{#each clans as clan (clan.tag)}
				<a href={`/clan/${clan?.tag}`} on:click|stopPropagation={() => navigate(`/clan/${clan?.tag}`)}>
					<Badge
						label={clan?.tag ?? '???'}
						onlyLabel={true}
						fluid={true}
						color={invertColor(clan?.color ?? '#000000')}
						bgColor={clan?.color ?? 'var(--dimmed)'}
						title="Go to clan profile" />
				</a>
			{/each}
		</span>
	{/if}
{/if}

<style>
	.clan-badges {
		margin-left: 0.5em;
		font-size: 1rem;
		padding: 0 !important;
		font-weight: bold;
		min-width: fit-content;
	}

	:global(.clan-badges span.label) {
		font-weight: bold;
	}

	.clan-badges :global(a > *) {
		margin-bottom: 0 !important;
		margin-right: 0.25em !important;
		padding: 0 !important;
		font-weight: bold;
		width: min-content !important;
	}
	.clan-badges :global(a > *:last-child) {
		margin-right: 0 !important;
	}

	.change-wobble {
		opacity: 1;
		margin: 0.5em;
	}

	:global(.clan-badges .change-wobble .badge:nth-child(2n)) {
		animation-name: keyframes1;
		animation-iteration-count: infinite;
		transform-origin: 50% 10%;
		cursor: grab;
		transform: scale(100%);
	}

	:global(.clan-badges .change-wobble .badge:nth-child(2n-1)) {
		animation-name: keyframes2;
		animation-iteration-count: infinite;
		animation-direction: alternate;
		transform-origin: 30% 5%;
		cursor: grab;
		transform: scale(100%);
	}

	@keyframes keyframes1 {
		0% {
			transform: rotate(-1deg);
			animation-timing-function: ease-in;
		}

		50% {
			transform: rotate(1.5deg);
			animation-timing-function: ease-out;
		}
	}

	@keyframes keyframes2 {
		0% {
			transform: rotate(1deg);
			animation-timing-function: ease-in;
		}

		50% {
			transform: rotate(-1.5deg);
			animation-timing-function: ease-out;
		}
	}

	@media screen and (max-width: 300px) {
		.clan-badges {
			display: none;
		}
	}
</style>
