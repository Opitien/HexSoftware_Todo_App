/* Notes-style To-Do: Dark mode, Drag & Drop (handle), Categories, Progress bar */
/* Save as script.js and include with defer */

(() => {
  const STORAGE_KEY = 'notes_todos_v1';
  const THEME_KEY = 'notes_theme_v1';

  // DOM
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const categorySelect = document.getElementById('todo-category');
  const list = document.getElementById('todo-list');
  const countEl = document.getElementById('count');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const markAllBtn = document.getElementById('mark-all');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const categoryFilter = document.getElementById('category-filter');
  const themeToggle = document.getElementById('theme-toggle');

  let todos = load();
  let filter = 'all';
  let categoryView = 'all';

  // THEME
  function loadTheme() {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'dark') document.body.classList.add('dark');
  }
  function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'dark' : 'light');
  }
  themeToggle.addEventListener('click', toggleTheme);
  loadTheme();

  // UTIL
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  // default categories (for visual mapping)
  function categoryClass(cat){
    if (!cat) return 'other';
    const k = cat.toLowerCase();
    if (k.includes('work')) return 'work';
    if (k.includes('personal')) return 'personal';
    if (k.includes('home')) return 'home';
    if (k.includes('shop')) return 'shopping';
    if (k.includes('school')) return 'school';
    return 'other';
  }

  // CRUD
  function addTodo(text, category = 'Personal') {
    const t = text.trim();
    if (!t) return;
    if (t.length > 120) { alert('Max 120 chars'); return; }
    // prevent exact duplicate (case-insensitive)
    if (todos.some(x => x.text.trim().toLowerCase() === t.toLowerCase())) {
      alert('This task already exists.');
      return;
    }
    const item = { id: uid(), text: t, completed: false, category, createdAt: Date.now() };
    todos.unshift(item);
    save();
    render();
  }

  function toggleComplete(id) {
    todos = todos.map(x => x.id === id ? { ...x, completed: !x.completed } : x);
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(x => x.id !== id);
    save();
    render();
  }

  function editTodo(id, newText, newCategory) {
    const t = newText.trim();
    if (!t) return render();
    todos = todos.map(x => x.id === id ? { ...x, text: t, category: newCategory } : x);
    save();
    render();
  }

  function clearCompleted() {
    todos = todos.filter(x => !x.completed);
    save();
    render();
  }

  function markAll() {
    const allDone = todos.every(x => x.completed);
    todos = todos.map(x => ({ ...x, completed: !allDone }));
    save();
    render();
  }

  // FILTERS
  function setFilter(f) {
    filter = f;
    filterButtons.forEach(b => b.classList.toggle('active', b.dataset.filter === f));
    render();
  }

  function setCategoryFilter(c) {
    categoryView = c;
    render();
  }

  // PERSISTED ORDER: todos array order is the display order (newest first)

  // RENDER
  function visible() {
    let v = todos.slice();
    if (filter === 'active') v = v.filter(x => !x.completed);
    if (filter === 'completed') v = v.filter(x => x.completed);
    if (categoryView && categoryView !== 'all') v = v.filter(x => x.category === categoryView);
    return v;
  }

  function render() {
    list.innerHTML = '';
    const items = visible();

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No tasks — add one above.';
      list.appendChild(empty);
    } else {
      items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = item.id;
        li.draggable = true;

        // handle
        const handle = document.createElement('div');
        handle.className = 'handle';
        handle.setAttribute('aria-hidden', 'true');
        handle.innerText = '☰';
        li.appendChild(handle);

        // checkbox
        const cbWrap = document.createElement('label');
        cbWrap.className = 'checkbox';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = item.completed;
        cb.addEventListener('change', () => toggleComplete(item.id));
        cbWrap.appendChild(cb);
        li.appendChild(cbWrap);

        // main (text + chip)
        const main = document.createElement('div');
        main.className = 'todo-main';

        const chip = document.createElement('span');
        chip.className = 'chip ' + categoryClass(item.category);
        chip.textContent = item.category;

        const span = document.createElement('div');
        span.className = 'todo-text' + (item.completed ? ' completed' : '');
        span.title = item.text;
        span.textContent = item.text;
        span.style.minWidth = '0';

        // double click -> edit
        span.addEventListener('dblclick', () => openEditor(li, item));

        main.appendChild(chip);
        main.appendChild(span);
        li.appendChild(main);

        // actions
        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon';
        editBtn.title = 'Edit';
        editBtn.innerText = '✎';
        editBtn.addEventListener('click', () => openEditor(li, item));

        const delBtn = document.createElement('button');
        delBtn.className = 'icon';
        delBtn.title = 'Delete';
        delBtn.innerText = '✕';
        delBtn.addEventListener('click', () => {
          // small remove animation
          li.style.opacity = '0';
          li.style.transform = 'translateY(6px)';
          setTimeout(() => deleteTodo(item.id), 160);
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        li.appendChild(actions);

        // DRAG: only handle should start drag (visual improvement)
        handle.addEventListener('mousedown', e => {
          // allow dragstart on the li
          li.draggable = true;
        });

        // add drag event listeners (common)
        li.addEventListener('dragstart', dragStart);
        li.addEventListener('dragend', dragEnd);
        li.addEventListener('dragover', dragOver);
        li.addEventListener('drop', drop);

        list.appendChild(li);
      });
    }

    // stats/progress
    const remaining = todos.filter(t => !t.completed).length;
    countEl.textContent = `${remaining} remaining`;
    const pct = todos.length ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0;
    progressBar.style.width = pct + '%';
    progressText.textContent = `${pct}% done`;
  }

  // EDITOR (in-place)
  function openEditor(li, item) {
    const main = li.querySelector('.todo-main');
    const textEl = li.querySelector('.todo-text');
    const chip = li.querySelector('.chip');

    // create inputs
    const inputEdit = document.createElement('input');
    inputEdit.className = 'edit-input';
    inputEdit.value = item.text;
    inputEdit.maxLength = 120;

    const selectEdit = document.createElement('select');
    selectEdit.className = 'edit-input';
    ['Personal','Work','Home','Shopping','School','Other'].forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      if (c === item.category) o.selected = true;
      selectEdit.appendChild(o);
    });

    // save & cancel handlers
    function commit() {
      const v = inputEdit.value.trim();
      const c = selectEdit.value;
      if (!v) return render();
      editTodo(item.id, v, c);
    }
    function cancel() { render(); }

    inputEdit.addEventListener('keydown', e => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') cancel();
    });
    inputEdit.addEventListener('blur', commit);

    // replace main contents
    main.innerHTML = '';
    main.appendChild(selectEdit);
    main.appendChild(inputEdit);
    inputEdit.focus();
    inputEdit.select();
  }

  // DRAG & DROP HANDLERS
  let dragSrcEl = null;
  function dragStart(e) {
    dragSrcEl = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', this.dataset.id); } catch {}
  }
  function dragEnd() {
    this.classList.remove('dragging');
  }
  function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // visual cue
    const target = closestLi(e.target);
    if (!target || target === dragSrcEl) return;
    // insert placeholder logic: highlight
    const rect = target.getBoundingClientRect();
    const after = (e.clientY - rect.top) > (rect.height / 2);
    target.style.borderTop = '';
    target.style.borderBottom = '';
    if (after) {
      target.style.borderBottom = '2px dashed rgba(0,0,0,0.08)';
      target.style.borderTop = '';
    } else {
      target.style.borderTop = '2px dashed rgba(0,0,0,0.08)';
      target.style.borderBottom = '';
    }
  }
  function drop(e) {
    e.stopPropagation();
    const target = closestLi(e.target);
    if (!target || !dragSrcEl || target === dragSrcEl) return;
    // clean styles
    target.style.borderTop = '';
    target.style.borderBottom = '';

    // reorder todos array: remove dragSrc and insert before/after target based on pointer
    const srcId = dragSrcEl.dataset.id;
    const tgtId = target.dataset.id;

    const srcIndex = todos.findIndex(x => x.id === srcId);
    const tgtIndex = todos.findIndex(x => x.id === tgtId);
    if (srcIndex === -1 || tgtIndex === -1) return;

    // decide insertion point by mouse position
    const rect = target.getBoundingClientRect();
    const after = (e.clientY - rect.top) > (rect.height / 2);

    const [moved] = todos.splice(srcIndex, 1);
    const newIndex = (srcIndex < tgtIndex) ? (after ? tgtIndex : tgtIndex) : (after ? tgtIndex + 1 : tgtIndex);
    todos.splice(newIndex, 0, moved);
    save();
    render();
  }
  function closestLi(el) {
    while (el && el !== list) {
      if (el.matches && el.matches('li.todo-item')) return el;
      el = el.parentNode;
    }
    return null;
  }

  // EVENTS
  form.addEventListener('submit', e => {
    e.preventDefault();
    addTodo(input.value, categorySelect.value);
    input.value = '';
    input.focus();
  });

  filterButtons.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));
  categoryFilter.addEventListener('change', () => setCategoryFilter(categoryFilter.value));
  clearCompletedBtn.addEventListener('click', clearCompleted);
  markAllBtn.addEventListener('click', markAll);

  // keyboard shortcut to focus input
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); input.focus(); input.select();
    }
  });

  // initial render
  render();

  // expose for debugging (optional)
  window.__notes = {
    add: addTodo, all: () => todos, save
  };

})();
