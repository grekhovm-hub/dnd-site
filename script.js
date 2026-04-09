// =====================
// ТАБЫ
// =====================
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// =====================
// ПЕРСОНАЖИ (минимум для работы)
// =====================
let characters = [];

function loadCharacters() {
  const data = localStorage.getItem('characters');
  if (data) characters = JSON.parse(data);
}

// =====================
// БОЙ
// =====================
let combat = [];

// 🎨 цвета
const colors = [
  "#1f2937","#374151","#4b5563","#1e3a8a","#1e40af",
  "#064e3b","#065f46","#78350f","#92400e","#7f1d1d",
  "#991b1b","#581c87","#6b21a8","#0f172a","#111827",
  "#3f6212","#365314","#134e4a","#164e63","#312e81"
];

function saveCombat() {
  localStorage.setItem('combat', JSON.stringify(combat));
}

function loadCombat() {
  const data = localStorage.getItem('combat');
  if (data) {
    combat = JSON.parse(data);
    renderCombat();
  }
}

// ➕ добавить
function addCombatRow() {
  combat.push({
    name: "",
    initiative: 0,
    hp: "",
    ac: "",
    color: colors[0]
  });

  saveCombat();
  renderCombat();
}

// ❌ удалить
function deleteCombatRow(index) {
  combat.splice(index, 1);
  saveCombat();
  renderCombat();
}

// 📄 дублировать
function duplicateCombatRow(index) {
  combat.push({ ...combat[index] });

  saveCombat();
  renderCombat();
}

// ✏️ обновление
function updateCombatField(index, field, value) {
  combat[index][field] = field === "initiative" ? Number(value) : value;

  sortCombat();
  saveCombat();
  renderCombat();
}

// 🎨 цвет
function updateColor(index, value) {
  combat[index].color = value;
  saveCombat();
  renderCombat();
}

// 🔽 сортировка
function sortCombat() {
  combat.sort((a, b) => b.initiative - a.initiative);
}

// 👇 выбор персонажа
function selectCharacter(index, charIndex) {
  if (charIndex === "") return;

  const char = characters[charIndex];

  combat[index].name = char.name.value;
  combat[index].hp = char.currentHP ?? char.vitality["hp-max"].value;
  combat[index].ac = char.vitality.ac.value;

  saveCombat();
  renderCombat();
}

// список персонажей
function getCharacterSelect(index, currentName) {
  let html = `<select onchange="selectCharacter(${index}, this.value)">`;
  html += `<option value="">${currentName || "Выбрать"}</option>`;

  characters.forEach((char, i) => {
    html += `<option value="${i}">${char.name.value}</option>`;
  });

  html += `</select>`;
  return html;
}

// 🎨 цветной select (ВАЖНО)
function getColorSelect(index, currentColor) {
  let html = `<select class="color-select"
      style="background:${currentColor}"
      onchange="updateColor(${index}, this.value)">`;

  colors.forEach(c => {
    html += `<option value="${c}"></option>`;
  });

  html += `</select>`;
  return html;
}

// 🎨 рендер
function renderCombat() {
  const tbody = document.querySelector("#combatTable tbody");
  tbody.innerHTML = '';

  combat.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = row.color;

    tr.innerHTML = `
      <td>${getColorSelect(index, row.color)}</td>

      <td>${getCharacterSelect(index, row.name)}</td>

      <td>
        <input type="number" value="${row.initiative}"
          onchange="updateCombatField(${index}, 'initiative', this.value)">
      </td>

      <td>
        <input value="${row.hp}"
          onchange="updateCombatField(${index}, 'hp', this.value)">
      </td>

      <td>
        <input value="${row.ac}"
          onchange="updateCombatField(${index}, 'ac', this.value)">
      </td>

      <td>
        <span class="copy-btn" onclick="duplicateCombatRow(${index})">📄</span>
        <span class="delete-btn" onclick="deleteCombatRow(${index})">❌</span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// =====================
loadCharacters();
loadCombat();
