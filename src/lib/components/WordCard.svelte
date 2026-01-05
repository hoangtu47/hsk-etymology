<script>
  export let word;
</script>

<div class="card">
  <div class="character">{word.simplified}</div>
  <div class="pinyin">{word.forms[0].transcriptions.pinyin}</div>
  <div class="meaning" title={word.forms[0].meanings.join(", ")}>
    {word.forms[0].meanings.join(", ")}
  </div>
  <div class="level-badge">
    HSK {word.level[0]}
  </div>
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, 0.1),
      0 1px 2px 0 rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
    transition: background-color 0.2s ease;
    cursor: default;
    border: 1px solid #e2e8f0;
    width: 100%;
    box-sizing: border-box;
  }

  .card:hover {
    background-color: #f8fafc;
  }

  .character {
    font-size: 2rem;
    font-weight: 500;
    color: #1a1a1a;
    line-height: 1;
    width: 4rem;
    min-width: 4rem;
    text-align: center;
    flex-shrink: 0;
  }

  .pinyin {
    font-size: 1.1rem;
    color: #666;
    font-weight: 500;
    width: 10rem;
    min-width: 10rem;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meaning {
    font-size: 1rem;
    color: #4b5563;
    text-align: left;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0; /* allows text-overflow to work in flex child */
  }

  .level-badge {
    background: #e0f2fe;
    color: #0369a1;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
</style>
