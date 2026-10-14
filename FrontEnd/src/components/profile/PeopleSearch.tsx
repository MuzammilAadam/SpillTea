import React, { useEffect, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { PeopleSearchResult } from '../../types';
import { profileApi } from '../../api/profile';

interface PeopleSearchProps {
  initialQuery?: string;
  isAuthenticated: boolean;
  onOpenProfile: (pseudonym: string) => void;
  onRefreshUser: () => Promise<void>;
  onToast: (message: string) => void;
}

export const PeopleSearch: React.FC<PeopleSearchProps> = ({ initialQuery = '', isAuthenticated, onOpenProfile, onRefreshUser, onToast }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PeopleSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) { setResults([]); setError(null); setHasMore(false); return; }
    const timer = window.setTimeout(async () => {
      setLoading(true); setError(null); setPage(0);
      try {
        const response = await profileApi.searchPeople(trimmed);
        setResults(response.content); setHasMore(response.number + 1 < response.totalPages);
      } catch { setError('People search is resting for a moment. Please try again.'); }
      finally { setLoading(false); }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const response = await profileApi.searchPeople(query, page + 1);
      setResults((current) => [...current, ...response.content]); setPage(page + 1); setHasMore(page + 2 < response.totalPages);
    } catch { setError('More people could not be gathered just now.'); }
    finally { setLoading(false); }
  };

  const toggleFollow = async (person: PeopleSearchResult) => {
    if (!isAuthenticated) { onToast('Sign in to find your kindred.'); return; }
    setBusyId(person.id);
    try {
      const stats = person.following ? await profileApi.unfollow(person.id) : await profileApi.follow(person.id);
      setResults((current) => current.map((item) => item.id === person.id ? { ...item, following: !person.following, kindredCount: stats.kindredCount } : item));
      await onRefreshUser();
      onToast(person.following ? 'You gently stepped away from this corner.' : 'You found your way to this little corner.');
    } catch (requestError: any) { onToast(requestError?.message || 'This connection could not be changed just now.'); }
    finally { setBusyId(null); }
  };

  return (
    <section className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] shadow-xs">
      <div className="flex items-center gap-2 mb-3"><UserRound className="w-4 h-4 text-[#B98289]" /><h2 className="font-editorial text-xl font-bold text-[#44352F]">Find kindred souls</h2></div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B98289]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a display name or pen name…" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9D9C9] bg-white text-sm focus:outline-none focus:border-[#B98289]" /></div>
      {loading && <p className="mt-4 text-xs font-serif text-[#666747]">Looking through the sanctuary…</p>}
      {error && <p className="mt-4 text-xs font-serif text-[#B98289]">{error}</p>}
      {!loading && !error && query.trim().length >= 2 && results.length === 0 && <p className="mt-4 text-sm font-serif text-[#666747]">No kindred found just yet. Try another name.</p>}
      <div className="mt-3 space-y-2">
        {results.map((person) => (
          <div key={person.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#E9D9C9]/70 bg-[#FFF8F0]/50">
            <button onClick={() => onOpenProfile(person.pseudonym)} className="shrink-0"><img src={person.avatar || '/favicon.svg'} alt={person.displayName} className="w-11 h-11 rounded-full object-cover border border-[#D8A0A5]" /></button>
            <button onClick={() => onOpenProfile(person.pseudonym)} className="min-w-0 flex-1 text-left"><p className="font-serif font-semibold text-[#44352F] truncate">{person.displayName}</p><p className="text-xs text-[#B98289] truncate">@{person.pseudonym} · {person.kindredCount} Kindred</p><p className="text-xs text-[#666747] truncate">{person.bio || 'A quiet soul in the sanctuary.'}</p></button>
            <button onClick={() => toggleFollow(person)} disabled={busyId === person.id} className={`px-3 py-1.5 rounded-full text-xs font-serif disabled:opacity-60 ${person.following ? 'bg-[#B7B99A] text-[#44352F]' : 'bg-[#B98289] text-white'}`}>{person.following ? 'Following' : 'Follow'}</button>
          </div>
        ))}
      </div>
      {hasMore && !loading && <button onClick={loadMore} className="mt-4 w-full py-2 rounded-xl border border-[#E9D9C9] text-xs font-serif text-[#B98289] hover:bg-[#F7DDE1]">Load more</button>}
    </section>
  );
};
