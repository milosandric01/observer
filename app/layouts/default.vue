<template>
  <div class="flex min-h-screen">
    <aside class="w-60 bg-surface-1 border-r border-hairline p-6 fixed top-0 left-0 bottom-0 overflow-y-auto">
      <div class="px-3 mb-8">
        <h1 class="text-body-lg font-semibold tracking-tight text-ink">Observer</h1>
      </div>
      <nav class="flex flex-col gap-1">
        <NuxtLink to="/" class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body-sm font-medium text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all [&.router-link-active]:text-ink [&.router-link-active]:bg-surface-2">
          <span class="text-base opacity-70">◉</span>
          Overview
        </NuxtLink>
        <NuxtLink to="/projects" class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body-sm font-medium text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all [&.router-link-active]:text-ink [&.router-link-active]:bg-surface-2">
          <span class="text-base opacity-70">◫</span>
          Projects
        </NuxtLink>
        <NuxtLink to="/live" class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body-sm font-medium text-ink-subtle hover:text-ink hover:bg-surface-2 transition-all [&.router-link-active]:text-ink [&.router-link-active]:bg-surface-2">
          <span class="text-base opacity-70">●</span>
          Live
        </NuxtLink>
      </nav>
    </aside>
    <main class="flex-1 ml-60 p-8 px-10">
      <slot />
    </main>
  </div>
</template>
