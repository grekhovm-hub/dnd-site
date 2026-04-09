// =====================
// ТАБЫ
// =====================
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// =====================
// ПЕРСОНАЖИ
// =====================
let characters = [];

function saveCharacters() {
  localStorage.setItem('characters', JSON.stringify(characters));
}

function loadCharacters() {
  const data = localStorage.getItem('characters');
  if (data) {
    characters = JSON.parse(data);
    renderCharacterList();
  }
}

// загрузка JSON
document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(ev) {
    try {
      const outer = JSON.parse(ev.target.result);
      const data = JSON.parse(outer.data);

      // обновление или добавление
      const existingIndex = characters.findIndex(c => c.name.value === data.name.value);

      if (existingIndex !== -1) {
        characters[existingIndex] = data;
      } else {
        characters.push(data);
      }

      saveCharacters();
      renderCharacterList();

      // фикс бага input
      e.target.value = "";

    } catch {
      alert("Ошибка JSON");
    }
  };

  reader.readAsText(file);
});

// список
function renderCharacterList() {
  const list = document.getElementById('characterList');
  list.innerHTML = '';

  characters.forEach((char, index) => {
    const div = document.createElement('div');
    div.className = 'character-card';

    div.innerHTML = `
      <b>${char.name.value}</b>
      <button onclick="deleteCharacter(${index}); event.stopPropagation()">❌</button>
    `;

    div.onclick = () => showCharacter(index);
    list.appendChild(div);
  });
}

function deleteCharacter(index) {
  characters.splice(index, 1);
  saveCharacters();
  renderCharacterList();
  document.getElementById('characterView').innerHTML = '';
}

function updateHP(index, value) {
  characters[index].currentHP = value;
  saveCharacters();
}

// просмотр
function showCharacter(index) {
  const char = characters[index];
  const view = document.getElementById('characterView');

  const hp = char.currentHP ?? char.vitality["hp-max"].value;
  const ac = char.vitality.ac.value;

  view.innerHTML = `
    <h2>${char.name.value}</h2>
    <p>${char.info.charClass.value} ${char.info.level.value}</p>

    <p>Хиты:
      <input value="${hp}" onchange="updateHP(${index}, this.value)">
    </p>

    <p>КЗ: ${ac}</p>
  `;
}

// =====================
// БОЙ
// =====================
let combat = [];

// цвета
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

function deleteCombatRow(index) {
  combat.splice(index, 1);
  saveCombat();
  renderCombat();
}

function duplicateCombatRow(index) {
  combat.push({ ...combat[index] });
  saveCombat();
  renderCombat();
}

function updateCombatField(index, field, value) {
  combat[index][field] = field === "initiative" ? Number(value) : value;
  sortCombat();
  saveCombat();
  renderCombat();
}

function sortCombat() {
  combat.sort((a, b) => b.initiative - a.initiative);
}

// выбор персонажа
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

// 🎨 КАСТОМНЫЙ ВЫБОР ЦВЕТА (ВАЖНО)
function getColorPicker(index, currentColor) {
  let html = `<div class="color-picker">`;

  colors.forEach(c => {
    html += `
      <div class="color-box"
        style="background:${c}; ${c === currentColor ? 'outline:2px solid white;' : ''}"
        onclick="updateColor(${index}, '${c}')">
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

function updateColor(index, color) {
  combat[index].color = color;
  saveCombat();
  renderCombat();
}

// рендер
function renderCombat() {
  const tbody = document.querySelector("#combatTable tbody");
  tbody.innerHTML = '';

  combat.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = row.color;

    tr.innerHTML = `
      <td>${getColorPicker(index, row.color)}</td>

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
        <span onclick="duplicateCombatRow(${index})">📄</span>
        <span class="delete-btn" onclick="deleteCombatRow(${index})">❌</span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// =====================
loadCharacters();
loadCombat();
