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

// IMPROVED: Adjusted placeholder styling to fit new UI theme
const PhotoPlaceholder = () => (
  <div className="w-full h-40 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 text-5xl border border-dashed border-sky-300/60 shadow-inner">
    🗺️
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
   Stats Dashboard (BLENDED UI)
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
    { label: "Unique Tags", value: tags, icon: "🏷️" },
  ];

  return (
    // UPDATED: Changed from bg-white/90 to bg-sky-50/70 for blending effect
    <div className="bg-sky-50/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-5xl w-full mb-8 border border-white/50">
      <h3 className="text-2xl font-extrabold text-sky-800 mb-5 border-b pb-2 border-sky-100">
        🧭 Travel Snapshot
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        {stats.map((s, i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl p-3 shadow-md transition duration-200 hover:bg-sky-100 hover:scale-[1.03] cursor-default border border-sky-100" 
          >
            <p className="text-3xl font-extrabold text-sky-700">{s.value}</p>
            <p className="text-sm font-medium text-gray-600 mt-1">
              {s.icon} {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================
   Tag Filter Bar (NEW COMPONENT)
========================= */
const TagFilterBar = ({ locations, activeTag, onTagClick }) => {
    const allTags = useMemo(() => {
        const uniqueTags = new Set(locations.flatMap((l) => l.tags || []));
        return Array.from(uniqueTags).sort();
    }, [locations]);

    if (allTags.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mb-8 p-4 bg-sky-50/70 rounded-2xl shadow-inner border border-white/50">
            <p className="text-sm font-semibold text-sky-800 mb-2">Filter by Tag:</p>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onTagClick(null)}
                    className={`px-3 py-1 text-sm rounded-full font-medium transition duration-150 active:scale-95 ${
                        !activeTag
                            ? "bg-sky-700 text-white shadow-md"
                            : "bg-white/80 text-gray-600 hover:bg-white"
                    }`}
                >
                    # All ({locations.length})
                </button>
                {allTags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => onTagClick(tag)}
                        className={`px-3 py-1 text-sm rounded-full font-medium transition duration-150 active:scale-95 ${
                            activeTag === tag
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white/80 text-sky-700 hover:bg-white"
                        }`}
                    >
                        #{tag}
                    </button>
                ))}
            </div>
        </div>
    );
};

/* =========================
   Add Place Form Component (BLENDED UI)
========================= */
const AddPlaceForm = ({ onAddPlace }) => {
  const [locationInput, setLocationInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const handleAddTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback(
    (t) => setTags((p) => p.filter((x) => x !== t)),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;

    onAddPlace({ name: locationInput, tags, photos: [] }); 

    // Reset form states
    setLocationInput("");
    setTags([]);
    setTagInput("");
  };

  return (
    // UPDATED: Changed from bg-white/90 to bg-sky-50/70 for blending effect
    <div className="bg-sky-50/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-full max-w-5xl mb-8 border border-white/50">
      <h2 className="text-2xl font-extrabold mb-4 text-sky-800 border-b pb-2 border-sky-100">
        ➕ Add New Destination
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Location Input */}
        <input
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="City, park, country, cafe, museum..."
          className="w-full px-4 py-3 mb-4 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 transition duration-150 shadow-sm bg-white/80" // IMPROVED: Added focus ring
          required
        />

        {/* Tag Display */}
        <div className="flex gap-2 mb-3 flex-wrap min-h-[30px]">
          {tags.map((t) => (
            <span
              key={t}
              className="bg-sky-200/70 px-3 py-1 rounded-full text-sm font-medium text-sky-800 cursor-pointer hover:bg-red-300/70 hover:scale-[1.05] transition duration-150" 
              onClick={() => handleRemoveTag(t)}
            >
              {t} ✕
            </span>
          ))}
        </div>

        {/* Tag Input */}
        <div className="flex gap-3 mb-4">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add descriptive tag (e.g., Beach, Hike, Europe)"
            className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 shadow-sm transition duration-150 bg-white/80" // IMPROVED: Added focus ring
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold transition duration-150 hover:bg-blue-700 active:scale-95 shadow-md"
          >
            Add Tag
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 bg-sky-600 text-white px-6 py-3 rounded-xl hover:bg-sky-700 transition duration-150 active:scale-98 w-full font-bold text-lg shadow-lg"
        >
          List Destination
        </button>
      </form>
    </div>
  );
};

/* =========================
   Visit Modal Component 
========================= */
const VisitModal = ({ place, onMarkVisited, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setIsProcessing(true);
      const base64Photos = await processFiles(files);
      setPhotos(base64Photos);
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onMarkVisited(place.id, photos);
    onClose();
  };

  if (!place) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-7 w-full max-w-lg shadow-2xl border-t-8 border-green-500">
        <h3 className="text-2xl font-extrabold text-green-700 mb-2">
          ✅ **{place.name}** Visited!
        </h3>
        <p className="text-gray-600 mb-5 border-b pb-3 border-gray-100">
          Mark this place as completed and share your photos.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Photo Input */}
          <label className="block mb-6">
            <span className="text-md font-semibold text-gray-700 mb-2 block">Upload Trip Photos:</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-green-400/50 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 transition mt-1" 
            />
          </label>

          {/* Photo Preview */}
          {isProcessing ? (
            <p className="text-sm text-green-500 mb-4 font-medium">Processing photos...</p>
          ) : photos.length > 0 ? (
            <div className="flex gap-3 mb-6 overflow-x-auto p-1 bg-gray-50 rounded-lg">
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No photos selected yet. Photos are optional.</p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-xl font-semibold transition duration-150 hover:bg-gray-300 active:scale-95" 
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`px-5 py-2 rounded-xl font-semibold transition duration-150 ${
                isProcessing ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-md' 
              } text-white`}
            >
              {isProcessing ? 'Processing...' : 'Confirm Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================
   Photo Gallery Modal Component 
========================= */
const PhotoGalleryModal = ({ place, onClose }) => {
  if (!place || place.visitedPhotos.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center p-4 sm:p-8"
      onClick={onClose} 
    >
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 pt-2">
        <h3 className="text-2xl font-bold text-white">
          Photos from **{place.name}** ({place.visitedPhotos.length})
        </h3>
        <button
          onClick={onClose}
          className="text-white text-4xl font-light hover:text-gray-300 transition duration-150 active:scale-90" 
        >
          &times;
        </button>
      </div>
      
      {/* Photo Grid Container */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto w-full max-w-6xl pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {place.visitedPhotos.map((photo, index) => (
          <div key={index} className="rounded-xl shadow-2xl overflow-hidden bg-gray-800 transition duration-300 hover:scale-[1.03]"> 
            <img
              src={photo}
              alt={`${place.name} photo ${index + 1}`}
              className="w-full h-72 object-cover transition duration-300 opacity-90 hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================
   Delete Confirmation Modal 
========================= */
const DeleteConfirmationModal = ({ place, onConfirm, onClose }) => {
  if (!place) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl border-t-8 border-red-500">
        <h3 className="text-2xl font-extrabold text-red-700 mb-2">
          ⚠️ Confirm Deletion
        </h3>
        <p className="text-gray-700 mb-6 border-b pb-4 border-gray-100">
          Are you absolutely sure you want to permanently delete **{place.name}**? This action cannot be reversed.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-xl font-semibold transition duration-150 hover:bg-gray-300 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(place.id)}
            className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold transition duration-150 hover:bg-red-700 active:scale-95 shadow-md"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};


/* =========================
   Place Card Component (BLENDED UI + Photo Count)
========================= */
const PlaceCard = ({ place, openVisitModal, openGalleryModal, deletePlace, isDeleting }) => { 
  const isVisited = place.isVisited;
  const displayPhotos = place.visitedPhotos; 
  const hasPhotos = displayPhotos && displayPhotos.length > 0;
  const photoCount = displayPhotos ? displayPhotos.length : 0;

  // Class for deletion (fade out and scale down/collapse)
  const deletionClass = isDeleting ? "opacity-0 scale-95 duration-500 ease-out h-0 p-0 m-0" : "duration-300";

  // Class for entry (fade in/slide up)
  const isNew = (Date.now() - place.createdAt) < 500 && !isVisited;
  const entryClass = isNew ? "animate-fade-in-up" : "";

  return (
    <div
      key={place.id}
      // UPDATED: Changed from bg-white to bg-sky-50/70 for blending effect
      className={`p-5 rounded-xl w-80 transition-all overflow-hidden ${deletionClass} shadow-lg hover:shadow-xl hover:scale-[1.01] ${entryClass} ${
        isVisited ? "bg-green-50 border-2 border-green-200" : "bg-sky-50/70 border-2 border-white/50"
      }`}
    >
      {/* Photo Display - Now Clickable for Visited Places with Photos */}
      <div 
        className={`w-full h-40 flex items-center justify-center rounded-lg mb-4 relative ${ // Added relative for counter
          isVisited && hasPhotos ? 'cursor-pointer hover:opacity-90 transition' : '' 
        }`}
        onClick={isVisited && hasPhotos ? () => openGalleryModal(place) : undefined}
      >
        {hasPhotos ? (
          <img
            src={displayPhotos[0]}
            alt={place.name}
            className="w-full h-40 object-cover rounded-lg shadow-md"
          />
        ) : (
          <PhotoPlaceholder />
        )}

        {/* NEW: Photo Count Indicator */}
        {isVisited && photoCount > 0 && (
            <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                📸 {photoCount}
            </span>
        )}
      </div>

      <h3 className="font-extrabold text-xl text-sky-900 truncate mb-1">{place.name}</h3>

      {!isVisited ? (
        <>
          {/* Tags */}
          <div className="flex gap-2 mt-2 flex-wrap min-h-[28px]">
            {place.tags.map((t) => (
              <span
                key={t}
                className="bg-sky-100 px-2 py-0.5 rounded-full text-xs font-medium text-sky-800 border border-sky-200"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={() => openVisitModal(place)}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-xl font-semibold transition duration-150 hover:bg-green-700 active:scale-95 shadow-md"
            >
              Mark Visited
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-600 font-medium mt-2">
          Last Visited: {formatDate(place.visitedDate)}
        </p>
      )}

      <button
        onClick={() => deletePlace(place)}
        className="mt-4 bg-red-500 text-white w-full px-3 py-2 rounded-xl font-semibold transition duration-150 hover:bg-red-600 active:scale-95 shadow-md"
      >
        Delete Place
      </button>
    </div>
  );
};

/* =========================
   Place List Component (Reusable) (BLENDED UI)
========================= */
const PlaceList = ({ title, places, openVisitModal, openGalleryModal, deletePlace, emptyMessage, isVisitedList, sortControl, deletingId }) => (
  <>
    {/* Centered Heading with border */}
    <h2 className="text-3xl font-extrabold mt-12 mb-6 text-sky-900 w-full max-w-5xl border-b pb-2 border-sky-600/50 text-center">
      {title} ({places.length})
    </h2>
    
    {/* Sort Control (only for visited list) */}
    {isVisitedList && <div className="w-full max-w-5xl flex justify-end mb-4">{sortControl}</div>}
    
    {/* List Grid */}
    <div className="flex flex-wrap gap-8 justify-center w-full max-w-6xl">
      {places.map((p) => (
        <PlaceCard
          key={p.id}
          place={p}
          openVisitModal={openVisitModal}
          openGalleryModal={openGalleryModal}
          deletePlace={deletePlace}
          isDeleting={p.id === deletingId}
        />
      ))}
      {places.length === 0 && (
        // UPDATED: Changed from bg-white/90 to bg-sky-50/70 for blending effect
        <p className="text-lg text-gray-700 p-6 bg-sky-50/70 rounded-xl shadow-md border border-white/50">{emptyMessage}</p>
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
  const [filterMode, setFilterMode] = useState("all"); 
  // NEW: State for active tag filtering
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  
  const [placeToVisit, setPlaceToVisit] = useState(null); 
  const [galleryPlace, setGalleryPlace] = useState(null);
  
  const [deletingId, setDeletingId] = useState(null); 
  const [placeToDelete, setPlaceToDelete] = useState(null);

  /* ---------- Persist ---------- */
  useEffect(() => {
    try {
      localStorage.setItem("locations", JSON.stringify(locations));
    } catch (e) {
      console.error("Could not save locations to local storage:", e);
    }
  }, [locations]);

  /* ---------- Modal Handlers ---------- */
  const openVisitModal = useCallback((place) => {
    setPlaceToVisit(place);
  }, []);

  const closeVisitModal = useCallback(() => {
    setPlaceToVisit(null);
  }, []);
  
  const openGalleryModal = useCallback((place) => {
    setGalleryPlace(place);
  }, []);

  const closeGalleryModal = useCallback(() => {
    setGalleryPlace(null);
  }, []);
  
  // Open confirmation modal
  const deletePlace = useCallback((place) => {
    setPlaceToDelete(place);
  }, []);

  // Close confirmation modal
  const cancelDelete = useCallback(() => {
    setPlaceToDelete(null);
  }, []);

  // NEW: Handler for tag filtering
  const handleTagClick = useCallback((tag) => {
        setActiveTagFilter(tag);
        setSearchTerm(""); // Clear search when filtering by tag
  }, []);


  /* ---------- Handlers ---------- */
  const handleAddPlace = useCallback(
    ({ name, tags, photos }) => { 
      const newPlace = {
        id: Date.now(),
        name,
        tags,
        photos: [], 
        isVisited: false,
        visitedPhotos: [],
        visitedDate: null, 
        createdAt: Date.now(),
      };
      setLocations((prev) => [ newPlace, ...prev]); 
      setFilterMode("toGo"); 
    },
    []
  );

  const markVisited = useCallback((id, uploadedPhotos) => { 
    setLocations((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              isVisited: true,
              visitedPhotos: uploadedPhotos, 
              visitedDate: Date.now(), 
              photos: [], 
            }
          : l
      )
    );
    setFilterMode("visited"); 
  }, []);

  // Executes fade-out animation and final removal after confirmation
  const confirmDelete = useCallback((id) => {
    setPlaceToDelete(null);
    setDeletingId(id);
    // Wait for the 500ms transition to complete before permanently removing
    setTimeout(() => {
      setLocations((prev) => prev.filter((l) => l.id !== id));
      setDeletingId(null);
    }, 500); 
  }, []);


  /* ---------- Filtering & Sorting (UPDATED for Tag Filter) ---------- */
  const { toGo, visited, toGoList, visitedList } = useMemo(() => {
    const term = searchTerm.toLowerCase();

    // 1. Apply Search Filter and Tag Filter
    let filtered = locations.filter(
      (l) =>
        (l.name.toLowerCase().includes(term) ||
        (l.tags || []).some((t) => t.toLowerCase().includes(term))) &&
        (!activeTagFilter || (l.tags || []).includes(activeTagFilter)) // Apply tag filter
    );

    // 2. Separate Lists
    const safeFilter = (list) => list.filter(l => l.id !== deletingId);

    // To Go list (Unvisited, filtered by search/tag)
    const currentToGoList = safeFilter(filtered.filter((l) => !l.isVisited));
  	
    // Visited list (Visited, filtered by search/tag, sorted by visitedDate)
    const currentVisitedList = safeFilter(filtered.filter((l) => l.isVisited))
  	  .sort((a, b) =>
  	    sortOrder === "newest"
  	      ? b.visitedDate - a.visitedDate
  	      : a.visitedDate - b.visitedDate
  	  );
    
    return { 
        toGo: currentToGoList, 
        visited: currentVisitedList,
        toGoList: currentToGoList, 
        visitedList: currentVisitedList 
    };
  }, [locations, searchTerm, sortOrder, deletingId, activeTagFilter]); 

  const searchEmptyMessage = searchTerm || activeTagFilter ? "No places match your current filters." : "No places to display.";

  // Sort control for the Visited List
  const VisitedSortControl = (
    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
      className="px-4 py-2 rounded-xl shadow-md border-2 border-gray-200 transition duration-150 focus:border-blue-500 focus:ring-2 focus:ring-sky-500 font-medium text-gray-700 bg-white/80"
    >
      <option value="newest">Newest Visit First</option>
      <option value="oldest">Oldest Visit First</option>
    </select>
  );

  /* =========================
     UI
  ========================= */
  return (
    // MAINTAINING ORIGINAL BACKGROUND GRADIENT
    <div 
      id="scroll-explore-helper" 
      className="min-h-screen bg-gradient-to-r from-sky-200 to-blue-400 p-6 flex flex-col items-center"
    >
      <h1 className="text-5xl font-extrabold text-sky-900 mt-4 mb-10 tracking-tight text-shadow-lg">
        📍 Your Travel Wishlist
      </h1>

      <StatsDashboard locations={locations} />

      {/* Search Input (IMPROVED Focus) */}
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="🔍 Search destinations or tags..."
        className="mb-4 px-5 py-3 rounded-2xl w-full max-w-5xl shadow-lg border-2 border-white/50 focus:border-blue-500 focus:ring-2 focus:ring-sky-500 transition duration-150 text-lg bg-white/90" 
      />
        
        {/* NEW: Tag Filter Bar */}
        <TagFilterBar 
            locations={locations} 
            activeTag={activeTagFilter} 
            onTagClick={handleTagClick}
        />
      
      {/* Add Place */}
      <AddPlaceForm onAddPlace={handleAddPlace} />
      
      {/* Filter Tabs (BLENDED UI) */}
      <div className="flex gap-2 mb-8 w-full max-w-5xl justify-center">
        {[
          { label: `All (${locations.length})`, key: 'all' },
          { label: `To Go (${toGo.length})`, key: 'toGo' },
          { label: `Visited (${visited.length})`, key: 'visited' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterMode(tab.key)}
            className={`px-6 py-2 rounded-full font-bold text-base transition duration-200 ${
              filterMode === tab.key
                ? "bg-sky-700 text-white shadow-lg shadow-sky-400/50" // Active state
                : "bg-white/70 text-gray-700 hover:bg-white border border-gray-200" // Inactive state
            } active:scale-98`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* Main List Rendering */}
      {filterMode === "all" && (
        <>
          {/* To Go List */}
          <PlaceList
            title="✈️ Upcoming Destinations"
            places={toGoList}
            openVisitModal={openVisitModal}
            openGalleryModal={openGalleryModal}
            deletePlace={deletePlace}
            emptyMessage={searchEmptyMessage}
            deletingId={deletingId}
          />

          {/* Separator Line to separate To Go and Visited */}
          {(toGoList.length > 0 || visitedList.length > 0) && (
            <div className="w-full max-w-5xl my-10">
              <hr className="border-sky-700/50 border-2 rounded-full shadow-lg" />
            </div>
          )}

          {/* Visited List */}
          <PlaceList
            title="✅ Visited Destinations"
            places={visitedList}
            openVisitModal={openVisitModal}
            openGalleryModal={openGalleryModal}
            deletePlace={deletePlace}
            emptyMessage={searchEmptyMessage}
            isVisitedList={true}
            sortControl={VisitedSortControl}
            deletingId={deletingId}
          />
        </>
      )}

      {filterMode === "toGo" && (
        <PlaceList
          title="✈️ Upcoming Destinations"
          places={toGo}
          openVisitModal={openVisitModal}
          openGalleryModal={openGalleryModal}
          deletePlace={deletePlace}
          emptyMessage={searchEmptyMessage}
          deletingId={deletingId}
        />
      )}

      {filterMode === "visited" && (
        <PlaceList
          title="✅ Visited Destinations"
          places={visited}
          openVisitModal={openVisitModal}
          openGalleryModal={openGalleryModal}
          deletePlace={deletePlace}
          isVisitedList={true}
          sortControl={VisitedSortControl}
          deletingId={deletingId}
        />
      )}

      {/* Visit Confirmation Modal */}
      {placeToVisit && (
        <VisitModal
          place={placeToVisit}
          onMarkVisited={markVisited}
          onClose={closeVisitModal}
        />
      )}
      
      {/* Photo Gallery Modal */}
      {galleryPlace && (
        <PhotoGalleryModal
          place={galleryPlace}
          onClose={closeGalleryModal}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {placeToDelete && (
        <DeleteConfirmationModal
          place={placeToDelete}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
        />
      )}
    </div>
  );
};

export default Places;