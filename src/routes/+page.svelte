<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<svelte:head>
	<title>Peter Whitfield</title>
	<meta
		name="description"
		content="A simple personal blog homepage built with SvelteKit and Tailwind."
	/>
</svelte:head>

<div class="app-container py-10 sm:py-14">
	<main>
		<section aria-label="Links">
			<p class="app-muted mb-4 max-w-xl text-sm leading-7">
				I write about AI, systems design, and the evolving shape of software teams.
			</p>
			<div class="flex flex-wrap items-center gap-4">
				<a
					aria-label="LinkedIn"
					class="app-muted no-underline transition hover:opacity-80"
					href="https://www.linkedin.com/in/peter-whitfield-33b092306/"
					rel="noreferrer"
					target="_blank"
				>
					<svg aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19ZM8.34 10.67H5.67V18H8.34V10.67ZM7 6.42A1.58 1.58 0 1 0 7 9.58A1.58 1.58 0 0 0 7 6.42ZM18.33 13.52C18.33 11.22 16.86 10.42 15.5 10.42C14.4 10.42 13.73 11.05 13.42 11.49V10.67H10.87V18H13.53V14.04C13.53 13 13.73 11.98 15.02 11.98C16.29 11.98 16.31 13.17 16.31 14.11V18H19V13.52H18.33Z"
						/>
					</svg>
				</a>
				<a
					aria-label="GitHub"
					class="app-muted no-underline transition hover:opacity-80"
					href="https://github.com/petewhitfield"
					rel="noreferrer"
					target="_blank"
				>
					<svg aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 .5C5.65.5.5 5.8.5 12.33C.5 17.56 3.8 21.99 8.38 23.56C8.96 23.67 9.17 23.31 9.17 23C9.17 22.72 9.16 21.8 9.15 20.7C5.94 21.42 5.26 19.28 5.26 19.28C4.74 17.91 3.97 17.54 3.97 17.54C2.91 16.8 4.05 16.81 4.05 16.81C5.22 16.89 5.84 18.04 5.84 18.04C6.88 19.88 8.56 19.35 9.23 19.03C9.34 18.25 9.64 17.72 9.97 17.41C7.4 17.11 4.7 16.08 4.7 11.46C4.7 10.15 5.16 9.08 5.93 8.24C5.81 7.94 5.39 6.7 6.05 5.02C6.05 5.02 7.04 4.69 9.14 6.16C10.08 5.9 11.09 5.77 12.1 5.77C13.11 5.77 14.12 5.9 15.06 6.16C17.16 4.69 18.15 5.02 18.15 5.02C18.81 6.7 18.39 7.94 18.27 8.24C19.04 9.08 19.5 10.15 19.5 11.46C19.5 16.09 16.79 17.1 14.21 17.4C14.63 17.78 15 18.53 15 19.68C15 21.33 14.99 22.66 14.99 23C14.99 23.31 15.2 23.68 15.79 23.56C20.36 21.98 23.67 17.55 23.67 12.33C23.67 5.8 18.52.5 12 .5Z"
						/>
					</svg>
				</a>
			</div>
		</section>

		<section id="thoughts">
			<p class="app-muted-soft mt-14 text-sm tracking-[0.2em] uppercase">Thoughts</p>
			<div class="mt-6 space-y-8">
				{#each data.writings as writing (writing.slug)}
					<article>
						<a class="inline-block no-underline" href={resolve(`/thoughts/${writing.slug}`)}>
							<h2
								class="app-heading [font-family:'Iowan_Old_Style','Palatino_Linotype','Book_Antiqua',Palatino,serif] text-base leading-tight font-medium transition hover:opacity-80 sm:text-lg"
							>
								{writing.title}
							</h2>
						</a>
					</article>
				{/each}
			</div>
		</section>
	</main>
</div>
