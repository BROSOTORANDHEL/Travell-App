import { useState, useEffect, useMemo, useCallback } from "react";

// --- Configuration / Default Data ---
const defaultPhotos = {
  nature: [],
  beach: [],
};

// --- Utility Functions (Kept for Modals) ---
const processFiles = (files) => {
  const readers = files.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      })
  );
  return Promise.all(readers);
};


// 🖼️ Placeholder Component
const PhotoPlaceholder = () => (
    <div className="w-28 h-28 object-cover rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center border-dashed border-2 border-gray-400">
        No Photos
    </div>
);

// --- Stats Dashboard Component ---
const StatsDashboard = ({ locations }) => {
    const total = locations.length;
    const visited = locations.filter(loc => loc.isVisited).length;
    const toGo = total - visited;
    const natureCount = locations.filter(loc => loc.type === 'nature').length;
    const beachCount = locations.filter(loc => loc.type === 'beach').length;
    const completionRate = total > 0 ? ((visited / total) * 100).toFixed(1) : 0;
    
    const allTags = locations.flatMap(loc => loc.tags || []);
    const uniqueTags = new Set(allTags).size;

    const data = [
        { label: "Total Places", value: total, icon: "🌎" },
        { label: "Visited", value: visited, icon: "✅" },
        { label: "To Go", value: toGo, icon: "✈️" },
        { label: "Completion", value: `${completionRate}%`, icon: "📈" },
        { label: "Nature Spots", value: natureCount, icon: "⛰️" },
        { label: "Beach Trips", value: beachCount, icon: "🏖️" },
        { label: "Unique Tags", value: uniqueTags, icon: "🏷️" },
    ];

    return (
        <div className="mb-8 p-4 bg-white/80 rounded-xl shadow-inner w-full max-w-4xl border-t-4 border-sky-600">
            <h3 className="text-xl font-bold text-sky-700 mb-3 text-center md:text-left">Travel Snapshot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
                {data.map((item, i) => (
                    <div key={i} className="p-2 bg-sky-50 rounded-lg shadow-sm">
                        <p className="text-xl sm:text-2xl font-extrabold text-sky-900">{item.value}</p>
                        <p className="text-xs text-gray-600 font-semibold">{item.icon} {item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// ==========================================================
// 🚀 1. EXTRACTED COMPONENTS (Modals & Cards)
// ==========================================================

// --- MARK AS VISITED MODAL ---
const MarkAsVisitedModal = ({ 
    locations, 
    visitedIndex, 
    isMarkingVisited, 
    setIsMarkingVisited, 
    visitedDate, 
    setVisitedDate, 
    visitedImages, 
    setVisitedImages, 
    handleVisitedImageUpload, 
    saveMarkAsVisited 
  }) => {
    if (!isMarkingVisited || visitedIndex === null) return null;
    const placeName = locations[visitedIndex]?.name || "Unknown Place";
  
    const closeHandler = () => {
      setIsMarkingVisited(false);
      setVisitedImages([]);
    };
  
    const removeVisitedImage = (indexToRemove) => {
      setVisitedImages(prev => prev.filter((_, i) => i !== indexToRemove));
    };
  
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={closeHandler}
      >
        <div 
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()} 
        >
          <h2 className="text-xl font-bold mb-2 text-sky-800">Mark "{placeName}" as Visited</h2>
                  
          <label className="text-sm font-medium text-gray-700">Date of Visit</label>
          <input
            type="date"
            value={visitedDate}
            onChange={(e) => setVisitedDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-400"
          />
  
          <label className="text-sm font-medium text-gray-700">Upload Photos From Your Trip (History)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleVisitedImageUpload}
            className="px-3 py-2 bg-white rounded-lg shadow-md cursor-pointer text-sm"
          />
                  
          {visitedImages.length > 0 && (
            <>
              <p className="text-sm text-gray-500">New Photos Preview (Click to remove):</p>
              <div className="flex gap-2 overflow-x-auto border-t pt-2">
                {visitedImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 flex-shrink-0">
                    <img
                      src={img}
                      alt={`visited-${i}`}
                      className="w-full h-full object-cover rounded-lg border border-sky-300 cursor-pointer"
                      onClick={() => removeVisitedImage(i)}
                    />
                    <span 
                      className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 text-xs flex items-center justify-center rounded-full cursor-pointer -mt-1 -mr-1"
                      onClick={() => removeVisitedImage(i)}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
  
          <div className="flex gap-4 justify-end mt-4">
            <button
              onClick={closeHandler}
              className="px-4 py-1 bg-gray-300 text-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={saveMarkAsVisited}
              className="px-4 py-1 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Save as Visited
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  
  // --- EDIT MODAL ---
const EditModal = ({
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    editImages,
    setEditImages,
    editTags,
    setEditTags,
    editTagInput,
    setEditTagInput,
    addEditTag,
    removeEditTag,
    handleEditImageUpload,
    saveEdit
  }) => {
    if (!isEditing) return null;
  
    const closeHandler = () => {
      setIsEditing(false);
    };
  
    const removeEditImage = (indexToRemove) => {
      setEditImages(prev => prev.filter((_, i) => i !== indexToRemove));
    };
  
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={closeHandler}
      >
        <div 
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-2">Edit Place</h2>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Edit name"
            className="px-3 py-2 rounded-lg border border-gray-400"
          />
  
          {/* Edit Images */}
          <label className="text-sm font-medium text-gray-700">Add/Update Photos (Current: {editImages.length})</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleEditImageUpload}
            className="px-3 py-2 bg-white rounded-lg shadow-md text-sm"
          />
          
          {editImages.length > 0 && (
            <>
              <p className="text-sm text-gray-500">Current Photos (Click to remove):</p>
              <div className="flex gap-2 overflow-x-auto border-t pt-2">
                {editImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 flex-shrink-0">
                    <img
                      src={img}
                      alt={`edit-${i}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => removeEditImage(i)}
                    />
                     <span 
                      className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 text-xs flex items-center justify-center rounded-full cursor-pointer -mt-1 -mr-1"
                      onClick={() => removeEditImage(i)}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
  
          {/* Edit Tags */}
          <div className="flex gap-2 flex-wrap border-t pt-2">
            {editTags.map((tag, i) => (
              <span
                key={i}
                className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {tag}{" "}
                <button
                  onClick={() => removeEditTag(tag)}
                  className="font-bold text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
  
          <div className="flex gap-2">
            <input
              type="text"
              value={editTagInput}
              onChange={(e) => setEditTagInput(e.target.value)}
              placeholder="Add tag"
              className="px-3 py-1 rounded-lg border border-gray-400 text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEditTag();
                }
              }}
            />
            <button
              onClick={addEditTag}
              className="px-4 py-1 bg-blue-600 text-white rounded-lg"
            >
              Add Tag
            </button>
          </div>
  
          <div className="flex gap-4 justify-end mt-4">
            <button
              onClick={closeHandler}
              className="px-4 py-1 bg-gray-300 text-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="px-4 py-1 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  
  // --- DELETE CONFIRMATION MODAL ---
  const DeleteConfirmationModal = ({ isDeleting, cancelDelete, deleteLocation }) => {
      if (!isDeleting) return null;
      return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             // Using p-4 for RWD safety
          >
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 items-center" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-xl font-bold text-red-600">Are you sure?</h2>
                  <p>This action cannot be undone.</p>
                  <div className="flex gap-4 mt-4">
                      <button
                          onClick={cancelDelete}
                          className="px-4 py-1 bg-gray-300 text-gray-800 rounded-lg"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={deleteLocation}
                          className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      );
  };

// ==========================================================
// 🗺️ MAIN COMPONENT: Places
// ==========================================================
const Places = () => {
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem("locations");
    const loadedLocations = saved ? JSON.parse(saved) : [];
    
    return loadedLocations.map(loc => ({
      id: loc.id || Date.now() + Math.random(), 
      ...loc,
      isVisited: loc.isVisited || false, 
      visitedPhotos: loc.visitedPhotos || [], 
      visitedDate: loc.visitedDate || null, 
    }));
  });

  const [locationInput, setLocationInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]); // REMOVE THIS STATE
  const [filter, setFilter] = useState("all");

  const [searchTerm, setSearchTerm] = useState(""); 

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  
  const [sortOrder, setSortOrder] = useState("newest"); 

  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [editTagInput, setEditTagInput] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [isMarkingVisited, setIsMarkingVisited] = useState(false);
  const [visitedIndex, setVisitedIndex] = useState(null);
  const [visitedImages, setVisitedImages] = useState([]); 
  const [visitedDate, setVisitedDate] = useState(new Date().toISOString().split('T')[0]); 

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem("locations", JSON.stringify(locations));
  }, [locations]);

  // --- Advanced Filtering and Sorting Logic (unchanged) ---
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  const filterAndSortLocations = useCallback((list, isVisitedList = false) => {
    
    // ... filtering logic ...

    return list.filter(loc => {
        if (!normalizedSearchTerm) return true;
        
        const nameMatch = loc.name.toLowerCase().includes(normalizedSearchTerm);
        const tagsMatch = (loc.tags || []).some(tag => 
            tag.toLowerCase().includes(normalizedSearchTerm)
        );
        return nameMatch || tagsMatch;
    })
    .filter(loc => isVisitedList || (filter === "all" || loc.type === filter))
    .sort((a, b) => {
        if (!isVisitedList) return 0; // Don't sort unvisited list by date
        const dateA = a.visitedDate ? new Date(a.visitedDate) : new Date(0);
        const dateB = b.visitedDate ? new Date(b.visitedDate) : new Date(0);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  }, [normalizedSearchTerm, filter, sortOrder]);


  const filteredLocations = useMemo(() => {
    const unvisited = locations.filter(loc => !loc.isVisited);
    return filterAndSortLocations(unvisited, false);
  }, [locations, filterAndSortLocations]); 

  const visitedLocations = useMemo(() => {
    const visited = locations.filter(loc => loc.isVisited);
    return filterAndSortLocations(visited, true);
  }, [locations, filterAndSortLocations]);
  
  // --- Image Handling Callbacks (Dedicated functions for clarity) ---
  
  // REMOVED handleNewPlaceImageUpload AND setUploadedImages STATE

  const handleEditImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    processFiles(files).then(images => {
      setEditImages((prev) => [...prev, ...images]);
    });
  }, []);

  const handleVisitedImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    processFiles(files).then(images => {
      setVisitedImages((prev) => [...prev, ...images]);
    });
  }, []);


  // --- Tag Logic and CRUD (unchanged) ---
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };
  
  const addLocation = (type) => {
    if (!locationInput.trim()) return;

    const newItem = {
      id: Date.now(),
      name: locationInput,
      type,
      date: new Date().toLocaleDateString(),
      // FIX: Always default photos to the empty array since the upload input is removed
      photos: defaultPhotos[type], 
      tags: tags,
      isVisited: false, 
      visitedPhotos: [], 
      visitedDate: null, 
    };

    setLocations((prev) => [...prev, newItem]);
    setLocationInput("");
    // REMOVE: setUploadedImages([]); 
    setTags([]);
    setTagInput("");
  };

  const startEdit = (id) => {
    const index = locations.findIndex(loc => loc.id === id);
    if (index === -1) return;
    const item = locations[index];

    setEditIndex(index);
    setEditName(item.name);
    setEditTags(item.tags || []);
    setEditImages(item.isVisited ? item.visitedPhotos : item.photos || []); 
    setEditTagInput(""); 
    setIsEditing(true);
  };
  
  const addEditTag = () => {
    const tag = editTagInput.trim();
    if (tag && !editTags.includes(tag)) {
      setEditTags((prev) => [...prev, tag]);
    }
    setEditTagInput("");
  };

  const removeEditTag = (tagToRemove) => {
    setEditTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const saveEdit = () => {
    setLocations((prev) =>
      prev.map((loc, i) => {
        if (i === editIndex) {
            const updatedPhotos = loc.isVisited ? 
                                {...loc, visitedPhotos: editImages } : 
                                {...loc, photos: editImages };
            return { 
                ...updatedPhotos, 
                name: editName, 
                tags: editTags 
            };
        }
        return loc;
      })
    );
    // Reset state
    setIsEditing(false);
    setEditIndex(null);
    setEditName("");
    setEditTags([]);
    setEditImages([]);
    setEditTagInput("");
  };

  const confirmDelete = (id) => {
    const index = locations.findIndex(loc => loc.id === id);
    if (index === -1) return;
    setDeleteIndex(index);
    setIsDeleting(true);
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
    setIsDeleting(false);
  };

  const deleteLocation = () => {
    const el = document.getElementById(`location-${locations[deleteIndex].id}`);
    if (el) {
      el.classList.add("vanish");
      setTimeout(() => {
        setLocations((prev) => prev.filter((_, i) => i !== deleteIndex));
        setDeleteIndex(null);
        setIsDeleting(false);
      }, 500); 
    } else {
        setLocations((prev) => prev.filter((_, i) => i !== deleteIndex));
        setDeleteIndex(null);
        setIsDeleting(false);
    }
  };

  const startMarkAsVisited = (id) => {
    const index = locations.findIndex(loc => loc.id === id);
    if (index === -1) return;

    setVisitedIndex(index);
    setVisitedImages([]); 
    setVisitedDate(new Date().toISOString().split('T')[0]); 
    setIsMarkingVisited(true);
  };

  const saveMarkAsVisited = () => {
    if (visitedIndex === null) return;

    setLocations(prev => 
      prev.map((loc, i) => 
        i === visitedIndex 
          ? { 
              ...loc, 
              isVisited: true, 
              visitedPhotos: visitedImages.length > 0 ? visitedImages : loc.photos, 
              visitedDate: new Date(visitedDate).toLocaleDateString()
            } 
          : loc
      )
    );

    // Reset visited state
    setIsMarkingVisited(false);
    setVisitedIndex(null);
    setVisitedImages([]);
    setVisitedDate(new Date().toISOString().split('T')[0]);
  };
  // --- End CRUD ---


  return (
    <div id="scroll-explore-helper" className="min-h-screen bg-gradient-to-r from-sky-200 via-sky-300 to-blue-400 flex flex-col items-center py-8 px-2 sm:px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-sky-900 mb-6 drop-shadow-md text-center">
        📍 Explore Your Saved Places
      </h1>

      {/* Stats Dashboard */}
      <StatsDashboard locations={locations} />

      {/* Global Search Input */}
      <div className="mb-6 w-full max-w-4xl px-2 sm:px-0">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔎 Search by Location Name or Tag..."
          className="px-4 py-3 rounded-xl border-2 border-sky-400 shadow-lg w-full text-base sm:text-lg focus:ring-sky-500 focus:border-sky-500 transition"
        />
      </div>


      {/* Input Section */}
      <div className="mb-6 p-4 sm:p-6 bg-white/70 rounded-xl shadow-xl w-full max-w-4xl">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-sky-800">Add New Place</h2>
        <div className="flex flex-col md:flex-row flex-wrap gap-3 items-center justify-center">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="Enter location name..."
            className="px-4 py-2 rounded-lg border border-gray-400 shadow-sm w-full md:flex-grow md:min-w-[200px]"
          />

          {/* Tags */}
          <div className="flex flex-col gap-2 w-full"> 
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}{" "}
                  <button
                    onClick={() => removeTag(tag)}
                    className="font-bold text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                className="px-3 py-1 rounded-lg border border-gray-400 text-sm flex-grow"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                onClick={addTag}
                className="px-4 py-1 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition text-sm"
              >
                Add Tag
              </button>
          </div>
          </div>

          <div className="flex gap-2 w-full justify-center md:w-auto">
            <button
              onClick={() => addLocation("nature")}
              disabled={!locationInput}
              className={`px-4 py-2 text-white rounded-lg shadow-md transition w-1/2 md:w-auto ${!locationInput ? 'bg-gray-400' : 'bg-green-600 hover:scale-105'}`}
            >
              Add Nature
            </button>
            <button
              onClick={() => addLocation("beach")}
              disabled={!locationInput}
              className={`px-4 py-2 text-white rounded-lg shadow-md transition w-1/2 md:w-auto ${!locationInput ? 'bg-gray-400' : 'bg-blue-600 hover:scale-105'}`}
            >
              Add Beach
            </button>
          </div>
        </div>

        {/* 🗑️ REMOVED Preview Images Section */}
        
      </div>


      {/* Places To Go Section */}
      <h2 className="text-2xl sm:text-3xl font-bold text-sky-800 my-6 drop-shadow-md">✈️ Places To Go</h2>
      
      {/* Filter Buttons */}
      <div className="mb-8 flex gap-3 flex-wrap justify-center w-full max-w-4xl px-2 sm:px-0">
        {["all", "nature", "beach"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-full font-semibold transition text-sm ${
              filter === f
                ? "bg-sky-700 text-white"
                : "bg-sky-100 text-sky-900 hover:bg-sky-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        
        {/* 🗑️ REMOVED "Add Planning Photo" button from Filters section */}
      </div>

      {/* To Go Location Cards */}
      <div className="flex flex-wrap gap-6 sm:gap-8 justify-center w-full px-2 sm:px-0">
        {filteredLocations.length === 0 && (
          <p className="text-gray-700 text-lg p-4 bg-white/70 rounded-lg shadow text-center w-full max-w-md">
            {searchTerm 
                ? `No planning locations found matching "${searchTerm}" in the current filter.`
                : locations.length === visitedLocations.length ? "🥳 You have visited all your saved places! Add more to plan your next trip." : "No unvisited locations match the filter."
            }
          </p>
        )}

        {filteredLocations.map((item, index) => (
          <div
            key={item.id}
            id={`location-${item.id}`}
            className="bg-white/80 backdrop-blur-md rounded-3xl w-full max-w-xs sm:w-80 p-5 sm:p-6 flex flex-col items-center shadow-xl transition transform hover:-translate-y-1 location-card border-2 border-dashed border-sky-400 appear"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 w-full">
              {item.photos && item.photos.length > 0 ? (
                item.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`${item.name}-${i}`}
                    className="w-28 h-28 flex-shrink-0 object-cover rounded-xl"
                  />
                ))
              ) : (
                <PhotoPlaceholder />
              )}
            </div>

            <h2 className="text-xl font-bold">{item.name}</h2>
            <p className="text-sm text-gray-600">Plan Date: {item.date}</p>

            <span
              className={`mt-2 px-3 py-1 rounded-full text-white text-sm ${
                item.type === "nature" ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>

            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {(item.tags || []).map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-300"
                  onClick={() => setSearchTerm(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-3 w-full justify-center">
              <button
                onClick={() => startEdit(item.id)}
                className="px-3 py-1 bg-yellow-400 text-white rounded-lg shadow-md hover:bg-yellow-500 transition text-sm flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => confirmDelete(item.id)}
                className="px-3 py-1 bg-red-400 text-white rounded-lg shadow-md hover:bg-red-500 transition text-sm flex-1"
              >
                Delete
              </button>
                <button
                    onClick={() => startMarkAsVisited(item.id)}
                    className="px-3 py-1 bg-sky-600 text-white rounded-lg shadow-md hover:bg-sky-700 transition text-sm font-semibold flex-1"
                >
                    Visited
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Visited History Section */}
      <h2 className="text-2xl sm:text-3xl font-bold text-green-700 my-8 pt-8 drop-shadow-md border-t-4 border-green-500 w-full max-w-4xl text-center">
        ✅ Travel History (Visited Places)
      </h2>

      {/* Visited Sort Dropdown */}
      <div className="mb-4 w-full max-w-4xl flex justify-end items-center gap-2 px-2 sm:px-0">
        <label className="text-sm font-medium text-gray-700">Sort by Date:</label>
        <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-1 rounded-lg border border-gray-400 text-sm bg-white"
        >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-6 sm:gap-8 justify-center w-full px-2 sm:px-0">
        {visitedLocations.length === 0 && (
          <p className="text-gray-700 text-lg p-4 bg-white/70 rounded-lg shadow text-center w-full max-w-md">
            {searchTerm 
                ? `No visited places found matching "${searchTerm}".`
                : "No places have been marked as visited yet. Start traveling!"
            }
          </p>
        )}

        {visitedLocations.map((item, index) => (
          <div
            key={item.id}
            id={`visited-location-${item.id}`}
            className="bg-green-50/90 backdrop-blur-md rounded-3xl w-full max-w-xs sm:w-80 p-5 sm:p-6 flex flex-col items-center shadow-xl border-4 border-green-300 relative"
          >
            <span className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-tr-2xl rounded-bl-xl">VISITED!</span>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 w-full">
              {(item.visitedPhotos && item.visitedPhotos.length > 0) ? (
                item.visitedPhotos.map((photo, i) => ( 
                  <img
                    key={i}
                    src={photo}
                    alt={`${item.name}-visited-${i}`}
                    className="w-28 h-28 flex-shrink-0 object-cover rounded-xl border-2 border-green-400"
                  />
                ))
              ) : (
                <PhotoPlaceholder />
              )}
            </div>

            <h2 className="text-xl font-bold">{item.name}</h2>
            <p className="text-sm text-gray-700 font-semibold">Visited On: {item.visitedDate || 'N/A'}</p>

            <span
              className={`mt-2 px-3 py-1 rounded-full text-white text-sm ${
                item.type === "nature" ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>

            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {(item.tags || []).map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-300"
                  onClick={() => setSearchTerm(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-3 w-full justify-center">
              <button
                onClick={() => startEdit(item.id)}
                className="px-3 py-1 bg-yellow-400 text-white rounded-lg shadow-md hover:bg-yellow-500 transition text-sm flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => confirmDelete(item.id)}
                className="px-3 py-1 bg-red-400 text-white rounded-lg shadow-md hover:bg-red-500 transition text-sm flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODALS --- */}
      <EditModal
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editName={editName}
        setEditName={setEditName}
        editImages={editImages}
        setEditImages={setEditImages}
        editTags={editTags}
        setEditTags={setEditTags}
        editTagInput={editTagInput}
        setEditTagInput={setEditTagInput}
        addEditTag={addEditTag}
        removeEditTag={removeEditTag}
        handleEditImageUpload={handleEditImageUpload}
        saveEdit={saveEdit}
      />

      <MarkAsVisitedModal
        locations={locations}
        visitedIndex={visitedIndex}
        isMarkingVisited={isMarkingVisited}
        setIsMarkingVisited={setIsMarkingVisited}
        visitedDate={visitedDate}
        setVisitedDate={setVisitedDate}
        visitedImages={visitedImages}
        setVisitedImages={setVisitedImages}
        handleVisitedImageUpload={handleVisitedImageUpload}
        saveMarkAsVisited={saveMarkAsVisited}
      />

      <DeleteConfirmationModal 
        isDeleting={isDeleting}
        cancelDelete={cancelDelete}
        deleteLocation={deleteLocation}
      />


      {/* Inline CSS for animations (unchanged) */}
      <style>{`
        .vanish {
          animation: vanishAnim 0.5s forwards;
        }

        @keyframes vanishAnim {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0); }
        }

        .appear {
            animation: appearAnim 0.5s forwards;
        }

        @keyframes appearAnim {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Places;