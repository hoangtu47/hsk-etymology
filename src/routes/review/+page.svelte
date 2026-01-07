<script>
    import { onMount } from "svelte";
    import { srsStore } from "$lib/stores/srsStore";

    let allWords = [];
    let dueWords = [];
    let upcomingWords = [];
    let loading = true;
    let currentWord = null;
    let showAnswer = false;

    let wordMap = null;

    // Subscribe to store to react to changes
    $: {
        if (!loading && allWords.length > 0) {
            // Update wordMap if needed (only once when allWords loads)
            if (!wordMap) {
                wordMap = new Map(allWords.map((w) => [w.simplified, w]));
            }
            refreshDueWords($srsStore);
        }
    }

    onMount(async () => {
        try {
            // We need full word data to display content
            const response = await fetch("/hsk-complete.json");
            allWords = await response.json();

            loading = false;
        } catch (e) {
            console.error("Failed to load dictionary for review", e);
            loading = false;
        }
    });

    function refreshDueWords(srsData) {
        if (!wordMap) return;

        const dueKeys = srsStore.getAllDue(srsData);
        dueWords = dueKeys.map((key) => wordMap.get(key)).filter(Boolean);

        if (dueWords.length > 0) {
            currentWord = dueWords[0];
        } else {
            currentWord = null;
        }

        // Calculate upcoming words
        const now = new Date();
        const MAX_UPCOMING = 20; // Limit rendering to prevent freeze

        upcomingWords = Object.entries(srsData)
            .filter(([key, stats]) => {
                // Not due yet
                return new Date(stats.dueDate) > now;
            })
            .sort((a, b) => new Date(a[1].dueDate) - new Date(b[1].dueDate))
            .slice(0, MAX_UPCOMING) // Slice BEFORE mapping to save work
            .map(([key, stats]) => {
                const word = wordMap.get(key);
                if (!word) return null;
                const dueDate = new Date(stats.dueDate);
                const diff = dueDate - now;

                // Format time remaining
                let timeStr = "";
                const minutes = Math.floor(diff / 60000);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                if (days > 0) timeStr = `${days}d ${hours % 24}h`;
                else if (hours > 0) timeStr = `${hours}h ${minutes % 60}m`;
                else timeStr = `${minutes}m`;

                return {
                    ...word,
                    dueIn: timeStr,
                    fullDate: dueDate.toLocaleString(),
                };
            })
            .filter(Boolean);
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

            {#if upcomingWords.length > 0}
                <div class="upcoming-list">
                    <h3>Upcoming Reviews</h3>
                    <div class="list-header">
                        <span>Word</span>
                        <span>Meaning</span>
                        <span>Due In</span>
                    </div>
                    {#each upcomingWords as word}
                        <div class="upcoming-item">
                            <span class="char">{word.simplified}</span>
                            <span class="def"
                                >{word.forms[0].meanings.join(", ")}</span
                            >
                            <span class="time" title={word.fullDate}
                                >{word.dueIn}</span
                            >
                        </div>
                    {/each}
                </div>
            {:else}
                <p>
                    Go back to the dictionary to add more words or wait for
                    reviews to become due.
                </p>
            {/if}
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

    .upcoming-list {
        margin-top: 2rem;
        text-align: left;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
    }

    .upcoming-list h3 {
        padding: 1rem;
        margin: 0;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 1rem;
        color: #334155;
    }

    .list-header {
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        padding: 0.75rem 1rem;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #64748b;
    }

    .upcoming-item {
        display: grid;
        grid-template-columns: 1fr 2fr 1fr;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #f1f5f9;
        font-size: 0.9rem;
    }

    .upcoming-item:last-child {
        border-bottom: none;
    }

    .upcoming-item .char {
        font-weight: 500;
        color: #1a1a1a;
    }

    .upcoming-item .def {
        color: #4b5563;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 1rem;
    }

    .upcoming-item .time {
        color: #3b82f6;
        font-feature-settings: "tnum";
    }
</style>
