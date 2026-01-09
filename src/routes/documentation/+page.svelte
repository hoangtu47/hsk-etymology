<script>
    // simple list of sections used in the page
    const sections = [
        { id: "intro", title: "Introduction" },
        { id: "stores", title: "Custom Stores" },
        { id: "reactivity", title: "Reactivity" },
        { id: "lifecycle", title: "Lifecycle" },
        { id: "bindings", title: "Bindings" },
        { id: "events", title: "Events" },
    ];
</script>

<svelte:head>
    <title>Project Documentation</title>
</svelte:head>

<div class="page-wrapper">
    <!-- simple sidebar -->
    <aside>
        <div class="nav-header">
            <h3>Svelte Notes</h3>
            <a href="/" class="back-link">← Back to App</a>
        </div>
        <nav>
            <ul>
                {#each sections as section}
                    <li><a href="#{section.id}">{section.title}</a></li>
                {/each}
            </ul>
        </nav>
    </aside>

    <!-- main content -->
    <main>
        <section id="intro">
            <h1>Documentation</h1>
            <p>
                This is a summary of the Svelte features I used to build the HSK
                Dictionary app.
            </p>
        </section>

        <hr />

        <section id="stores">
            <h2>1. Custom Stores</h2>
            <p>
                I used a custom store in <code>src/lib/stores/srsStore.js</code>
                to handle the flashcard logic. Instead of just updating data directly
                in components, I made functions like
                <code>addWord</code>
                and <code>review</code>.
            </p>
            <div class="code-block">
                <pre><code>
// src/lib/stores/srsStore.js

function createSrsStore() {"{"}
    const {"{"} subscribe, set, update {"}"} = writable({"{}"});

    return {"{"}
        subscribe,
        addWord: (word) => update(n => ...),
        review: (word, rating) => update(n => ...)
    {"}"};
{"}"}
                </code></pre>
            </div>
        </section>

        <section id="reactivity">
            <h2>2. Reactivity ($:)</h2>
            <p>
                Svelte's <code>$:</code> label makes variables reactive. When the
                data changes, these variables update automatically.
            </p>
            <div class="code-block">
                <pre><code>
// Update dueCount automatically when srsStore changes
$: dueCount = srsStore.getAllDue($srsStore).length;
                </code></pre>
            </div>
        </section>

        <section id="lifecycle">
            <h2>3. Lifecycle (onMount)</h2>
            <p>
                I used <code>onMount</code> to fetch the JSON data when the page
                loads.
            </p>
            <div class="code-block">
                <pre><code>
import {"{"} onMount {"}"} from "svelte";

onMount(async () => {"{"}
    const response = await fetch("/hsk-complete.json");
    allWords = await response.json();
{"}"});
                </code></pre>
            </div>
        </section>

        <section id="bindings">
            <h2>4. Bindings</h2>
            <p>
                I used <code>bind:value</code> on the select element to filter HSK
                levels.
            </p>
            <div class="code-block">
                <pre><code>
&lt;select bind:value={"{"}selectedLevel{"}"}&gt;
    &lt;option value="all"&gt;All Levels&lt;/option&gt;
    ...
&lt;/select&gt;
                </code></pre>
            </div>
        </section>

        <section id="events">
            <h2>5. Event Modifiers</h2>
            <p>
                I used <code>on:click|stopPropagation</code> on buttons so clicking
                them doesn't trigger clicks on the parent card.
            </p>
            <div class="code-block">
                <pre><code>
&lt;button on:click|stopPropagation={"{"}toggleLearning{"}"}&gt;
    +
&lt;/button&gt;
                </code></pre>
            </div>
        </section>
    </main>
</div>

<style>
    /* Global basic reset */
    :global(body) {
        margin: 0;
        font-family: sans-serif;
        color: #333;
        background-color: #fff;
    }

    .page-wrapper {
        display: flex;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        gap: 40px;
    }

    /* Simple Sidebar Styles */
    aside {
        width: 200px;
        flex-shrink: 0;
        position: sticky;
        top: 20px;
        height: fit-content;
    }

    .nav-header h3 {
        margin-top: 0;
    }

    .back-link {
        display: block;
        margin-bottom: 20px;
        color: #666;
        text-decoration: none;
        font-size: 0.9rem;
    }

    .back-link:hover {
        text-decoration: underline;
    }

    nav ul {
        list-style: none;
        padding: 0;
        border-left: 2px solid #eee;
    }

    nav li a {
        display: block;
        padding: 5px 0 5px 15px;
        color: #444;
        text-decoration: none;
    }

    nav li a:hover {
        color: #ff3e00; /* Svelte Orange */
    }

    /* Main Content Styles */
    main {
        flex: 1;
        min-width: 0; /* Prevents flex overflow */
    }

    section {
        margin-bottom: 40px;
    }

    h1 {
        margin-top: 0;
        font-size: 2.5rem;
    }

    h2 {
        color: #222;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
        margin-top: 0;
    }

    p {
        line-height: 1.6;
        color: #555;
    }

    code {
        background: #f4f4f4;
        padding: 2px 5px;
        border-radius: 4px;
        font-family: monospace;
    }

    .code-block {
        background: #f8f8f8;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #ddd;
        overflow-x: auto;
    }

    pre {
        margin: 0;
    }

    hr {
        border: none;
        border-top: 1px solid #eee;
        margin: 40px 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .page-wrapper {
            flex-direction: column;
        }

        aside {
            width: 100%;
            position: static;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }

        nav ul {
            border-left: none;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        nav li a {
            padding: 5px 10px;
            background: #eee;
            border-radius: 15px;
        }
    }
</style>
