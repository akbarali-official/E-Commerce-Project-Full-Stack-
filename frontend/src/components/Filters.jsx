const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

export default function Filters({ meta, draft, setDraft, onApply, onClear }) {
  if (!meta) return <aside className="filters-panel">Loading...</aside>
  return (
    <aside className="filters-panel">
      <div className="filter-group">
        <h5>Filters 🔽</h5>
      </div>

      <div className="filter-group">
        {meta.categories.map((c) => (
          <label key={c}>
            <input type="checkbox" checked={draft.category.includes(c)} onChange={() => setDraft({ ...draft, category: toggle(draft.category, c) })} /> {c}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h5>Price <span>${draft.maxPrice}</span></h5>
        <input
          type="range"
          min="0"
          max={meta.maxPrice}
          step="10"
          value={draft.maxPrice}
          onChange={(e) => setDraft({ ...draft, maxPrice: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div className="filter-group">
        <h5>Colors</h5>
        <div className="color-swatches">
          {meta.colors.map((c) => (
            <span
              key={c}
              className={`swatch${draft.colors.includes(c) ? ' active' : ''}`}
              style={{ background: c }}
              onClick={() => setDraft({ ...draft, colors: toggle(draft.colors, c) })}
            />
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h5>Size</h5>
        <div className="size-pills">
          {meta.sizes.map((s) => (
            <span key={s} className={draft.sizes.includes(s) ? 'active' : ''} onClick={() => setDraft({ ...draft, sizes: toggle(draft.sizes, s) })}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="filter-group" style={{ borderBottom: 'none' }}>
        <h5>Dress Style</h5>
        {meta.styles.map((s) => (
          <label key={s}>
            <input type="checkbox" checked={draft.style.includes(s)} onChange={() => setDraft({ ...draft, style: toggle(draft.style, s) })} /> {s}
          </label>
        ))}
      </div>

      <button className="btn" style={{ width: '100%' }} onClick={onApply}>Apply Filter</button>
      <button className="btn btn-outline" style={{ width: '100%', marginTop: 10 }} onClick={onClear}>Clear All</button>
    </aside>
  )
}
