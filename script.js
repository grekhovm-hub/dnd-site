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
  const hp = char.vitality["hp-max"].value;
  const ac = char.vitality.ac.value;
  const speed = char.vitality.speed.value;

  view.innerHTML = `
    <h2>${char.name.value}</h2>
    <p><b>Класс:</b> ${char.info.charClass.value}</p>
    <p><b>Раса:</b> ${char.info.race.value}</p>

    <h3>Характеристики</h3>
    <ul>
      <li>STR: ${stats.str.score}</li>
      <li>DEX: ${stats.dex.score}</li>
      <li>CON: ${stats.con.score}</li>
      <li>INT: ${stats.int.score}</li>
      <li>WIS: ${stats.wis.score}</li>
      <li>CHA: ${stats.cha.score}</li>
    </ul>

    <h3>Бой</h3>
    <p>HP: ${hp}</p>
    <p>AC: ${ac}</p>
    <p>Speed: ${speed}</p>
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