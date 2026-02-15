const STORAGE_KEY = "test-memo-app:v1";

const form = document.getElementById("memo-form");
const input = document.getElementById("memo-input");
const list = document.getElementById("memo-list");
const empty = document.getElementById("empty");

const loadMemos = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveMemos = (memos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
};

let memos = loadMemos();

const render = () => {
  list.innerHTML = "";

  memos.forEach((memo) => {
    const li = document.createElement("li");
    li.className = "memo-item";

    const text = document.createElement("span");
    text.textContent = memo.text;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "削除";
    removeBtn.addEventListener("click", () => {
      memos = memos.filter((m) => m.id !== memo.id);
      saveMemos(memos);
      render();
    });

    li.append(text, removeBtn);
    list.append(li);
  });

  empty.style.display = memos.length ? "none" : "block";
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  memos.unshift({ id: crypto.randomUUID(), text });
  saveMemos(memos);
  render();

  input.value = "";
  input.focus();
});

render();
