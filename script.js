let characters = [];

document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const outer = JSON.parse(e.target.result);
      const data = JSON.parse(outer.data); // ВАЖНО

      const existingIndex = characters.findIndex(c => c.name.value === data.name.value);

if (existingIndex !== -1) {
  characters[existingIndex] = data; // обновление
} else {
  characters.push(data);
}

saveCharacters();
renderCharacterList();

      renderCharacterList();

    } catch (err) {
      alert("Ошибка загрузки JSON");
      console.error(err);
    }
  };

  reader.readAsText(file);
});

function renderCharacterList() {
  const list = document.getElementById('characterList');
  list.innerHTML = '';

  characters.forEach((char, index) => {
    const div = document.createElement('div');
    div.className = 'character-card';

    const name = char.name.value;
    const cls = char.info.charClass.value;
    const level = char.info.level.value;

    div.innerHTML = `
      <b>${name}</b> — ${cls} ${level} lvl
      <button onclick="deleteCharacter(${index}); event.stopPropagation();">
        ❌
      </button>
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

function showCharacter(index) {
  const char = characters[index];
  const view = document.getElementById('characterView');

  const stats = char.stats;
  const prof = char.proficiency;

  const maxHP = char.vitality["hp-max"].value;
  const currentHP = char.currentHP ?? maxHP;

  const ac = char.vitality.ac.value;
  const speed = char.vitality.speed.value;

  const conditionsList = ["Poisoned", "Stunned", "Blinded", "Charmed"];

  // --- характеристики ---
  let statsHTML = `<div class="stat-grid">`;

  for (let key in stats) {
    const s = stats[key];
    statsHTML += `
      <div class="box stat">
        <b>${key.toUpperCase()}</b><br>
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

    skillsHTML += `<li>${key}: ${total >= 0 ? '+' : ''}${total}</li>`;
  }
  skillsHTML += `</ul>`;

  // --- условия ---
  let conditionsHTML = '';
  conditionsList.forEach(c => {
    const active = char.conditions?.includes(c) ? 'active' : '';
    conditionsHTML += `
      <span class="condition ${active}" onclick="toggleCondition(${index}, '${c}')">
        ${c}
      </span>
    `;
  });

  // --- итог ---
  view.innerHTML = `
    <div class="character-sheet">

      <div class="header">
        <h2>${char.name.value}</h2>
        <div>
          ${char.info.charClass.value} ${char.info.level.value}
        </div>
      </div>

      <div class="stats-bar">
        <div class="box">
          HP<br>
          <input class="hp-input"
            value="${currentHP}"
            onchange="updateHP(${index}, this.value)"> / ${maxHP}
        </div>

        <div class="box">
          AC<br>${ac}
        </div>

        <div class="box">
          Speed<br>${speed}
        </div>
      </div>

      ${statsHTML}

      <div class="section box">
        <h3>Навыки</h3>
        ${skillsHTML}
      </div>

      <div class="section box">
        <h3>Состояния</h3>
        ${conditionsHTML}
      </div>

    </div>
  `;
}

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

function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

loadCharacters();
