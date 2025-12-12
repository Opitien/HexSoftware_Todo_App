# 📒 Apple-Style To-Do App

A beautifully minimal task manager inspired by the **iOS Notes UI** — featuring dark mode, drag-and-drop sorting, categories, animations, and a progress bar.
Clean, lightweight, and built with **HTML, CSS, and JavaScript** — no frameworks.

---

## ✨ Features

### 🍎 **Apple-Inspired UI (iOS Notes Style)**

Smooth rounded cards, soft shadows, creamy backgrounds, warm yellow accents, and perfect spacing.

### 🌗 **Dark Mode Toggle**

* Automatic smooth theme transition
* Stored in `localStorage`
* Fully custom Apple-like palette

### 🎨 **Task Categories**

Each task can be tagged under:

* Work
* Personal
* School
* Home
* Other

Color-coded with subtle badges just like Apple Reminders.

### 🔄 **Drag & Drop Sorting**

* Native HTML Drag API
* Reorder tasks smoothly
* Drag handle appears on hover
* Saved instantly to localStorage

### 📊 **Animated Progress Bar**

* Shows completion percentage
* Automatically updates as tasks are checked
* Subtle Apple animation

### ✏️ **Inline Editing**

* Double-click text to edit
* Press **Enter** to save, **Esc** to cancel

### 💾 **LocalStorage Persistence**

Your tasks, preferences, categories, and sorting order are all saved automatically.

---

## 📁 Project Structure

```
/
├── index.html       # UI structure
├── style.css        # Apple-style design system
└── script.js        # Logic + Drag & drop + State mgmt
```

---

## 🚀 Getting Started

### 1. Clone or download the project

```bash
git clone https://github.com/yourname/apple-todo-app.git
```

### 2. Open the app

Just open the file in any browser:

```
index.html
```

No build process. No dependencies.

---

## 🖌️ Customization

### Change categories

You can edit the category list inside `script.js`:

```js
const CATEGORIES = ["Work", "Personal", "School", "Home", "Other"];
```

### Change theme colors

Modify them in `:root` inside `style.css`.

---

## 📱 Responsive

The UI adapts beautifully to:

* iPhone
* iPad
* Desktop Mac

With proper spacing, tap sizes, and smooth transitions.
