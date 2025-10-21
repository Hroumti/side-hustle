import React from "react";
import { useParams } from "react-router-dom";
import "./styles/cours.css";
// Data shape expected from /cours/index.json
// [
//   {
//     "name": "Marketing - 3éme année.pdf",
//     "url": "/cours/marketing-3eme.pdf",
//     "size": 1234567,
//     "uploadedAt": "2025-10-18T12:34:00Z",
//     "year": "3eme" | "4eme" | "5eme"
//   },
//   ...
// ]

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size < 10 && unitIndex > 0 ? 1 : 0)} ${
    units[unitIndex]
  }`;
}

function getExtensionFromUrl(url) {
  const match = /\.([a-zA-Z0-9]+)(?:\?|#|$)/.exec(url || "");
  return match ? match[1].toLowerCase() : "";
}

const Cours = () => {
  const { year } = useParams(); // optional: 3eme | 4eme | 5eme
  const [allFiles, setAllFiles] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [ext, setExt] = React.useState("all"); // all | pdf | ppt
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;
    async function loadIndex() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/cours/index.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        if (!Array.isArray(raw)) throw new Error("Index JSON must be an array");
        const normalized = raw.map((f) => {
          const extension = (f.ext || getExtensionFromUrl(f.url)).toLowerCase();
          return {
            name: f.name || f.url?.split("/").pop() || "Fichier",
            url: f.url,
            size: Number.isFinite(f.size) ? f.size : undefined,
            uploadedAt: f.uploadedAt || null,
            year: (f.year || "").toLowerCase(),
            ext: extension,
          };
        });
        if (isMounted) setAllFiles(normalized);
      } catch (e) {
        if (isMounted) setError("Impossible de charger la liste des cours.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadIndex();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const targetYear = (year || "").toLowerCase();
    return allFiles.filter((f) => {
      if (targetYear && f.year !== targetYear) return false;
      if (ext !== "all" && f.ext !== ext) return false;
      if (query && !f.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [allFiles, year, ext, query]);

  function handlePreview(file) {
    // Let the browser handle preview; PDFs usually open in a new tab.
    window.open(file.url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="cours-container">
      <header className="cours-header">
        <h1 className="cours-title">Cours</h1>
        <div className="cours-controls">
          <input
            className="cours-search"
            type="search"
            placeholder="Rechercher un fichier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="cours-filter"
            value={ext}
            onChange={(e) => setExt(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="pdf">PDF</option>
            <option value="ppt">PPT</option>
          </select>
        </div>
      </header>

      {loading && <div className="cours-status">Chargement...</div>}
      {!loading && error && <div className="cours-status error">{error}</div>}

      {!loading && !error && (
        <div className="cours-grid">
          {filtered.map((file, idx) => {
            const dateStr = file.uploadedAt
              ? new Date(file.uploadedAt).toLocaleDateString()
              : "—";
            const sizeStr = file.size ? formatBytes(file.size) : "—";
            return (
              <article key={`${file.url}-${idx}`} className="cours-card">
                <div className="cours-card-header">
                  <div className="cours-file-name">{file.name}</div>
                  <div className={`badge ext-${file.ext}`}>
                    {file.ext?.toUpperCase()}
                  </div>
                </div>
                <div className="cours-card-meta">
                  <span>Année: {file.year?.toUpperCase() || "—"}</span>
                  <span>Ajouté: {dateStr}</span>
                  <span>Taille: {sizeStr}</span>
                </div>
                <div className="cours-card-actions">
                  <button
                    className="btn btn-preview"
                    onClick={() => handlePreview(file)}
                  >
                    Aperçu
                  </button>
                  <a className="btn btn-download" href={file.url} download>
                    Télécharger
                  </a>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="cours-status">Aucun fichier trouvé.</div>
          )}
        </div>
      )}
    </section>
  );
};

export default Cours;
