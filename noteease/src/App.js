import React from 'react';
import './App.css';
import NoteEaseMain from './NoteEaseMain';

/*
  App.js is now the entrypoint for NoteEase.
  Renders the main NoteEase container (sidebar + main content layout).
*/

function App() {
  return (
    <div className="app" style={{ background: "#F5F7FA", minHeight: "100vh" }}>
      <NoteEaseMain />
    </div>
  );
}

export default App;