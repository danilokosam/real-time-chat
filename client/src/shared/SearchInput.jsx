import { useState } from "react";

export const SearchInput = () => {
    // Save state search
    const [search, setSearch] = useState('')
  return (
    <>
      <input
        className="bg-white text-xs rounded-xl p-2 border-2 border-gray-chat-response focus:border-violet-primary focus:outline-none"
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}

      />
      
    </>
  );
};
