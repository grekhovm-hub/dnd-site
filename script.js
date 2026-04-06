// =====================
// ПЕРЕВОДЫ
// =====================
const statNames = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МУД",
  cha: "ХАР"
};

const skillNames = {
  acrobatics: "Акробатика",
  investigation: "Расследование",
  athletics: "Атлетика",
  perception: "Восприятие",
  survival: "Выживание",
  performance: "Выступление",
  intimidation: "Запугивание",
  history: "История",
  sleightofhand: "Ловкость рук",
  arcana: "Магия",
  medicine: "Медицина",
  deception: "Обман",
  nature: "Природа",
  insight: "Проницательность",
  religion: "Религия",
  stealth: "Скрытность",
  persuasion: "Убеждение",
  animalhandling: "Уход за животными"
};

// =====================
// БАЗА ЗАКЛИНАНИЙ (ПРИМЕР)
// =====================
const spellDatabase = {
  "acid-splash": {
    name: "Брызги кислоты",
    level: 0,
    school: "Вызов",
    range: "60 футов",
    castTime: "Мгновенная",
    desc: "Вы создаете пузырь кислоты..."
  }
};

// =====================
// ХРАНЕНИЕ
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

// =====================
// ЗАГРУЗКА JSON
// =====================
document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const outer = JSON.parse(e.target.result);
      const data = JSON.parse(outer.data);

      const existingIndex = characters.findIndex(c => c.name.value === data.name.value);

      if (existingIndex !== -1) {
        characters[existingIndex] = data;
      } else {
        characters.push(data);
      }

      saveCharacters();
      renderCharacterList();

    } catch (err) {
      alert("Ошибка загрузки JSON");
    }
  };

  reader.readAsText(file);
});

// =====================
// СПИСОК
// =====================
function renderCharacterList() {
  const list = document.getElementById('characterList');
  list.innerHTML = '';

  characters.forEach((char, index) => {
    const div = document.createElement('div');
    div.className = 'character-card';

    div.innerHTML = `
      <b>${char.name.value}</b> — ${char.info.charClass.value} ${char.info.level.value}
      <button onclick="deleteCharacter(${index}); event.stopPropagation();">❌</button>
    `;

    div.onclick = () => showCharacter(index);
    list.appendChild(div);
  });
}

function deleteCharacter(index) {
  if (!confirm("Удалить персонажа?")) return;

  characters.splice(index, 1);
  saveCharacters();
  renderCharacterList();
  document.getElementById('characterView').innerHTML = '';
}

// =====================
// HP И СОСТОЯНИЯ
// =====================
function updateHP(index, value) {
  characters[index].currentHP = value;
  saveCharacters();
}

function toggleCondition(index, condition) {
  if (!characters[index].conditions) {
    characters[index].conditions = [];
  }

  const i = characters[index].conditions.indexOf(condition);

  if (i === -1) {
    characters[index].conditions.push(condition);
  } else {
    characters[index].conditions.splice(i, 1);
  }

  saveCharacters();
  showCharacter(index);
}

// =====================
// ТЕКСТ
// =====================
function extractText(block) {
  if (!block?.value?.data?.content) return '';

  let result = '';

  block.value.data.content.forEach(p => {
    if (p.content) {
      p.content.forEach(t => {
        if (t.text) {
          if (t.marks?.some(m => m.type === "bold")) {
            result += `<b>${t.text}</b>`;
          } else {
            result += t.text;
          }
        }
      });
    }
    result += '<br>';
  });

  return result;
}

// =====================
// ЗАКЛИНАНИЯ
// =====================
function renderSpells(char) {
  const prepared = char.spells?.prepared || [];

  if (prepared.length === 0) return "<p>Нет заклинаний</p>";

  let html = `<div class="section"><h3>Заклинания</h3>`;

  prepared.forEach(id => {
    const spell = spellDatabase[id];

    if (!spell) {
      html += `<div class="box">Неизвестное заклинание (${id})</div>`;
      return;
    }

    html += `
      <div class="box">
        <b>${spell.name}</b><br>
        ${spell.school} | ${spell.range} | ${spell.castTime}<br><br>
        ${spell.desc}
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

// =====================
// UI
// =====================
function showCharacter(index) {
  const char = characters[index];
  const view = document.getElementById('characterView');

  const stats = char.stats;
  const prof = char.proficiency;

  const maxHP = char.vitality["hp-max"].value;
  const currentHP = char.currentHP ?? maxHP;

  const ac = char.vitality.ac.value;
  const speed = char.vitality.speed.value;

  // --- характеристики ---
  let statsHTML = `<div class="stat-grid">`;

  for (let key in stats) {
    const s = stats[key];
    statsHTML += `
      <div class="box stat">
        <b>${statNames[key]}</b><br>
        ${s.score}<br>
        (${s.modifier >= 0 ? '+' : ''}${s.modifier})
      </div>
    `;
  }

  statsHTML += `</div>`;

  // --- навыки ---
  let skillsHTML = `<ul>`;
  for (let key in char.skills) {
    const skill = char.skills[key];
    const base = stats[skill.baseStat].modifier;
    const bonus = skill.isProf ? prof : 0;
    const total = base + bonus;

    const name = skillNames[key] || key;

    skillsHTML += `<li>${name}: ${total >= 0 ? '+' : ''}${total}</li>`;
  }
  skillsHTML += `</ul>`;

  // --- текст ---
  const traits = extractText(char.text.traits);
  const profs = extractText(char.text.prof);
  const attacks = extractText(char.text.attacks);
  const feats = extractText(char.text.feats);

  view.innerHTML = `
    <div class="character-sheet">

      <div class="header">
        <h2>${char.name.value}</h2>
        <div>${char.info.charClass.value} ${char.info.level.value}</div>
      </div>

      <div class="stats-bar">
        <div class="box">
          Хиты<br>
          <input class="hp-input"
            value="${currentHP}"
            onchange="updateHP(${index}, this.value)"> / ${maxHP}
        </div>

        <div class="box">
          КЗ<br>${ac}
        </div>

        <div class="box">
          Скорость<br>${speed}
        </div>
      </div>

      ${statsHTML}

      <div class="section box">
        <h3>Навыки</h3>
        ${skillsHTML}
      </div>

      ${renderSpells(char)}

      <div class="section box">
        <h3>Способности и черты</h3>
        ${traits}
      </div>

      <div class="section box">
        <h3>Владения</h3>
        ${profs}
      </div>

      <div class="section box">
        <h3>Особенности</h3>
        ${attacks}
      </div>

      <div class="section box">
        <h3>Фиты</h3>
        ${feats}
      </div>

    </div>
  `;
}

// =====================
loadCharacters();
