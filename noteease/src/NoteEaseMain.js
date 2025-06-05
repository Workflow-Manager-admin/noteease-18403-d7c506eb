import React, { useState, useMemo } from "react";

/*
  NOTE: This file implements the NoteEase main container component.
  Features:
    - Sidebar: List notes with title & category, select a note.
    - Main Area: View/edit selected note (title, content, category), delete & save options.
    - Top Bar: Search by title/content, button to create new note.
    - Light theme styles using given color palette.
    - Categories managed in local state. All storage is ephemeral (no backend).
    - Functional components & React hooks.
*/

// PUBLIC_INTERFACE
function NoteEaseMain() {
  // COLOR PALETTE & THEME
  const COLORS = {
    primary: "#4A90E2",
    secondary: "#F5F7FA",
    accent: "#FFD700",
    text: "#222",
    textLight: "#555",
    sidebar: "#e8f1fb",
    border: "#e0e0e0",
    noteBg: "#fff",
    delete: "#e57373"
  };

  // Basic categories for notes
  const DEFAULT_CATEGORIES = ["Personal", "Work", "Ideas", "Other"];

  // ============ State Management =============
  const [notes, setNotes] = useState([
    // Example seed note
    {
      id: Date.now().toString(),
      title: "Welcome to NoteEase!",
      content:
        "Edit or delete this note, or create new notes using the top bar.\n\nAssign categories for better organization. Search above.",
      category: "Personal",
      createdAt: new Date()
    }
  ]);
  const [selectedId, setSelectedId] = useState(notes[0]?.id || null);
  const [searchText, setSearchText] = useState("");
  const [editState, setEditState] = useState({
    // Editing data for the note editor
    id: "",
    title: "",
    content: "",
    category: DEFAULT_CATEGORIES[0]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [categoryInput, setCategoryInput] = useState(""); // new custom category entry

  // =========== Filtering and Sorting ===========
  const filteredNotes = useMemo(() => {
    if (!searchText.trim()) return notes;
    const q = searchText.trim().toLowerCase();
    return notes.filter(
      n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [searchText, notes]);

  // =========== Event Handlers ===========

  // PUBLIC_INTERFACE
  function handleSelectNote(noteId) {
    setSelectedId(noteId);
    setIsEditing(false);
    setCategoryInput("");
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditState({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category
      });
    }
  }

  // PUBLIC_INTERFACE
  function handleNewNote() {
    // Initialize editor for a new note
    setEditState({
      id: "",
      title: "",
      content: "",
      category: DEFAULT_CATEGORIES[0]
    });
    setIsEditing(true);
    setCategoryInput("");
    setSelectedId(null);
  }

  // PUBLIC_INTERFACE
  function handleEditNote(note) {
    setEditState({
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category
    });
    setIsEditing(true);
    setCategoryInput("");
    setSelectedId(note.id);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(noteId) {
    const remain = notes.filter(n => n.id !== noteId);
    setNotes(remain);
    // Select previous or next note if available
    if (remain.length > 0) {
      setSelectedId(remain[0].id);
    } else {
      setSelectedId(null);
    }
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleSave() {
    // Add or update note
    if (editState.title.trim() === "") {
      alert("Note title cannot be empty.");
      return;
    }

    if (editState.id) {
      // Update existing note
      setNotes(prev =>
        prev.map(n =>
          n.id === editState.id ? { ...n, ...editState } : n
        )
      );
      setSelectedId(editState.id);
    } else {
      // Add new note
      const newNote = {
        ...editState,
        id: Date.now().toString(), // naive unique id
        createdAt: new Date()
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedId(newNote.id);
    }
    setIsEditing(false);
    setCategoryInput("");
  }

  // PUBLIC_INTERFACE
  function handleCategoryInput(e) {
    setCategoryInput(e.target.value);
    setEditState(prev => ({
      ...prev,
      category: e.target.value.trim()
        ? e.target.value
        : prev.category
    }));
  }

  // =========== Helpers ===========
  // Returns unique list of categories including existing + defaults
  const categories = useMemo(() => {
    const all = [
      ...DEFAULT_CATEGORIES,
      ...notes.map(n => n.category).filter(Boolean)
    ];
    return Array.from(new Set(all));
  }, [notes]);

  const selectedNote = notes.find(n => n.id === selectedId);

  // ========== Component JSX ===========
  return (
    <div style={{ width: "100vw", height: "100vh", fontFamily: "Inter,Roboto,Arial,sans-serif", background: COLORS.secondary, display: "flex", flexDirection: "column" }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: COLORS.primary,
        color: "#fff",
        padding: "15px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1.5px solid ${COLORS.border}`,
        boxShadow: "0 2px 8px 0 rgba(36, 94, 163,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: COLORS.accent, fontSize: "1.1em" }}>✒️</span>
          NoteEase
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Search Input */}
          <input
            type="text"
            value={searchText}
            placeholder="Search notes..."
            onChange={e => setSearchText(e.target.value)}
            style={{
              borderRadius: 4,
              border: `1px solid ${COLORS.border}`,
              padding: "7px 12px",
              fontSize: 15,
              width: 200,
              background: "#fff",
              color: COLORS.text,
              marginRight: 8
            }}
            aria-label="Search notes"
          />
          {/* New Note Button */}
          <button
            style={{
              background: COLORS.accent,
              color: "#fff",
              fontWeight: 600,
              border: "none",
              borderRadius: 4,
              padding: "9px 18px",
              cursor: "pointer",
              fontSize: 15,
              boxShadow: "0 2px 8px rgba(255, 215, 0, 0.07)",
              transition: "background .19s"
            }}
            onClick={handleNewNote}
          >
            + New Note
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Main */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar: Notes List */}
        <aside
          style={{
            width: 260,
            background: COLORS.sidebar,
            borderRight: `1px solid ${COLORS.border}`,
            padding: "0",
            overflowY: "auto",
            minHeight: 0,
            display: "flex",
            flexDirection: "column"
          }}>
          <div style={{
            padding: "15px 18px",
            fontWeight: 600,
            letterSpacing: 0.2,
            color: COLORS.primary,
            borderBottom: `1px solid ${COLORS.border}`
          }}>
            Notes
          </div>
          <div
            style={{ flex: 1, overflowY: "auto", padding: "2px 0" }}
          >
            {filteredNotes.length === 0 ? (
              <div style={{ color: COLORS.textLight, padding: 18 }}>
                No notes found.
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  style={{
                    cursor: "pointer",
                    background: note.id === selectedId ? "#fffbe2" : COLORS.sidebar,
                    borderLeft: `4px solid ${
                      note.id === selectedId ? COLORS.accent : "transparent"
                    }`,
                    padding: "12px 18px 9px 16px",
                    marginBottom: 1,
                    marginTop: 1,
                    boxShadow:
                      note.id === selectedId
                        ? "0 1.5px 10px 0 rgba(255,215,0,0.06)"
                        : undefined,
                    transition: "background .18s"
                  }}
                  tabIndex={0}
                  onKeyDown={e =>
                    e.key === "Enter" ? handleSelectNote(note.id) : undefined
                  }
                  aria-label={`Select note: ${note.title}`}
                >
                  <div style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: COLORS.text,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}>
                    {note.title || <span style={{color:COLORS.textLight}}>Untitled</span>}
                  </div>
                  <div style={{
                    color: COLORS.primary,
                    background: "#e7f1ff",
                    display: "inline-block",
                    padding: "2.5px 11px",
                    borderRadius: 12,
                    fontSize: 12.3,
                    marginTop: 2
                  }}>
                    {note.category}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
        
        {/* Main Note Content Area */}
        <main
          style={{
            flex: 1,
            background: COLORS.noteBg,
            padding: 0,
            minWidth: 0,
            maxWidth: "100vw",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {isEditing ? (
            // ----------- Note Editor -------------
            <div style={{
              maxWidth: 650,
              margin: "38px auto 0 auto",
              background: COLORS.noteBg,
              borderRadius: 10,
              boxShadow: "0 2px 12px 0 rgba(74,144,226,0.07)",
              padding: "36px 34px 28px 34px",
              border: `1px solid ${COLORS.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 15
            }}>
              <input
                autoFocus
                type="text"
                placeholder="Note Title"
                maxLength={80}
                value={editState.title}
                onChange={e =>
                  setEditState(prev => ({ ...prev, title: e.target.value }))
                }
                style={{
                  fontWeight: 700,
                  fontSize: 23,
                  border: "none",
                  borderBottom: `1.5px solid ${COLORS.primary}`,
                  background: "transparent",
                  marginBottom: 6,
                  padding: "5px 1px 8px 1px",
                  outlineColor: COLORS.primary,
                  color: COLORS.text,
                }}
                aria-label="Note Title"
              />

              {/* Category dropdown & custom entry */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{color: COLORS.primary, fontSize:14, fontWeight: 600 }}>
                  Category:
                </label>
                <select
                  value={editState.category}
                  onChange={e =>
                    setEditState(prev => ({
                      ...prev,
                      category: e.target.value
                    }))
                  }
                  style={{
                    fontSize: 14,
                    borderRadius: 4,
                    border: `1px solid ${COLORS.border}`,
                    outline: COLORS.primary,
                    background: "#f5fbff",
                    color: COLORS.text,
                    padding: "4px 9px"
                  }}
                >
                  {categories.map(c => (
                    <option value={c} key={c}>{c}</option>
                  ))}
                  <option value="[custom]">[Add new...]</option>
                </select>
                {editState.category === "[custom]" && (
                  <input
                    type="text"
                    placeholder="Custom category"
                    value={categoryInput}
                    onChange={handleCategoryInput}
                    style={{
                      fontSize: 13.7,
                      marginLeft: 2,
                      padding: "3px 7px",
                      borderRadius: 4,
                      border: `1px solid ${COLORS.border}`,
                      background: "#f5fbff",
                      color: COLORS.text,
                    }}
                    aria-label="Custom category"
                  />
                )}
              </div>

              {/* Note content textarea */}
              <textarea
                placeholder="Write your note here..."
                rows={10}
                maxLength={4000}
                value={editState.content}
                onChange={e =>
                  setEditState(prev => ({ ...prev, content: e.target.value }))
                }
                style={{
                  resize: "vertical",
                  fontSize: 15,
                  borderRadius: 5,
                  border: `1px solid ${COLORS.border}`,
                  padding: "8px 13px",
                  fontFamily: "inherit",
                  color: COLORS.text,
                  background: "#f8fafc"
                }}
                aria-label="Note Content"
              />
              
              <div style={{ display: "flex", gap: 12, marginTop: 9 }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: COLORS.primary,
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 5,
                    padding: "8px 20px",
                    cursor: "pointer",
                    fontSize: 15,
                    transition: "background .16s"
                  }}
                >
                  {editState.id ? "Save Changes" : "Add Note"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setCategoryInput("");
                    if (editState.id) {
                      setSelectedId(editState.id); // revert to view mode
                    }
                  }}
                  style={{
                    background: COLORS.secondary,
                    color: COLORS.textLight,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 5,
                    padding: "7px 22px",
                    cursor: "pointer",
                    fontSize: 15
                  }}
                >
                  Cancel
                </button>
                {editState.id && (
                  <button
                    onClick={() => handleDeleteNote(editState.id)}
                    style={{
                      background: COLORS.delete,
                      color: "#fff",
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 5,
                      padding: "8px 18px",
                      cursor: "pointer",
                      fontSize: 15,
                      marginLeft: "auto"
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ) : selectedNote ? (
            // ----------- Note Viewer -------------
            <div style={{
              maxWidth: 700,
              margin: "40px auto 0 auto",
              background: COLORS.noteBg,
              borderRadius: 10,
              boxShadow: "0 2.5px 16px 0 rgba(74,144,226,0.10)",
              padding: "40px 38px 36px 38px",
              border: `1px solid ${COLORS.border}`,
              minHeight: 300,
              display: "flex",
              flexDirection: "column"
            }}>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                gap: 15,
                marginBottom: 13
              }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 25,
                    color: COLORS.text,
                    flex: 1,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}
                  title={selectedNote.title}
                >
                  {selectedNote.title || <span style={{color:COLORS.textLight}}>Untitled</span>}
                </div>
                <span style={{
                  color: COLORS.primary,
                  background: "#e5f1ff",
                  borderRadius: 13,
                  fontWeight: 500,
                  fontSize: 13.2,
                  padding: "4px 15px"
                }}>
                  {selectedNote.category}
                </span>
              </div>
              <div style={{
                color: COLORS.textLight,
                fontSize: 13.3,
                marginBottom: 17
              }}>
                Created:&nbsp;
                {selectedNote.createdAt
                  ? new Date(selectedNote.createdAt).toLocaleString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })
                  : ""}
              </div>
              <div style={{
                fontSize: 15.5,
                color: COLORS.text,
                whiteSpace: "pre-wrap",
                padding: "3px 1px",
                minHeight: 120
              }}>
                {selectedNote.content || <span style={{color:COLORS.textLight}}>No content yet.</span>}
              </div>
              <div style={{
                display: "flex",
                gap: 13,
                marginTop: 26
              }}>
                <button
                  onClick={() => handleEditNote(selectedNote)}
                  style={{
                    background: COLORS.primary,
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 5,
                    padding: "7.5px 24px",
                    cursor: "pointer",
                    fontSize: 15,
                    transition: "background .16s"
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  style={{
                    background: COLORS.delete,
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 5,
                    padding: "7.5px 22px",
                    cursor: "pointer",
                    fontSize: 15
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            // ----------- Empty State -------------
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 400,
              color: COLORS.textLight
            }}>
              <div style={{
                fontSize: 36,
                marginBottom: 11,
                color: COLORS.primary
              }}>
                📝
              </div>
              <div style={{ fontWeight: 600, fontSize: 20 }}>No note selected</div>
              <div style={{margin: "9px 0"}}>Create or select a note to get started.</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default NoteEaseMain;
