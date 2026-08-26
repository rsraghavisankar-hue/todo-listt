const STORAGE_KEY = 'todo-app-tasks';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const emptyState = document.getElementById('emptyState');
const filters = document.getElementById('filters');
const clearCompletedBtn = document.getElementById('clearCompleted');

let tasks = loadTasks();
let currentFilter = 'all';
let justCompletedId = null;
const celebrations = ['Yes!! 🎉', 'Nice one! ✨', 'Done! 💜', 'Woohoo! 🌸', 'Yay! 🩷'];

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Could not load tasks:', e);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Could not save tasks:', e);
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function addTask(text) {
  tasks.unshift({ id: uid(), text, completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) {
    t.completed = !t.completed;
    justCompletedId = t.completed ? id : null;
  }
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function editTask(id, newText) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  const trimmed = newText.trim();
  if (trimmed === '') {
    deleteTask(id);
    return;
  }
  t.text = trimmed;
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

function getFilteredTasks() {
  if (currentFilter === 'active') return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

function render() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = '';

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const checkbox = document.createElement('button');
    checkbox.className = 'task-checkbox' + (task.completed ? ' checked' : '');
    checkbox.setAttribute('aria-label', 'Toggle task completion');
    checkbox.addEventListener('click', () => toggleTask(task.id));

    const textEl = document.createElement('span');
    textEl.className = 'task-text';
    textEl.textContent = task.text;
    textEl.contentEditable = 'true';
    textEl.spellcheck = false;
    textEl.addEventListener('blur', () => editTask(task.id, textEl.textContent));
    textEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        textEl.blur();
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(textEl);
    li.appendChild(deleteBtn);

    if (task.id === justCompletedId) {
      li.classList.add('just-completed');
      const badge = document.createElement('span');
      badge.className = 'celebrate';
      badge.textContent = celebrations[Math.floor(Math.random() * celebrations.length)];
      li.appendChild(badge);
      requestAnimationFrame(() => badge.classList.add('show'));
      justCompletedId = null;
    }

    taskList.appendChild(li);
  });

  emptyState.classList.toggle('visible', tasks.length === 0);
  const openCount = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${openCount} open`;
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = taskInput.value.trim();
  if (value === '') return;
  addTask(value);
  taskInput.value = '';
  taskInput.focus();
});

filters.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
});

clearCompletedBtn.addEventListener('click', clearCompleted);

render();
