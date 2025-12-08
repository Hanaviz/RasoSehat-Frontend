import React from 'react';
import SearchItem from './SearchItem';

export default function SearchSection({ title, items = [], onItemClick }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="py-2">
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{title}</div>
      <div className="divide-y border-t border-b border-gray-100 bg-white rounded-xl overflow-hidden">
        {items.map(it => <SearchItem key={`${it.type}-${it.id}`} item={it} onClick={onItemClick} />)}
      </div>
    </div>
  );
}
