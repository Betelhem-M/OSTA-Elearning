import { useEffect, useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import api from '@services/api';
import { Link } from 'react-router-dom';

const openPath = (item) => {
  if (item.content_type === 'course') return `/courses/${item.id}`;
  if (item.content_type === 'lesson') return `/learn/${item.id}`;
  if (item.content_type === 'event') return `/events`;
  return `/bookmarks`;
};

export default function Bookmarks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/features/bookmarks');
      setItems(r.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(item) {
    try {
      await api.delete('/features/bookmarks', { data: { contentType: item.content_type, contentId: item.id } });
      setItems(v => v.filter(x => x.bookmark_id !== item.bookmark_id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove bookmark.');
    }
  }

  return <section>
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-black text-ink dark:text-white">Bookmarks</h1>
        <p className="mt-1 text-sm text-slate-500">Your saved courses, lessons, events and learning resources.</p>
      </div>
    </div>
    {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
    {loading ? <div className="py-12 text-center text-slate-500">Loading...</div> : items.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500"><Bookmark className="mx-auto mb-3"/><p>No bookmarked content yet.</p></div> : <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map(item => <article key={item.bookmark_id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <span className="text-xs font-bold uppercase text-primary">{item.content_type}</span>
      <h2 className="mt-2 font-bold text-ink dark:text-white">{item.title}</h2>
      <p className="mt-2 line-clamp-3 text-sm text-slate-500">{item.description || 'No description available.'}</p>
      <div className="mt-4 flex items-center justify-between">
        <Link to={openPath(item)} className="text-sm font-bold text-primary">Open →</Link>
        <button onClick={() => remove(item)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label="Remove bookmark"><Trash2 size={17}/></button>
      </div>
    </article>)}</div>}
  </section>;
}
