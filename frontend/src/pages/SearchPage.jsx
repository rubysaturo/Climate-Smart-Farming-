import { useState } from "react";
import { search } from "@/services/api";
import Loader from "@/components/Loader";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await search.query(query);
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Search</h1>
        <p className="page-subtitle">Search agricultural knowledge base</p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <label htmlFor="search-input" className="sr-only">Search</label>
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for crops, pests, soil tips..."
          className="search-input"
          aria-label="Search agricultural knowledge base"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && <Loader text="Searching..." />}

      {results !== null && !loading && (
        <div className="search-results">
          <p className="result-count">{results.length} result(s) found</p>
          {results.map((r, i) => (
            <article key={r.id || r.title || i} className="card search-result-card">
              <div className="result-header">
                <span className="result-category">{r.category}</span>
                <h3>{r.title}</h3>
              </div>
              <p className="result-source">Source: {r.source}</p>
              <p className="result-snippet">{r.snippet}</p>
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="result-link">
                  Read more →
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
