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
  const saves = char.saves;
  const skills = char.skills;
  const prof = char.proficiency;

  const hp = char.vitality["hp-max"].value;
  const ac = char.vitality.ac.value;
  const speed = char.vitality.speed.value;

  // --- Характеристики ---
  let statsHTML = `<h3>Характеристики</h3><ul>`;
  for (let key in stats) {
    const s = stats[key];
    statsHTML += `<li>${key.toUpperCase()}: ${s.score} (мод: ${s.modifier >= 0 ? '+' : ''}${s.modifier})</li>`;
  }
  statsHTML += `</ul>`;

  // --- Спасброски ---
  let savesHTML = `<h3>Спасброски</h3><ul>`;
  for (let key in saves) {
    const mod = stats[key].modifier + (saves[key].isProf ? prof : 0);
    savesHTML += `<li>${key.toUpperCase()}: ${mod >= 0 ? '+' : ''}${mod}</li>`;
  }
  savesHTML += `</ul>`;

  // --- Навыки ---
  let skillsHTML = `<h3>Навыки</h3><ul>`;
  for (let key in skills) {
    const skill = skills[key];
    const baseStat = stats[skill.baseStat].modifier;
    const bonus = skill.isProf ? prof : 0;
    const total = baseStat + bonus;

    skillsHTML += `<li>${key}: ${total >= 0 ? '+' : ''}${total}</li>`;
  }
  skillsHTML += `</ul>`;

  // --- Оружие ---
  let weaponsHTML = `<h3>Оружие</h3><ul>`;
  char.weaponsList.forEach(w => {
    weaponsHTML += `<li>${w.name.value} — ${w.dmg.value}</li>`;
  });
  weaponsHTML += `</ul>`;

  // --- Функция для вытаскивания текста ---
  function extractText(block) {
    if (!block?.value?.data?.content) return '';
    let result = '';

    block.value.data.content.forEach(p => {
      if (p.content) {
        p.content.forEach(t => {
          if (t.text) result += t.text;
        });
      }
      result += '<br>';
    });

    return result;
  }

  const traits = extractText(char.text.traits);
  const profs = extractText(char.text.prof);
  const equipment = extractText(char.text.equipment);
  const attacks = extractText(char.text.attacks);
  const feats = extractText(char.text.feats);

  // --- Итог ---
  view.innerHTML = `
    <h2>${char.name.value}</h2>

    <p><b>${char.info.charClass.value} ${char.info.level.value}</b></p>
    <p>${char.info.race.value}</p>

    <h3>Бой</h3>
    <p>HP: ${hp}</p>
    <p>AC: ${ac}</p>
    <p>Speed: ${speed}</p>

    ${statsHTML}
    ${savesHTML}
    ${skillsHTML}
    ${weaponsHTML}

    <h3>Черты и способности</h3>
    <p>${traits}</p>

    <h3>Владения</h3>
    <p>${profs}</p>

    <h3>Снаряжение</h3>
    <p>${equipment}</p>

    <h3>Особенности</h3>
    <p>${attacks}</p>

    <h3>Фиты</h3>
    <p>${feats}</p>
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

function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

loadCharacters();
