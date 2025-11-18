
/*
Rotation Part Inventory Web App
React + Tailwind single-file demo component (default export)

This file is adapted for Vite + React. The original demo included mock API functions.
Replace `api.*` helper functions with real SharePoint/Graph API calls or your backend endpoints.

*/
import React, { useEffect, useMemo, useState } from 'react';

// Mock API helpers: replace with real SharePoint/Graph/Backend calls
const mockInventory = [
  { id: 'RP-20251118-1a2b', itemCode: 'RP-20251118-1a2b', itemName: 'COMP-FTR-AC Compressor-24V', category: 'Penting', location: 'A-01-01', qty: 3, qtyOut: 1, status: 'Tersedia', barcodeUrl: 'https://barcode.tec-it.com/barcode.ashx?data=RP-20251118-1a2b&code=Code128' },
  { id: 'RP-20251118-3c4d', itemCode: 'RP-20251118-3c4d', itemName: 'GEAR-FVM-Gear PTO-Left', category: 'Penting', location: 'A-02-01', qty: 0, qtyOut: 2, status: 'Dipinjam', barcodeUrl: 'https://barcode.tec-it.com/barcode.ashx?data=RP-20251118-3c4d&code=Code128' },
  { id: 'RP-20251118-5e6f', itemCode: 'RP-20251118-5e6f', itemName: 'SHAFT-FRR-Propeller Shaft-Long', category: 'Consumable', location: 'B-01-03', qty: 12, qtyOut: 0, status: 'Tersedia', barcodeUrl: 'https://barcode.tec-it.com/barcode.ashx?data=RP-20251118-5e6f&code=Code128' }
]

const api = {
  fetchInventory: async () => {
    // simulate network
    await new Promise(r => setTimeout(r, 200));
    return mockInventory;
  },
  checkout: async ({ itemCode, qty, dealer }) => {
    await new Promise(r => setTimeout(r, 300));
    // simple simulation: find item and decrement
    const item = mockInventory.find(i => i.itemCode === itemCode);
    if (!item) throw new Error('Item tidak ditemukan');
    if (item.qty < qty) throw new Error('Stok tidak cukup');
    item.qty -= qty;
    item.qtyOut = (item.qtyOut || 0) + qty;
    item.status = item.qty === 0 ? 'Dipinjam' : 'Dipinjam';
    return { ok: true, item };
  },
  returnItem: async ({ itemCode, qty }) => {
    await new Promise(r => setTimeout(r, 200));
    const item = mockInventory.find(i => i.itemCode === itemCode);
    if (!item) throw new Error('Item tidak ditemukan');
    item.qty += qty;
    item.qtyOut = Math.max(0, (item.qtyOut || 0) - qty);
    item.status = item.qty > 0 ? 'Tersedia' : item.status;
    return { ok: true, item };
  },
  bulkAuditSync: async (rows) => {
    // rows: [{ ItemCode, ActualQty, Location }]
    await new Promise(r => setTimeout(r, 400));
    const log = [];
    for (const r of rows) {
      const it = mockInventory.find(m => m.itemCode === r.ItemCode);
      if (it) {
        log.push({ itemCode: r.ItemCode, old: it.qty, new: parseInt(r.ActualQty, 10) });
        it.qty = parseInt(r.ActualQty, 10);
        it.location = r.Location || it.location;
        it.status = it.qty > 0 ? 'Tersedia' : 'Kosong';
      } else {
        mockInventory.push({ id: r.ItemCode, itemCode: r.ItemCode, itemName: r.ItemCode, category: 'Unknown', location: r.Location || 'Unknown', qty: parseInt(r.ActualQty, 10) || 0, qtyOut: 0, status: 'Tersedia', barcodeUrl: 'https://barcode.tec-it.com/barcode.ashx?data=' + encodeURIComponent(r.ItemCode) + '&code=Code128' })
        log.push({ itemCode: r.ItemCode, old: null, new: parseInt(r.ActualQty, 10) });
      }
    }
    return log;
  }
}

// Simple small components
function Header({ onToggle }) {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md hover:bg-gray-100" onClick={onToggle} aria-label="toggle menu">☰</button>
        <h1 className="text-lg font-semibold">Rotation Part Inventory</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">galih galtia</div>
        <div className="w-8 h-8 rounded-full bg-gray-300" />
      </div>
    </header>
  )
}

