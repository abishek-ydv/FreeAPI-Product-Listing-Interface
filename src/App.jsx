import { useState, useEffect, useMemo } from 'react';
import './index.css';

const API_URL = 'https://api.freeapi.app/api/v1/public/randomproducts';

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('products-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('products-theme', theme);
  }, [theme]);

  const fetchProducts = async (p) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}?page=${p}&limit=8`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch');
      setProducts(json.data.data);
      setTotalPages(json.data.totalPages);
      setTotalItems(json.data.totalItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(page); }, [page]);

  const categories = useMemo(() => {
    const s = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(s).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
      const matchCat = catFilter === 'all' || p.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          ShopWave
        </div>
        <div className="nav-right">
          <span className="nav-stats">{totalItems} products</span>
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
        </div>
      </nav>

      <div className="hero">
        <h1>Discover Premium Products</h1>
        <p>Browse our curated selection of products with real-time pricing, ratings, and availability.</p>
      </div>

      <div className="controls">
        <div className="controls-left">
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
            <input type="text" placeholder="Search products or brands..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="cat-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
        </div>
        <span className="section-title">Featured Products</span>
      </div>

      {isLoading && <div className="loading-container"><div className="spinner"></div><span>Loading products...</span></div>}

      {error && <div className="empty-state"><h2>Something went wrong</h2><p>{error}</p><button className="retry-btn" onClick={() => fetchProducts(page)}>Try Again</button></div>}

      {!isLoading && !error && (
        <>
          <div className="products-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} onSelect={() => setSelected(p)} />)}
            {filtered.length === 0 && <div className="empty-state"><h2>No products found</h2><p>Try adjusting your search or filter.</p></div>}
          </div>
          <div className="pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {pageNumbers.map(n => <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>)}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </>
      )}

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={i <= full ? 'star-filled' : 'star-empty'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      ))}
    </div>
  );
}

function ProductCard({ product, onSelect }) {
  const discounted = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);

  return (
    <div className="product-card" onClick={onSelect}>
      <div className="product-img-wrap">
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
        {product.discountPercentage > 0 && <span className="product-discount-badge">-{Math.round(product.discountPercentage)}%</span>}
        <span className={`product-stock-badge ${product.stock > 10 ? 'stock-in' : 'stock-low'}`}>
          {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
        </span>
      </div>
      <div className="product-content">
        <div className="product-category">{product.category}</div>
        <div className="product-title">{product.title}</div>
        <div className="product-brand">{product.brand}</div>
        <div className="product-rating">
          <Stars rating={product.rating} />
          <span className="rating-num">{product.rating}</span>
        </div>
        <div className="product-pricing">
          <span className="product-price">${discounted}</span>
          <span className="product-original-price">${product.price}</span>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = product.images || [product.thumbnail];
  const discounted = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-gallery">
          <img src={images[imgIdx]} alt={product.title} />
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
          {images.length > 1 && (
            <div className="modal-gallery-nav">
              {images.map((_, i) => <button key={i} className={`gallery-dot ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)} />)}
            </div>
          )}
        </div>
        <div className="modal-details">
          <span className="modal-category">{product.category}</span>
          <h2 className="modal-title">{product.title}</h2>
          <span className="modal-brand">{product.brand}</span>
          <p className="modal-desc">{product.description}</p>
          <div className="product-rating"><Stars rating={product.rating} /><span className="rating-num">{product.rating}</span></div>
          <div className="modal-pricing">
            <span className="modal-price">${discounted}</span>
            <span className="modal-original">${product.price}</span>
            <span className="modal-discount">-{Math.round(product.discountPercentage)}%</span>
          </div>
          <div className="modal-meta">
            <div className="modal-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <span>{product.stock} in stock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
