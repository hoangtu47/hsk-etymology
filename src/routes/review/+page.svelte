<script>
    import { onMount } from "svelte";
    import { srsStore } from "$lib/stores/srsStore";

    let allWords = [];
    let dueWords = [];
    let currentWord = null;
    let showAnswer = false;
    let loading = true;

    // Subscribe to store to react to changes
    $: {
        if (!loading && allWords.length > 0) {
            refreshDueWords($srsStore);
        }
    }

    onMount(async () => {
        try {
            // We need full word data to display content
            const response = await fetch("/hsk-complete.json");
            allWords = await response.json();

            loading = false;
            refreshDueWords($srsStore);
        } catch (e) {
            console.error("Failed to load dictionary for review", e);
            loading = false;
        }
    });

    function refreshDueWords(srsData) {
        const dueKeys = srsStore.getAllDue(srsData);
        // Map keys to actual word objects
        // This search is O(N*M) which is bad for 5000 words. Optimization: create a map.
        // For 5000 words, it's manageable but let's optimize slightly with a map if needed.
        // For now, simple find is okay for small due list.
        // Better: create a map on mount.

        const wordMap = new Map(allWords.map((w) => [w.simplified, w]));

        dueWords = dueKeys.map((key) => wordMap.get(key)).filter(Boolean);

        if (!currentWord && dueWords.length > 0) {
            currentWord = dueWords[0];
        } else if (dueWords.length === 0) {
            currentWord = null;
        }
    }

    function handleReview(rating) {
        if (!currentWord) return;

        srsStore.review(currentWord.simplified, rating);

        // Move to next word
        showAnswer = false;
        // refreshDueWords is reactive via store update, but we might want to force next card selection logic
        // The reactive block above handles it if store updates.
        // However, svelte store update might trigger before we calculate 'next'.
        // Let's rely on reactivity: store updates -> srsData changes -> refreshDueWords -> dueWords changes -> currentWord updates (if index 0 is gone)
    }
</script>

<div class="container">
    <header>
        <a href="/" class="back-link">← Back to Dictionary</a>
        <h1>Review Session</h1>
    </header>

    {#if loading}
        <div class="message">Loading reviews...</div>
    {:else if !currentWord}
        <div class="message empty">
            <h2>🎉 All caught up!</h2>
            <p>No words are currently due for review.</p>
            <p>
                Go back to the dictionary to add more words or wait for reviews
                to become due.
            </p>
        </div>
    {:else}
        <div class="review-card">
            <div class="front">
                <div class="character">{currentWord.simplified}</div>
            </div>

            {#if showAnswer}
                <div class="back">
                    <div class="pinyin">
                        {currentWord.forms[0].transcriptions.pinyin}
                    </div>
                    <div class="meaning">
                        {currentWord.forms[0].meanings.join(", ")}
                    </div>

                    <div class="actions">
                        <button
                            class="btn wrong"
                            on:click={() => handleReview(0)}>Again</button
                        >
                        <button
                            class="btn hard"
                            on:click={() => handleReview(1)}>Hard</button
                        >
                        <button
                            class="btn good"
                            on:click={() => handleReview(2)}>Good</button
                        >
                        <button
                            class="btn easy"
                            on:click={() => handleReview(3)}>Easy</button
                        >
                    </div>
                </div>
            {:else}
                <button class="show-answer" on:click={() => (showAnswer = true)}
                    >Show Answer</button
                >
            {/if}
        </div>

        <div class="stats">
            Reviews pending: {dueWords.length}
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }

    header {
        margin-bottom: 2rem;
        position: relative;
    }

    .back-link {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        text-decoration: none;
        color: #64748b;
        font-weight: 500;
    }

    .review-card {
        background: white;
        border-radius: 16px;
        padding: 3rem 2rem;
        box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1);
        min-height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: 1px solid #e2e8f0;
    }

    .character {
        font-size: 5rem;
        font-weight: 500;
        color: #1a1a1a;
        margin-bottom: 1rem;
    }

    .pinyin {
        font-size: 1.5rem;
        color: #666;
        margin-bottom: 0.5rem;
    }

    .meaning {
        font-size: 1.1rem;
        color: #334155;
        margin-bottom: 2rem;
        max-width: 80%;
    }

    .show-answer {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-size: 1.1rem;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.2s;
    }

    .show-answer:hover {
        background: #2563eb;
    }

    .actions {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
        width: 100%;
    }

    .btn {
        padding: 0.75rem 0.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        color: white;
        transition: transform 0.1s;
    }

    .btn:active {
        transform: scale(0.95);
    }

    .wrong {
        background-color: #ef4444;
    }
    .hard {
        background-color: #f59e0b;
    }
    .good {
        background-color: #22c55e;
    }
    .easy {
        background-color: #3b82f6;
    }

    .stats {
        margin-top: 1.5rem;
        color: #94a3b8;
    }

    .message {
        padding: 4rem;
        color: #64748b;
    }

    .empty h2 {
        color: #0f172a;
        margin-bottom: 0.5rem;
    }
</style>
