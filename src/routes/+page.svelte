<script>
  import { onMount } from "svelte";
  import WordCard from "$lib/components/WordCard.svelte";
  import { srsStore } from "$lib/stores/srsStore";

  let allWords = [];
  let displayedWords = [];
  let loading = true;
  let page = 1;
  const pageSize = 50;

  let selectedLevel = "all";
  let levels = [];

  $: dueCount = srsStore.getAllDue($srsStore).length;

  // Fetch data on mount
  onMount(async () => {
    try {
      const response = await fetch("/hsk-complete.json");
      allWords = await response.json();

      // Extract unique levels for the filter
      const uniqueLevels = new Set();
      allWords.forEach((word) => {
        if (word.level && Array.isArray(word.level)) {
          word.level.forEach((l) => uniqueLevels.add(l));
        }
      });
      // Sort levels naturally-ish
      levels = Array.from(uniqueLevels).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      );

      loading = false;
      loadMore(true);
    } catch (error) {
      console.error("Failed to load HSK data:", error);
      loading = false;
    }
  });

  function loadMore(reset = false) {
    if (reset) {
      page = 1;
      displayedWords = [];
    }

    let filtered = allWords;
    if (selectedLevel !== "all") {
      filtered = allWords.filter(
        (word) => word.level && word.level.includes(selectedLevel),
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const newWords = filtered.slice(start, end);

    if (newWords.length > 0) {
      displayedWords = [...displayedWords, ...newWords];
      page++;
    }
  }

  // Handle filter change
  function handleFilterChange() {
    loadMore(true);
  }

  // Infinite scroll handler (simple version)
  function handleScroll() {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 500
    ) {
      loadMore();
    }
  }
</script>

<svelte:window on:scroll={handleScroll} />

<div class="container">
  <header>
    <h1>HSK Dictionary</h1>
    <div class="controls">
      <a href="/review" class="review-link" class:has-due={dueCount > 0}>
        Reviews ({dueCount})
      </a>
      <select bind:value={selectedLevel} on:change={handleFilterChange}>
        <option value="all">All Levels</option>
        {#each levels as level}
          <option value={level}>HSK {level}</option>
        {/each}
      </select>
      <div class="count">
        Showing {displayedWords.length} words
      </div>
    </div>
  </header>

  {#if loading}
    <div class="loading">Loading dictionary...</div>
  {:else}
    <div class="list">
      {#each displayedWords as word (word.simplified)}
        <WordCard {word} />
      {/each}
    </div>
    {#if displayedWords.length === 0}
      <div class="empty">No words found for this level.</div>
    {/if}
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Helvetica,
      Arial,
      sans-serif;
    background-color: #f8fafc;
    color: #334155;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  select {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background-color: white;
    font-size: 1rem;
    color: #334155;
    cursor: pointer;
    min-width: 150px;
  }

  .review-link {
    text-decoration: none;
    color: #64748b;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .review-link:hover {
    background: #e2e8f0;
    color: #334155;
  }

  .review-link.has-due {
    color: #ef4444;
    font-weight: 600;
    background: #fee2e2;
  }

  .count {
    color: #64748b;
    font-size: 0.9rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 2rem;
  }

  .loading,
  .empty {
    text-align: center;
    padding: 4rem;
    font-size: 1.2rem;
    color: #64748b;
  }
</style>
