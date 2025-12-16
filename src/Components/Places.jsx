import { useState, useEffect, useMemo, useCallback } from "react";

/* =========================
   Utility
========================= */
const processFiles = (files) => {
  const readers = Array.from(files).map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      })
  );
  return Promise.all(readers);
};

const PhotoPlaceholder = () => (
  <div className="w-28 h-28 rounded-xl bg-gray-100 flex items-center justify-center text-sky-400 text-3xl border-2 border-dashed border-sky-300/50">
    📸
  </div>
);

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/* =========================
   Stats Dashboard
========================= */
const StatsDashboard = ({ locations }) => {
  const total = locations.length;
  const visited = locations.filter((l) => l.isVisited).length;
  const completion = total ? ((visited / total) * 100).toFixed(1) : 0;
  const tags = new Set(locations.flatMap((l) => l.tags || [])).size;

  const stats = [
    { label: "Total Places", value: total, icon: "🌍" },
    { label: "Visited", value: visited, icon: "✅" },
    { label: "To Go", value: total - visited, icon: "✈️" },
    { label: "Completion", value: `${completion}%`, icon: "📈" },
    { label: "Tags", value: tags, icon: "🏷️" },
  ];

  return (
    <div className="bg-white/80 rounded-xl p-4 shadow-xl max-w-4xl w-full mb-6">
      <h3 className="text-xl font-bold text-sky-700 mb-3">Travel Snapshot</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        {stats.map((s, i) => (
          <div key={i} className="bg-sky-50 rounded-lg p-2">
            <p className="text-2xl font-bold text-sky-800">{s.value}</p>
            <p className="text-xs text-gray-600">
              {s.icon} {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================
   Add Place Form Component
========================= */
const AddPlaceForm = ({ onAddPlace }) => {
  const [locationInput, setLocationInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [photos, setPhotos] = useState([]);

  const handleAddTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback(
    (t) => setTags((p) => p.filter((x) => x !== t)),
    []
  );

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const base64Photos = await processFiles(files);
      setPhotos(base64Photos);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    onAddPlace({ name: locationInput, tags, photos });

    // Reset form states
    setLocationInput("");
    setTags([]);
    setTagInput("");
    setPhotos([]);
  };

  return (
    <div className="bg-white/90 rounded-xl p-4 shadow-lg w-full max-w-4xl mb-8">
      <h2 className="text-xl font-bold mb-3 text-gray-800">Add New Place</h2>
      <form onSubmit={handleSubmit}>
        {/* Location Input */}
        <input
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Any place (city, cafe, country, mall...)"
          className="w-full px-3 py-2 mb-3 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          required
        />

        {/* Tag Display */}
        <div className="flex gap-2 mb-2 flex-wrap min-h-[30px]">
          {tags.map((t) => (
            <span
              key={t}
              className="bg-sky-200/70 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-sky-300 transition"
              onClick={() => handleRemoveTag(t)}
            >
              {t} ✕
            </span>
          ))}
        </div>

        {/* Tag Input */}
        <div className="flex gap-2 mb-3">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag"
            className="flex-1 px-3 py-1 rounded-lg border border-gray-300 focus:border-sky-500"
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
          >
            Add Tag
          </button>
        </div>
        
        {/* Photo Input */}
        <label className="block mb-4">
          <span className="text-sm text-gray-600">Upload Photos (Optional):</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-sky-400/50 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 mt-1"
          />
        </label>
        {photos.length > 0 && (
          <div className="flex gap-2 mb-4">
            {photos.slice(0, 3).map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Preview ${index + 1}`}
                className="w-16 h-16 object-cover rounded-md border"
              />
            ))}
            {photos.length > 3 && (
              <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-xs">
                +{photos.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition w-full"
        >
          Add Place
        </button>
      </form>
    </div>
  );
};

/* =========================
   Place Card Component
========================= */
const PlaceCard = ({ place, markVisited, deletePlace }) => {
  const isVisited = place.isVisited;
  const displayPhotos = isVisited ? place.visitedPhotos : place.photos;

  return (
    <div
      key={place.id}
      className={`p-4 rounded-xl w-72 shadow-lg transition duration-300 hover:shadow-xl ${
        isVisited ? "bg-green-50" : "bg-white"
      }`}
    >
      {/* Photo Display */}
      {displayPhotos && displayPhotos.length > 0 ? (
        <img
          src={displayPhotos[0]}
          alt={place.name}
          className="w-full h-40 object-cover rounded-xl mb-3"
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center rounded-xl mb-3">
          <PhotoPlaceholder />
        </div>
      )}

      <h3 className="font-bold mt-2 text-xl text-sky-900 truncate">{place.name}</h3>

      {!isVisited ? (
        <>
          {/* Tags */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {place.tags.map((t) => (
              <span
                key={t}
                className="bg-sky-200/70 px-2 py-1 rounded-full text-xs text-sky-800"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => markVisited(place.id)}
              className="flex-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              Mark Visited
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600 mt-2">
          Visited: {formatDate(place.visitedDate)}
        </p>
      )}

      <button
        onClick={() => deletePlace(place.id)}
        className="mt-3 bg-red-500 text-white w-full px-3 py-1 rounded hover:bg-red-600 transition"
      >
        Delete
      </button>
    </div>
  );
};

/* =========================
   Place List Component (Reusable)
========================= */
const PlaceList = ({ title, places, markVisited, deletePlace, emptyMessage, isVisitedList, sortControl }) => (
  <>
    <h2 className="text-2xl font-bold mt-8 mb-4 text-sky-800 w-full max-w-4xl">
      {title} ({places.length})
    </h2>
    
    {isVisitedList && sortControl}
    
    <div className="flex flex-wrap gap-6 justify-center w-full max-w-6xl">
      {places.map((p) => (
        <PlaceCard
          key={p.id}
          place={p}
          markVisited={markVisited}
          deletePlace={deletePlace}
        />
      ))}
      {places.length === 0 && (
        <p className="text-gray-600 p-4">{emptyMessage}</p>
      )}
    </div>
  </>
);


/* =========================
   MAIN COMPONENT
========================= */
const Places = () => {
  const [locations, setLocations] = useState(() => {
    try {
      const saved = localStorage.getItem("locations");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Could not load locations from local storage:", e);
      return [];
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterMode, setFilterMode] = useState("all"); // 'all', 'toGo', 'visited'

  /* ---------- Persist ---------- */
  useEffect(() => {
    try {
      localStorage.setItem("locations", JSON.stringify(locations));
    } catch (e) {
      console.error("Could not save locations to local storage:", e);
    }
  }, [locations]);

  /* ---------- Handlers ---------- */
  const handleAddPlace = useCallback(
    ({ name, tags, photos }) => {
      setLocations((prev) => [
        {
          id: Date.now(),
          name,
          tags,
          photos,
          isVisited: false,
          visitedPhotos: [],
          visitedDate: null, 
          createdAt: Date.now(),
        },
        ...prev, // New places appear at the top
      ]);
      setFilterMode("toGo"); // Switch to 'To Go' after adding a place
    },
    []
  );

  const markVisited = useCallback((id) => {
    setLocations((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              isVisited: true,
              visitedPhotos: l.photos, 
              visitedDate: Date.now(), 
              photos: [], 
            }
          : l
      )
    );
    setFilterMode("visited"); // Switch to 'Visited' after marking
  }, []);

  const deletePlace = useCallback((id) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }, []);

  /* ---------- Filtering & Sorting ---------- */
  const { filteredLocations, toGo, visited } = useMemo(() => {
    const term = searchTerm.toLowerCase();

    // 1. Apply Search Filter
    let filtered = locations.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        (l.tags || []).some((t) => t.toLowerCase().includes(term))
    );

    // 2. Separate Lists
    const toGoList = filtered.filter((l) => !l.isVisited);
    
    const visitedList = filtered
      .filter((l) => l.isVisited)
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.visitedDate - a.visitedDate
          : a.visitedDate - b.visitedDate
      );

    // 3. Apply Tab Filter (to the combined list for "All")
    let finalFiltered = [];
    if (filterMode === "toGo") {
      finalFiltered = toGoList;
    } else if (filterMode === "visited") {
      finalFiltered = visitedList;
    } else {
      // 'all' mode: Show To Go first, then Visited (sorted)
      finalFiltered = [...toGoList, ...visitedList];
    }

    return { filteredLocations: finalFiltered, toGo: toGoList, visited: visitedList };
  }, [locations, searchTerm, sortOrder, filterMode]);

  const searchEmptyMessage = searchTerm ? "No places match your search query." : "No places to display.";

  // Sort control for the Visited List
  const VisitedSortControl = (
    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
      className="mb-6 px-3 py-1 rounded shadow-md border border-gray-300 w-full max-w-4xl"
    >
      <option value="newest">Newest Visit First</option>
      <option value="oldest">Oldest Visit First</option>
    </select>
  );

  /* =========================
     UI
  ========================= */
  return (
    // FIX APPLIED: Added id="scroll-explore-helper" to link with Homepage button
    <div 
      id="scroll-explore-helper" 
      className="min-h-screen bg-gradient-to-r from-sky-200 to-blue-400 p-6 flex flex-col items-center"
    >
      <h1 className="text-4xl font-bold text-sky-900 mb-6">
        📍 Explore Your Places
      </h1>

      <StatsDashboard locations={locations} />

      {/* Search Input */}
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="🔍 Search by name or tag..."
        className="mb-6 px-4 py-2 rounded-xl w-full max-w-4xl shadow-md border border-gray-300 focus:border-blue-500"
      />
      
      {/* Add Place */}
      <AddPlaceForm onAddPlace={handleAddPlace} />
      
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 w-full max-w-4xl justify-center">
        {[
          { label: `All (${locations.length})`, key: 'all' },
          { label: `To Go (${toGo.length})`, key: 'toGo' },
          { label: `Visited (${visited.length})`, key: 'visited' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterMode(tab.key)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              filterMode === tab.key
                ? "bg-sky-700 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-sky-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* Main List Rendering */}
      {filterMode === "all" && (
        <PlaceList
          title="All Places"
          places={filteredLocations}
          markVisited={markVisited}
          deletePlace={deletePlace}
          emptyMessage={searchEmptyMessage}
        />
      )}

      {filterMode === "toGo" && (
        <PlaceList
          title="✈️ Places To Go"
          places={toGo}
          markVisited={markVisited}
          deletePlace={deletePlace}
          emptyMessage={searchEmptyMessage}
        />
      )}

      {filterMode === "visited" && (
        <PlaceList
          title="✅ Travel History"
          places={visited}
          markVisited={markVisited}
          deletePlace={deletePlace}
          isVisitedList={true}
          sortControl={VisitedSortControl}
          emptyMessage={searchEmptyMessage}
        />
      )}
    </div>
  );
};

export default Places;