import { useState, type FormEvent } from 'react';
import { useTickets } from '../../store/useTickets';
import { PlusCircleIcon } from '../common/Icons';

export function Composer() {
  const { quickCreateIssue, loading } = useTickets();
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    const result = await quickCreateIssue(title);
    if (result) {
      setTitle('');
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit} data-brief-id="composer-issue">
      <PlusCircleIcon size={18} />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add issue title, press enter to create…"
        disabled={loading}
        aria-label="New issue quick title"
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !title.trim()}
      >
        {loading ? 'Creating…' : 'Create'}
      </button>
    </form>
  );
}