function Sidebar({ active, setActive }) {
  return (
    <aside className={`bg-white border-r min-h-screen p-4 w-64 ${active ? '' : 'hidden lg:block'}`}>
      <nav className="flex flex-col gap-2">
        <a onClick={() => setActive('dashboard')} className="cursor-pointer p-2 rounded hover:bg-gray-50">Dashboard</a>
        <a onClick={() => setActive('inventory')} className="cursor-pointer p-2 rounded hover:bg-gray-50">Inventory</a>
        <a onClick={() => setActive('transactions')} className="cursor-pointer p-2 rounded hover:bg-gray-50">Transaksi</a>
        <a onClick={() => setActive('audit')} className="cursor-pointer p-2 rounded hover:bg-gray-50">Audit Upload</a>
        <a onClick={() => setActive('settings')} className="cursor-pointer p-2 rounded hover:bg-gray-50">Settings</a>
      </nav>
    </aside>
  )
}

function KPI({ title, value, subtitle }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
    </div>
  )
}

function InventoryTable({ items, onCheckout, onReturn, onPreviewBarcode }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => items.filter(i => (i.itemName + i.itemCode + (i.location||'')).toLowerCase().includes(q.toLowerCase())), [items, q]);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari item, kode, lokasi..." className="flex-1 p-2 border rounded" />
        <button className="px-3 py-2 bg-blue-600 text-white rounded">Export CSV</button>
      </div>

      <div className="bg-white rounded shadow-sm overflow-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Item Code</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Lokasi</th>
              <th className="p-3">Jumlah</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(it => (
              <tr key={it.itemCode} className="border-t">
                <td className="p-3 align-top">{it.itemCode}</td>
                <td className="p-3 align-top">{it.itemName}</td>
                <td className="p-3 align-top">{it.category}</td>
                <td className="p-3 align-top">{it.location}</td>
                <td className="p-3 align-top">{it.qty}</td>
                <td className="p-3 align-top">{it.status}</td>
                <td className="p-3 align-top space-x-2">
                  <button onClick={()=>onCheckout(it)} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Checkout</button>
                  <button onClick={()=>onReturn(it)} className="px-2 py-1 bg-yellow-500 text-white rounded text-sm">Return</button>
                  <button onClick={()=>onPreviewBarcode(it)} className="px-2 py-1 bg-gray-200 rounded text-sm">Barcode</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TransactionModal({ action, item, onClose, onSubmit }) {
  const [qty, setQty] = useState(1);
  const [dealer, setDealer] = useState('Dealer A');
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white p-4 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold">{action} — {item?.itemName}</h3>
        <div className="mt-3 space-y-2">
          <div>
            <label className="block text-sm text-gray-600">Qty</label>
            <input type="number" value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-full p-2 border rounded" />
          </div>
          {action === 'Checkout' && (
            <div>
              <label className="block text-sm text-gray-600">Dealer</label>
              <input value={dealer} onChange={e=>setDealer(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-3 py-2 rounded border">Batal</button>
            <button onClick={()=>onSubmit({ qty, dealer })} className="px-3 py-2 rounded bg-blue-600 text-white">Kirim</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BarcodePreview({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm text-center">
        <h3 className="font-semibold mb-3">Barcode — {item.itemCode}</h3>
        <img src={item.barcodeUrl} alt="barcode" className="mx-auto" />
        <div className="mt-3 text-sm text-gray-600">Klik kanan → Print untuk cetak label atau simpan gambar.</div>
        <div className="mt-4"><button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">Tutup</button></div>
      </div>
    </div>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [view, setView] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [barcodeItem, setBarcodeItem] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(()=>{ load(); }, []);
  async function load(){
    setLoading(true);
    try{
      const data = await api.fetchInventory();
      setItems(data);
    }catch(e){ setMessage({ type: 'error', text: e.message }) }
    setLoading(false);
  }

  const summary = useMemo(()=>{
    const total = items.length;
    const totalQty = items.reduce((s,i)=>s + (i.qty || 0),0);
    const onLoan = items.filter(i=>i.status === 'Dipinjam').length;
    const lowStock = items.filter(i=>i.qty <= 2).length;
    return { total, totalQty, onLoan, lowStock };
  },[items]);

  async function handleCheckout(item){
    setModal({ action: 'Checkout', item });
  }
  async function handleReturn(item){
    setModal({ action: 'Return', item });
  }
  async function submitTransaction({ qty, dealer }){
    const { action, item } = modal;
    setModal(null);
    setLoading(true);
    try{
      if (action === 'Checkout'){
        await api.checkout({ itemCode: item.itemCode, qty, dealer });
        setMessage({ type: 'success', text: 'Checkout berhasil' });
      } else {
        await api.returnItem({ itemCode: item.itemCode, qty });
        setMessage({ type: 'success', text: 'Return berhasil' });
      }
      await load();
    }catch(e){ setMessage({ type: 'error', text: e.message }) }
    setLoading(false);
  }

  function handlePreviewBarcode(item){ setBarcodeItem(item) }

  // Audit upload
  async function handleAuditFile(file){
    const text = await file.text();
    // parse CSV simple: assume header: ItemCode,ActualQty,Location
    const rows = text.trim().split('\\n').slice(1).map(r=>{
      const [ItemCode, ActualQty, Location] = r.split(',').map(x=>x.trim());
      return { ItemCode, ActualQty, Location };
    });
    setLoading(true);
    const log = await api.bulkAuditSync(rows);
    setLoading(false);
    setMessage({ type: 'success', text: `Audit sync selesai. ${log.length} baris diproses.` });
    await load();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="flex">
        <Sidebar active={menuOpen} setActive={(v)=>{ setView(v); if(window.innerWidth < 1024) setMenuOpen(false); }} />
        <div className="flex-1">
          <Header onToggle={()=>setMenuOpen(!menuOpen)} />
          <main className="p-6">
            {/* messages */}
            {message && (
              <div className={`p-3 rounded mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message.text}
                <button className="ml-4 text-xs underline" onClick={()=>setMessage(null)}>tutup</button>
              </div>
            )}

            {view === 'dashboard' && (
              <section className="space-y-4">
                <div className="flex gap-4">
                  <KPI title="Total Item" value={summary.total} />
                  <KPI title="Total Qty" value={summary.totalQty} />
                  <KPI title="On Loan" value={summary.onLoan} />
                  <KPI title="Low Stock (<=2)" value={summary.lowStock} />
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h2 className="font-semibold mb-2">Quick Actions</h2>
                  <div className="flex gap-2">
                    <button onClick={()=>setView('inventory')} className="px-3 py-2 rounded border">Open Inventory</button>
                    <label className="px-3 py-2 rounded bg-indigo-600 text-white cursor-pointer">
                      Upload Audit
                      <input type="file" accept=".csv" onChange={e=>{ if(e.target.files?.[0]) handleAuditFile(e.target.files[0]) }} className="hidden" />
                    </label>
                    <button onClick={async ()=>{ await load(); setMessage({ type: 'success', text: 'Data refreshed' }) }} className="px-3 py-2 rounded border">Refresh</button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                  <h3 className="font-semibold mb-2">Recently changed</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {items.slice(0,5).map(i=> <li key={i.itemCode}>{i.itemCode} — {i.itemName} — {i.qty} pcs</li>)}
                  </ul>
                </div>
              </section>
            )}

            {view === 'inventory' && (
              <section>
                <h2 className="font-semibold mb-4">Inventory</h2>
                {loading ? (<div>Loading...</div>) : (<InventoryTable items={items} onCheckout={handleCheckout} onReturn={handleReturn} onPreviewBarcode={handlePreviewBarcode} />)}
              </section>
            )}

            {view === 'transactions' && (
              <section>
                <h2 className="font-semibold mb-4">Transaksi</h2>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Transaksi realtime akan muncul di sini setelah integrasi dengan Power Automate.</p>
                </div>
              </section>
            )}

            {view === 'audit' && (
              <section>
                <h2 className="font-semibold mb-4">Audit Upload</h2>
                <div className="bg-white p-4 rounded shadow space-y-3">
                  <p className="text-sm text-gray-600">Upload CSV audit (header: ItemCode,ActualQty,Location). Setelah upload system akan sinkronkan jumlah fisik ke database.</p>
                  <label className="inline-block bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer">
                    Pilih CSV
                    <input type="file" accept=".csv" onChange={e=>{ if(e.target.files?.[0]) handleAuditFile(e.target.files[0]) }} className="hidden" />
                  </label>
                </div>
              </section>
            )}

            {view === 'settings' && (
              <section>
                <h2 className="font-semibold mb-4">Settings</h2>
                <div className="bg-white p-4 rounded shadow space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600">Standard nama format</label>
                    <input className="w-full p-2 border rounded" defaultValue="[Kategori]-[Model]-[PartName]-[Spec]" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Lokasi rak (contoh A-01-01)</label>
                    <textarea className="w-full p-2 border rounded" rows={4} defaultValue={'A-01-01\\nA-01-02\\nB-01-01'} />
                  </div>
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-green-600 text-white rounded">Simpan</button>
                  </div>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>

      {modal && <TransactionModal action={modal.action} item={modal.item} onClose={()=>setModal(null)} onSubmit={submitTransaction} />}
      {barcodeItem && <BarcodePreview item={barcodeItem} onClose={()=>setBarcodeItem(null)} />}

      {/* small footer */}
      <footer className="text-center text-xs text-gray-400 p-4">Rotation Part System — demo UI</footer>
    </div>
  )
}
