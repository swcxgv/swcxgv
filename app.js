const STORAGE_KEY = "offline-todo-list";

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const themeToggle = document.querySelector("#theme-toggle");
const filterButtons = document.querySelectorAll(".filter-button");
const THEME_STORAGE_KEY = "offline-todo-theme";

let todos = loadTodos();
let currentFilter = "all";

// 從瀏覽器儲存空間讀取待辦資料。
function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    const parsedTodos = savedTodos ? JSON.parse(savedTodos) : [];
    return Array.isArray(parsedTodos) ? parsedTodos : [];
  } catch (error) {
    return [];
  }
}

// 儲存最新的待辦資料，讓重新整理後仍能保留內容。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 取得使用者偏好的主題，沒有手動選擇時沿用作業系統設定。
function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// 套用主題並更新切換按鈕的圖示與文字。
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  themeToggle.textContent = isDark ? "☀️ 淺色模式" : "🌙 深色模式";
  themeToggle.setAttribute("aria-label", isDark ? "切換至淺色模式" : "切換至深色模式");
}

// 依目前篩選條件取得要顯示的待辦事項。
function getVisibleTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }
  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
}

// 將目前的待辦資料重新繪製到畫面上。
function renderTodos() {
  todoList.replaceChildren();

  getVisibleTodos().forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.completed) {
      item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.className = "todo-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `完成待辦事項：${todo.text}`);
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "刪除";
    deleteButton.setAttribute("aria-label", `刪除待辦事項：${todo.text}`);
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    item.append(checkbox, text, deleteButton);
    todoList.append(item);
  });

  emptyState.hidden = getVisibleTodos().length > 0;
  if (todos.length === 0) {
    emptyState.textContent = "還沒有任何待辦事項，新增一個吧!";
  } else if (currentFilter === "active") {
    emptyState.textContent = "太棒了，目前沒有未完成的待辦事項!";
  } else if (currentFilter === "completed") {
    emptyState.textContent = "目前沒有已完成的待辦事項。";
  }
  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
}

function addTodo(text) {
  todos.push({
    id: Date.now(),
    text,
    completed: false,
  });
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((todo) => (
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();

  if (!text) {
    todoInput.focus();
    return;
  }

  addTodo(text);
  todoInput.value = "";
  todoInput.focus();
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle("active", filterButton === button);
    });
    renderTodos();
  });
});

applyTheme(getInitialTheme());
renderTodos();
