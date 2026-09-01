<script>
  import { buildGridMetrics } from '$lib/graph-paper.js';

  let pageWidth = 960;
  let pageHeight = 1200;
  let marginTop = 72;
  let marginRight = 72;
  let marginBottom = 72;
  let marginLeft = 72;
  let gridSize = 24;
  let mergedColumns = [{ id: crypto.randomUUID(), start: 1, width: 20 }];

  function createMergedColumn() {
    return { id: crypto.randomUUID(), start: 1, width: 1 };
  }

  function addMergedColumn() {
    mergedColumns = [...mergedColumns, createMergedColumn()];
  }

  function removeMergedColumn(id) {
    mergedColumns = mergedColumns.filter((column) => column.id !== id);
  }

  function clampNumber(value, minimum, maximum) {
    return Math.min(Math.max(Number(value) || minimum, minimum), maximum);
  }

  $: metrics = buildGridMetrics({
    pageWidth,
    pageHeight,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    gridSize,
    mergedColumns
  });

  function exportSvg() {
    const svg = document.getElementById('graph-paper-svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const content = serializer.serializeToString(svg);
    const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'graph-paper.svg';
    link.click();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  <title>Graph Paper Designer</title>
  <meta
    name="description"
    content="Design custom graph paper with margins, grid size, and merged columns for notebooks and planning sheets."
  />
</svelte:head>

<div class="layout">
  <aside class="controls">
    <div class="panel-header">
      <p class="eyebrow">Custom paper planner</p>
      <h1>Graph Paper Designer</h1>
    </div>

    <section class="section-block">
      <h2>Page size</h2>
      <div class="field-grid">
        <label>
          <span>Width</span>
          <input type="number" min="200" max="2000" bind:value={pageWidth} />
        </label>
        <label>
          <span>Height</span>
          <input type="number" min="200" max="3000" bind:value={pageHeight} />
        </label>
      </div>
    </section>

    <section class="section-block">
      <h2>Margins</h2>
      <div class="field-grid">
        <label>
          <span>Top</span>
          <input type="number" min="0" max="250" bind:value={marginTop} />
        </label>
        <label>
          <span>Right</span>
          <input type="number" min="0" max="250" bind:value={marginRight} />
        </label>
        <label>
          <span>Bottom</span>
          <input type="number" min="0" max="250" bind:value={marginBottom} />
        </label>
        <label>
          <span>Left</span>
          <input type="number" min="0" max="250" bind:value={marginLeft} />
        </label>
      </div>
    </section>

    <section class="section-block">
      <h2>Grid</h2>
      <div class="field-grid single">
        <label>
          <span>Grid size</span>
          <input type="number" min="8" max="80" bind:value={gridSize} />
        </label>
      </div>
    </section>

    <section class="section-block">
      <h2>Merged columns</h2>
      {#each mergedColumns as column (column.id)}
        <div class="merge-row">
          <label>
            <span>Start</span>
            <input
              type="number"
              min="1"
              max="200"
              value={column.start}
              on:input={(event) => {
                column.start = clampNumber(event.currentTarget.value, 1, 200);
                mergedColumns = [...mergedColumns];
              }}
            />
          </label>
          <label>
            <span>Width</span>
            <input
              type="number"
              min="1"
              max="200"
              value={column.width}
              on:input={(event) => {
                column.width = clampNumber(event.currentTarget.value, 1, 200);
                mergedColumns = [...mergedColumns];
              }}
            />
          </label>
          <button type="button" class="ghost-button" on:click={() => removeMergedColumn(column.id)}>
            Remove
          </button>
        </div>
      {/each}

      <button type="button" class="primary-button" on:click={addMergedColumn}>Add merged column</button>
    </section>
  </aside>

  <main class="preview-panel">
    <div class="preview-toolbar">
      <div>
        <strong>{metrics.cellsAcross}</strong>
        <span>×</span>
        <strong>{metrics.cellsDown}</strong>
        <span>grid</span>
      </div>
      <button type="button" class="primary-button" on:click={exportSvg}>Download SVG</button>
    </div>

    <div class="paper-frame">
      <svg
        id="graph-paper-svg"
        viewBox={`0 0 ${metrics.pageWidth} ${metrics.pageHeight}`}
        width={metrics.pageWidth}
        height={metrics.pageHeight}
        role="img"
        aria-label="Custom graph paper preview"
      >
        <rect x="0" y="0" width={metrics.pageWidth} height={metrics.pageHeight} fill="#ffffff" />
        <rect
          x={metrics.marginLeft}
          y={metrics.marginTop}
          width={metrics.usableWidth}
          height={metrics.usableHeight}
          fill="none"
          stroke="#d7d9e8"
          stroke-width="2"
        />

        {#each metrics.verticalLines as x}
          <line
            x1={x}
            y1={metrics.marginTop}
            x2={x}
            y2={metrics.marginTop + metrics.usableHeight}
            stroke={x === metrics.marginLeft || x === metrics.marginLeft + metrics.usableWidth ? '#8da1ff' : '#dfe7ff'}
            stroke-width={x === metrics.marginLeft || x === metrics.marginLeft + metrics.usableWidth ? 2 : 1}
          />
        {/each}

        {#each metrics.horizontalLines as y}
          <line
            x1={metrics.marginLeft}
            y1={y}
            x2={metrics.marginLeft + metrics.usableWidth}
            y2={y}
            stroke="#dfe7ff"
            stroke-width="1"
          />
        {/each}
      </svg>
    </div>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #eef3ff;
    color: #111827;
    font-family: 'Segoe UI', sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
    min-height: 100vh;
  }

  .controls {
    background: #f8faff;
    border-right: 1px solid #d7dfef;
    padding: 2rem 1.5rem;
  }

  .panel-header {
    margin-bottom: 1.5rem;
  }

  .eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.14rem;
    text-transform: uppercase;
    margin: 0 0 0.4rem;
    color: #5b6ea8;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 2vw, 2.5rem);
  }

  .section-block {
    display: grid;
    gap: 0.9rem;
    margin-top: 1.5rem;
    padding: 1rem;
    border: 1px solid #dfe7ff;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.65);
  }

  .section-block h2 {
    margin: 0;
    font-size: 1rem;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }

  .field-grid.single {
    grid-template-columns: 1fr;
  }

  label {
    display: grid;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: #46526f;
  }

  input {
    padding: 0.7rem 0.75rem;
    border-radius: 10px;
    border: 1px solid #c8d3f2;
    font: inherit;
    background: white;
  }

  .merge-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 0.6rem;
    align-items: end;
  }

  .primary-button,
  .ghost-button {
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font: inherit;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }

  .primary-button {
    background: linear-gradient(135deg, #3a68ff, #6b7cff);
    color: white;
    padding: 0.8rem 1rem;
    font-weight: 600;
  }

  .ghost-button {
    background: #eef2ff;
    color: #2d3d6f;
    padding: 0.7rem 0.8rem;
  }

  .primary-button:hover,
  .ghost-button:hover {
    transform: translateY(-1px);
  }

  .preview-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    gap: 1.2rem;
  }

  .preview-toolbar {
    width: min(100%, 1000px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid #dfe7ff;
    border-radius: 14px;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }

  .preview-toolbar strong {
    font-size: 1.1rem;
  }

  .paper-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(100%, 1000px);
    min-height: 540px;
    padding: 1rem;
    border-radius: 18px;
    background: linear-gradient(135deg, #f9fbff, #eef5ff);
    border: 1px solid #dfe7ff;
    box-shadow: 0 24px 60px rgba(76, 100, 175, 0.12);
  }

  svg {
    max-width: 100%;
    height: auto;
    background: white;
    box-shadow: inset 0 0 0 1px rgba(180, 191, 216, 0.5);
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .controls {
      border-right: none;
      border-bottom: 1px solid #d7dfef;
    }

    .preview-panel {
      padding-top: 1rem;
    }
  }
</style>
