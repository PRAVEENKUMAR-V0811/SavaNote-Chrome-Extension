document.addEventListener("DOMContentLoaded", () => {
  const quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: "#editor-toolbar"
    },
    placeholder: "Write your note here...",
  });

  const saveBtn = document.getElementById("saveNote");
  const statusMessage = document.getElementById("statusMessage");
  const clearAllNotesBtn = document.getElementById("clearAllNotes");
  const notesContainer = document.getElementById("notesContainer");

  let notes = [];
  let showAll = false;
  let editingIndex = null;

  function renderNotes(notes) {
    notesContainer.innerHTML = "";
  
    const notesToDisplay = showAll ? notes : notes.slice(0, 5);
  
    notesToDisplay.forEach((note, index) => {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note";
      noteDiv.dataset.index = index;
      noteDiv.innerHTML = `
        <div class="note-content">${note}</div>
        <div class="note-actions">
          <button class="edit-note"><img src="./edit.png" class="edit-note"/></button>
          <button class="delete-note"><img src="./bin.png" class="delete-note"/></button>
        </div>
      `;
      notesContainer.appendChild(noteDiv);
    });
  
    // Toggle Clear All Notes button
    clearAllNotesBtn.style.display = notes.length > 1 ? "block" : "none";
  
    // Show More / Show Less button if there are more than 5 notes
    const moreBtnExists = document.getElementById("moreBtn");
    if (notes.length > 5) {
      const moreBtn = document.createElement("button");
      moreBtn.id = "moreBtn";
      moreBtn.className = "more-btn";
      moreBtn.textContent = showAll ? "Show Less" : "More";
      moreBtn.addEventListener("click", () => {
        showAll = !showAll;
        renderNotes(notes); // re-render notes based on new state
      });
      notesContainer.appendChild(moreBtn);
    }
  }
  

  // Function to save notes to storage
  function saveNotes(notes) {
    chrome.storage.local.set({ notes });
  }

  // Get notes from Chrome storage and render them
  chrome.storage.local.get(["notes"], (result) => {
    notes = result.notes || [];
    renderNotes(notes);
  });

  saveBtn.addEventListener("click", () => {
    const content = quill.root.innerHTML.trim();
    if (content === "<p><br></p>" || content === "") {
      statusMessage.textContent = "Note cannot be empty!";
      statusMessage.style.color = "red";
      statusMessage.style.display = "block";
      return;
    }
  
    if (editingIndex !== null) {
      notes.splice(editingIndex, 1); // remove old note
      notes.unshift(content);        // insert edited note at top
      editingIndex = null;           // reset editing state
    } else {
      notes.unshift(content);        // add new note at top
    }
  
    saveNotes(notes);
    renderNotes(notes);
  
    statusMessage.textContent = "Note Saved!";
    statusMessage.classList.add("saved");
    statusMessage.style.color = "green";
    statusMessage.style.display = "block";
    setTimeout(() => statusMessage.style.display = "none", 2000);
    quill.root.innerHTML = "";
  });
  

  // Clear all notes
  clearAllNotesBtn.addEventListener("click", () => {
    chrome.storage.local.set({ notes: [] });
    notes = [];
    renderNotes(notes);
    statusMessage.textContent = "All Notes Cleared!";
    statusMessage.classList.add("deleted");
    statusMessage.style.color = "red";  // 'All Notes Cleared' in red
    statusMessage.style.display = "block";
    setTimeout(() => statusMessage.style.display = "none", 2000);
  });

  // Event listener for editing and deleting notes
  notesContainer.addEventListener("click", (e) => {
    const noteEl = e.target.closest(".note");
    if (!noteEl) return;
    const index = parseInt(noteEl.dataset.index);

    chrome.storage.local.get(["notes"], (result) => {
      let notes = result.notes || [];

      if (e.target.classList.contains("delete-note")) {
        notes.splice(index, 1);  // Delete the note at the index
        saveNotes(notes);
        renderNotes(notes);

        statusMessage.textContent = "Note Deleted!";
        statusMessage.classList.add("deleted");
        statusMessage.style.color = "red";  // 'Note Deleted' in red
        statusMessage.style.display = "block";
        setTimeout(() => statusMessage.style.display = "none", 2000);
      } else if (e.target.classList.contains("edit-note")) {
        // Edit the note and move it to the top of the list
        quill.root.innerHTML = notes[index];
        editingIndex = index; // Set which note is being edited
        saveNotes(notes);
        renderNotes(notes);
      }
    });
  });
});

  // Function to save notes to storage
  function saveNotes(notes) {
    chrome.storage.local.set({ notes });
  }

  // Get notes from Chrome storage and render them
  chrome.storage.local.get(["notes"], (result) => {
    const notes = result.notes || [];
    renderNotes(notes);
  });

  // Event listener to save a new note
  saveBtn.addEventListener("click", () => {
    const content = quill.root.innerHTML.trim();
    if (content === "<p><br></p>" || content === "") {
      statusMessage.textContent = "Note cannot be empty!";
      statusMessage.style.color = "red";
      statusMessage.style.display = "block";
      return;
    }

    chrome.storage.local.get(["notes"], (result) => {
      const notes = result.notes || [];
      // Insert new note at the beginning of the array
      notes.unshift(content);
      saveNotes(notes);
      renderNotes(notes);
      statusMessage.textContent = "Note Saved!";
      statusMessage.classList.add("saved");
      statusMessage.style.color = "green"; // Note saved in green color
      statusMessage.style.display = "block";
      setTimeout(() => statusMessage.style.display = "none", 2000);
      quill.root.innerHTML = "";
    });
  });

  // Clear all notes
  clearAllNotesBtn.addEventListener("click", () => {
    chrome.storage.local.set({ notes: [] });
    renderNotes([]);
    statusMessage.textContent = "All Notes Cleared!";
    statusMessage.classList.add("deleted");
    statusMessage.style.color = "red";  // 'All Notes Cleared' in red
    statusMessage.style.display = "block";
    setTimeout(() => statusMessage.style.display = "none", 2000);
  });

  // Event listener for editing and deleting notes
  notesContainer.addEventListener("click", (e) => {
    const noteEl = e.target.closest(".note");
    if (!noteEl) return;
    const index = parseInt(noteEl.dataset.index);

    chrome.storage.local.get(["notes"], (result) => {
      let notes = result.notes || [];

      if (e.target.classList.contains("delete-note")) {
        notes.splice(index, 1);
        saveNotes(notes);
        renderNotes(notes);
        statusMessage.textContent = "Note Deleted!";
        statusMessage.classList.add("deleted");
        statusMessage.style.color = "red";  // 'Note Deleted' in red
        statusMessage.style.display = "block";
        setTimeout(() => statusMessage.style.display = "none", 2000);
      } else if (e.target.classList.contains("edit-note")) {
        quill.root.innerHTML = notes[index];
        notes.splice(index, 1);
        saveNotes(notes);
        renderNotes(notes);
      }
    });
});