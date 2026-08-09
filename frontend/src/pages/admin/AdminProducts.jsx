// Products tab: dense table with inline per-size stock edit, drag-handle
// reordering, add/edit form with image upload, deactivate. Prices are entered
// in ₪ and stored as integer agorot.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BRAND } from '@client/config';
import { adminFetch, uploadImage } from './adminApi.js';

const toPayload = (p) => ({
  name: p.name,
  priceAgorot: p.priceAgorot,
  category: p.category,
  dropId: p.dropId || null,
  family: p.family || null,
  cut: p.cut || null,
  sizeLabel: p.sizeLabel || null,
  description: p.description || null,
  images: p.images || [],
  active: p.active,
  variants: p.variants.map((v) => ({ size: v.size, stock: v.stock })),
});

function ProductForm({ initial, onSave, onCancel }) {
  const [values, setValues] = useState(() => ({
    name: initial?.name || '',
    price: initial ? String(initial.priceAgorot / 100) : '',
    category: initial?.category || '',
    dropId: initial?.dropId || '',
    family: initial?.family || '',
    cut: initial?.cut || '',
    sizeLabel: initial?.sizeLabel || '',
    description: initial?.description || '',
    images: (initial?.images || []).join('\n'),
    active: initial ? initial.active : true,
    variants: initial?.variants?.map((v) => ({ size: v.size, stock: v.stock })) || [{ size: '', stock: 10 }],
  }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k) => (e) =>
    setValues((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setVariant = (i, k, val) =>
    setValues((v) => ({ ...v, variants: v.variants.map((row, j) => (j === i ? { ...row, [k]: val } : row)) }));

  // Uploads go one at a time; each returned URL becomes a line in the same
  // textarea pasted URLs live in, so the save path needs no new code.
  const onPickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-picking the same file
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const { url } = await uploadImage(file);
        setValues((v) => ({ ...v, images: v.images.trim() ? `${v.images.trimEnd()}\n${url}` : url }));
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const submit = async () => {
    const price = Number(values.price);
    const variants = values.variants
      .filter((v) => v.size.trim())
      .map((v) => ({ size: v.size.trim(), stock: Math.max(0, Number(v.stock) || 0) }));
    if (!values.name.trim() || !values.category.trim()) { setError('Name and category are required.'); return; }
    if (!Number.isFinite(price) || price < 0) { setError('Price must be a number.'); return; }
    if (!variants.length) { setError('At least one size is required.'); return; }
    setBusy(true);
    setError('');
    try {
      await onSave({
        name: values.name.trim(),
        priceAgorot: Math.round(price * 100),
        category: values.category.trim(),
        dropId: values.dropId.trim() || null,
        family: values.family.trim() || null,
        cut: values.cut.trim() || null,
        sizeLabel: values.sizeLabel.trim() || null,
        description: values.description.trim() || null,
        images: values.images.split('\n').map((s) => s.trim()).filter(Boolean),
        active: values.active,
        variants,
      });
    } catch (err) {
      setError(err.message || 'Save failed');
      setBusy(false);
    }
  };

  return (
    <div className="admin-form" role="group" aria-label={initial ? 'Edit product' : 'Add product'}>
      <h2 className="admin-h2">{initial ? `Edit: ${initial.name}` : 'Add product'}</h2>
      <div className="form-2col">
        <div className="field"><label htmlFor="ap-name">Name*</label>
          <input id="ap-name" value={values.name} onChange={set('name')} /></div>
        <div className="field"><label htmlFor="ap-price">Price ({BRAND.currency})*</label>
          <input id="ap-price" type="number" min="0" step="0.01" value={values.price} onChange={set('price')} /></div>
        <div className="field"><label htmlFor="ap-cat">Category*</label>
          <input id="ap-cat" value={values.category} onChange={set('category')} /></div>
        <div className="field"><label htmlFor="ap-drop">Drop</label>
          <input id="ap-drop" value={values.dropId} onChange={set('dropId')} /></div>
        <div className="field"><label htmlFor="ap-family">Family</label>
          <input id="ap-family" value={values.family} onChange={set('family')} /></div>
        <div className="field"><label htmlFor="ap-cut">Cut</label>
          <input id="ap-cut" value={values.cut} onChange={set('cut')} /></div>
        <div className="field"><label htmlFor="ap-sizelabel">Size label</label>
          <input id="ap-sizelabel" value={values.sizeLabel} onChange={set('sizeLabel')} placeholder="e.g. Top Size" /></div>
      </div>
      <div className="field"><label htmlFor="ap-desc">Description</label>
        <textarea id="ap-desc" rows="3" value={values.description} onChange={set('description')} /></div>
      <div className="field"><label htmlFor="ap-imgs">Image URLs (one per line)</label>
        <textarea id="ap-imgs" rows="3" value={values.images} onChange={set('images')} /></div>
      <div className="field">
        <label htmlFor="ap-upload">{uploading ? 'Uploading…' : 'Upload images'}</label>
        <input id="ap-upload" type="file" multiple disabled={uploading}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={onPickFiles} />
      </div>
      {values.images.trim() && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {values.images.split('\n').map((s) => s.trim()).filter(Boolean).map((url, i) => (
            <img key={`${url}-${i}`} src={url} alt=""
              style={{ width: 56, height: 56, objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ))}
        </div>
      )}

      <p className="microlabel" style={{ marginTop: 16 }}>Sizes &amp; stock</p>
      {values.variants.map((v, i) => (
        <div className="admin-variant-row" key={i}>
          <input aria-label={`Size ${i + 1}`} placeholder="Size" value={v.size}
            onChange={(e) => setVariant(i, 'size', e.target.value)} />
          <input aria-label={`Stock for size ${i + 1}`} type="number" min="0" value={v.stock}
            onChange={(e) => setVariant(i, 'stock', e.target.value)} />
          <button className="quiet" style={{ textDecoration: 'underline' }}
            onClick={() => setValues((val) => ({ ...val, variants: val.variants.filter((_, j) => j !== i) }))}>
            Remove
          </button>
        </div>
      ))}
      <button className="quiet" style={{ textDecoration: 'underline' }}
        onClick={() => setValues((v) => ({ ...v, variants: [...v.variants, { size: '', stock: 10 }] }))}>
        + Add size
      </button>

      <label className="checkline" htmlFor="ap-active" style={{ marginTop: 12 }}>
        <input id="ap-active" type="checkbox" checked={values.active} onChange={set('active')} />
        Active (visible in the storefront)
      </label>

      {error && <p className="err" role="alert">{error}</p>}
      <div className="admin-actions">
        <button className="btn btn-commerce" style={{ width: 'auto' }} disabled={busy} onClick={submit}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function AdminProducts({ onAuthError }) {
  const [products, setProducts] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [error, setError] = useState('');
  // Drag-reorder state. Only the handle cell is draggable — rows hold live
  // stock inputs. HTML5 DnD doesn't fire on touch; admin is desktop-first.
  const [dragIndex, setDragIndex] = useState(null);
  const dragStartIds = useRef(null);
  const productsRef = useRef(null);
  productsRef.current = products;

  const load = useCallback(async () => {
    try {
      setProducts(await adminFetch('/api/admin/products'));
      setError('');
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Failed to load products');
    }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  const save = async (payload, id) => {
    if (id) await adminFetch(`/api/admin/products/${id}`, { method: 'PUT', body: payload });
    else await adminFetch('/api/admin/products', { method: 'POST', body: payload });
    setEditing(null);
    await load();
  };

  const saveStock = async (product, size, stock) => {
    const next = toPayload(product);
    next.variants = next.variants.map((v) => (v.size === size ? { ...v, stock } : v));
    try {
      await adminFetch(`/api/admin/products/${product.id}`, { method: 'PUT', body: next });
      await load();
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Stock update failed');
    }
  };

  const startDrag = (i) => (e) => {
    setDragIndex(i);
    dragStartIds.current = productsRef.current.map((p) => p.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Firefox won't start a drag without data
  };

  // Live reorder while hovering: splice the dragged row to the hovered index.
  const dragOverRow = (i) => (e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    setProducts((list) => {
      const next = [...list];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(i);
  };

  // dragend fires on the source even for cancelled drops — persist the order
  // the table currently shows (optimistic), roll back to server truth on error.
  const endDrag = async () => {
    setDragIndex(null);
    const list = productsRef.current || [];
    const ids = list.map((p) => Number(p.id));
    if (!dragStartIds.current || ids.join() === dragStartIds.current.join()) return;
    dragStartIds.current = null;
    try {
      await adminFetch('/api/admin/products/reorder', { method: 'PUT', body: { ids } });
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Reorder failed');
      await load();
    }
  };

  const deactivate = async (product) => {
    try {
      await adminFetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      if (err.status === 401) return onAuthError();
      setError(err.message || 'Deactivate failed');
    }
  };

  if (error && !products) return <p className="err" role="alert">{error}</p>;
  if (!products) return <p>Loading…</p>;

  return (
    <div>
      {error && <p className="err" role="alert">{error}</p>}
      {editing ? (
        <ProductForm
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSave={(payload) => save(payload, editing === 'new' ? null : editing.id).catch((err) => {
            if (err.status === 401) return onAuthError();
            throw err;
          })}
        />
      ) : (
        <>
          <div className="admin-actions">
            <button className="btn" onClick={() => setEditing('new')}>+ Add product</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th aria-label="Reorder"></th><th>Name</th><th>Category</th><th>Price</th><th>Stock per size</th><th>Active</th><th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={p.active ? '' : 'inactive'}
                    onDragOver={dragOverRow(i)}>
                    <td
                      draggable
                      onDragStart={startDrag(i)}
                      onDragEnd={endDrag}
                      title="Drag to reorder"
                      aria-label={`Drag to reorder ${p.name}`}
                      style={{ cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
                    >⠿</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{BRAND.currency}{(p.priceAgorot / 100).toFixed(2)}</td>
                    <td>
                      <div className="admin-stock">
                        {p.variants.map((v) => (
                          <label key={v.size} className="admin-stock-cell">
                            <span>{v.size}</span>
                            <input
                              type="number" min="0" defaultValue={v.stock}
                              aria-label={`${p.name} stock for ${v.size}`}
                              onBlur={(e) => {
                                const stock = Math.max(0, Number(e.target.value) || 0);
                                if (stock !== v.stock) saveStock(p, v.size, stock);
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </td>
                    <td>{p.active ? 'yes' : 'no'}</td>
                    <td>
                      <div className="admin-actions" style={{ marginTop: 0 }}>
                        <button className="quiet" style={{ textDecoration: 'underline' }} onClick={() => setEditing(p)}>Edit</button>
                        {p.active && (
                          <button className="quiet" style={{ textDecoration: 'underline' }} onClick={() => deactivate(p)}>Deactivate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
