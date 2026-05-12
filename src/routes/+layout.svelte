<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import MoonIcon from '$lib/components/icons/MoonIcon.svelte';
	import SunIcon from '$lib/components/icons/SunIcon.svelte';

	let { children } = $props();
	let theme = $state<'light' | 'dark'>('light');
	let isScrolled = $state(false);

	function applyTheme(nextTheme: 'light' | 'dark') {
		theme = nextTheme;
		document.documentElement.dataset.theme = nextTheme;
	}

	function toggleTheme() {
		applyTheme(theme === 'light' ? 'dark' : 'light');
	}

	onMount(() => {
		const updateScrolled = () => {
			isScrolled = window.scrollY > 4;
		};

		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
		theme = systemTheme;
		document.documentElement.dataset.theme = systemTheme;

		updateScrolled();
		window.addEventListener('scroll', updateScrolled, { passive: true });

		return () => {
			window.removeEventListener('scroll', updateScrolled);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="color-scheme" content="light dark" />
	<script>
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			document.documentElement.dataset.theme = 'dark';
		} else {
			document.documentElement.dataset.theme = 'light';
		}
	</script>
</svelte:head>

<div class="app-shell">
	<header class:site-header-scrolled={isScrolled} class="site-header">
		<div class="site-header-inner app-container py-4">
			<a
				class="site-title [font-family:'Iowan_Old_Style','Palatino_Linotype','Book_Antiqua',Palatino,serif] text-[1.4rem] font-medium tracking-tight sm:text-[1.5rem]"
				href={resolve('/')}
			>
				Peter Whitfield
			</a>
			<button
				aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
				class="theme-toggle"
				type="button"
				onclick={toggleTheme}
			>
				<span class:theme-icon-active={theme === 'light'} class="theme-icon" aria-hidden="true">
					<SunIcon />
				</span>
				<span class="theme-toggle-track" aria-hidden="true"></span>
				<span class:theme-icon-active={theme === 'dark'} class="theme-icon" aria-hidden="true">
					<MoonIcon />
				</span>
			</button>
		</div>
	</header>

	{@render children()}
</div>
