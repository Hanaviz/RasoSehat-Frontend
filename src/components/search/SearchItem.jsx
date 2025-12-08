import React from 'react';

export default function SearchItem({ item, query, onClick }) {
  if (!item) return null;
  const { type, name, description, image, rating } = item;
  return (
    <button onClick={() => onClick && onClick(item)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3">
      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-medium text-sm truncate">{name}</div>
          <div className="ml-auto text-xs text-gray-400">{type}</div>
        </div>
        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</div>
      </div>
    </button>
  );
}
