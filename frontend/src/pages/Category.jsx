import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import Newsletter from '../components/Newsletter'

const csv = (v) => (v ? v.split(',').filter(Boolean) : [])

export default function Category() {
  const [sp, setSp] = useSearchParams()
  const [meta, setMeta] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const applied = useMemo(
    () => ({
      category: csv(sp.get('category')),
      style: csv(sp.get('style')),
      colors: csv(sp.get('colors')),
      sizes: csv(sp.get('sizes')),
      maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : null,
    }),
    [sp],
  )
  const [draft, setDraft] = useState({ ...applied, maxPrice: applied.maxPrice || 500 })

  useEffect(() => {
    api('/products/meta').then(setMeta).catch(() => {})
  }, [])
  useEffect(() => {
    setDraft({ ...applied, maxPrice: applied.maxPrice || meta?.maxPrice || 500 })
  }, [applied, meta])

  const search = sp.get('search') || ''
  const sale = sp.get('sale') === '1'
  const sort = sp.get('sort') || 'popular'
  const page = Number(sp.get('page')) || 1

  useEffect(() => {
    setData(null)
    setError('')
    api('/products', {
      params: {
        search,
        sale: sale ? 1 : '',
        sort,
        page,
        limit: 9,
        category: applied.category,
        style: applied.style,
        colors: applied.colors,
        sizes: applied.sizes,
        maxPrice: applied.maxPrice,
      },
    })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [sp])

  const update = (patch) => {
    const next = new URLSearchParams(sp)
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v == null || (Array.isArray(v) && !v.length)) next.delete(k)
      else next.set(k, Array.isArray(v) ? v.join(',') : v)
    })
    setSp(next)
  }

  const apply = () => {
    update({
      category: draft.category,
      style: draft.style,
      colors: draft.colors,
      sizes: draft.sizes,
      maxPrice: meta && draft.maxPrice >= meta.maxPrice ? '' : draft.maxPrice,
      page: '',
    })
    setShowFilters(false)
  }
  const clear = () => {
    const next = new URLSearchParams()
    if (search) next.set('search', search)
    setSp(next)
    setShowFilters(false)
  }

  const title = search ? `Results for "${search}"` : sale ? 'On Sale' : applied.style.length === 1 ? applied.style[0] : sort === 'newest' ? 'New Arrivals' : 'All Products'

  return (
    <div className="container">
      <div className="breadcrumb"><Link to="/">Home</Link> &gt; {title}</div>
      <div className="category-layout">
        <div className={`filters-wrap ${showFilters ? 'open' : ''}`}>
          <Filters meta={meta} draft={draft} setDraft={setDraft} onApply={apply} onClear={clear} />
        </div>
        <div>
          <div className="category-header">
            <h2 style={{ fontSize: 28 }}>{title}</h2>
            <span className="muted">{data ? `Showing ${data.items.length} of ${data.total} Products` : ''}</span>
            <button className="btn btn-outline filters-toggle" onClick={() => setShowFilters(!showFilters)}>Filters</button>
            <select value={sort} onChange={(e) => update({ sort: e.target.value, page: '' })}>
              <option value="popular">Sort by: Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}
          {!data && !error && <p>Loading...</p>}
          {data && data.items.length === 0 && <p className="muted">Koi product nahi mila. Filters change karke dekho.</p>}
          {data && (
            <div className="product-grid">{data.items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}

          {data && data.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>← Previous</button>
              <span>Page {data.page} / {data.pages}</span>
              <button className="btn btn-outline" disabled={page >= data.pages} onClick={() => update({ page: page + 1 })}>Next →</button>
            </div>
          )}
        </div>
      </div>
      <Newsletter />
    </div>
  )
}
