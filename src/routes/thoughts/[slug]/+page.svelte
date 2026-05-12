<script lang="ts">
	import { onMount, tick } from 'svelte';

	let { data } = $props();
	let activeHeadingId = $state('');

	onMount(() => {
		let cleanup = () => {};

		void (async () => {
			await tick();

			const headingIds = data.writing.toc.map((item) => item.id);
			const headings = headingIds
				.map((id) => document.getElementById(id))
				.filter((heading): heading is HTMLElement => heading instanceof HTMLElement);

			if (headings.length === 0) return;

			let headingTops = headings.map((heading) => ({
				id: heading.id,
				top: heading.getBoundingClientRect().top + window.scrollY
			}));

			const measureHeadings = () => {
				headingTops = headings.map((heading) => ({
					id: heading.id,
					top: heading.getBoundingClientRect().top + window.scrollY
				}));
			};

			const updateActiveHeading = () => {
				const currentScroll = window.scrollY + 220;
				let currentHeadingId = headingTops[0]?.id ?? '';

				for (const heading of headingTops) {
					if (heading.top <= currentScroll) {
						currentHeadingId = heading.id;
					} else {
						break;
					}
				}

				activeHeadingId = currentHeadingId;
			};

			measureHeadings();
			updateActiveHeading();
			window.addEventListener('scroll', updateActiveHeading, { passive: true });
			window.addEventListener('resize', measureHeadings);
			window.addEventListener('resize', updateActiveHeading);

			cleanup = () => {
				window.removeEventListener('scroll', updateActiveHeading);
				window.removeEventListener('resize', measureHeadings);
				window.removeEventListener('resize', updateActiveHeading);
			};
		})();

		return () => cleanup();
	});
</script>

<svelte:head>
	<title>{data.writing.title}</title>
</svelte:head>

<div class="app-container py-10 sm:py-14">
	<div class="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
		<aside class="hidden lg:block">
			<div class="sticky top-[8rem] w-60 pt-16">
				<p class="section-kicker">Contents</p>
				<nav aria-label="Table of contents" class="mt-5">
					<ul class="space-y-3">
						{#each data.writing.toc as item (item.id)}
							<li>
								<a
									aria-current={activeHeadingId === item.id ? 'location' : undefined}
									class={`toc-link block text-sm leading-6 ${item.level > 2 ? 'pl-4' : ''}`}
									href={`#${item.id}`}
								>
									{item.text}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			</div>
		</aside>

		<article class="min-w-0">
			<header class="app-rule-bottom pb-8">
				<p class="app-muted-soft text-sm">{data.writing.date}</p>
				<h1
					class="app-heading mt-3 [font-family:'Iowan_Old_Style','Palatino_Linotype','Book_Antiqua',Palatino,serif] text-4xl leading-tight font-medium tracking-tight sm:text-5xl"
				>
					{data.writing.title}
				</h1>
				{#if data.writing.description}
					<p class="app-muted mt-5 max-w-2xl text-lg leading-8">
						{data.writing.description}
					</p>
				{/if}
			</header>

			<div class="prose-shell mt-10">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html data.writing.html}
			</div>
		</article>
	</div>
</div>
