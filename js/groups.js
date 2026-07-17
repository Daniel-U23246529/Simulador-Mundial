
function renderGroupsSummary() {
    Object.keys(TOURNAMENT.groups).forEach(gKey => {
        const standings = calcStandings(gKey);
        const list = document.getElementById(`summary-${gKey}`);
        list.innerHTML = '';

        standings.forEach((team, index) => {
            const qualified = index < 2;
            const li = document.createElement('li');
            li.className = `group-team-item${qualified ? ' group-team-item--qualified' : ''}`;
            li.innerHTML = `
        <span class="group-team-item__position">${index + 1}</span>
        <span class="group-team-item__code">${team.code}</span>
        <span class="group-team-item__name">${team.name}</span>
        <span class="group-team-item__pts">${team.pts} pts</span>
      `;
            list.appendChild(li);
        });
    });
}

function renderGroupDetail(groupKey) {
    const group = TOURNAMENT.groups[groupKey];

    // Título
    document.getElementById('group-detail-title').textContent = group.name;

    // ---- Partidos por fecha ----
    const container = document.getElementById('matches-container');
    container.innerHTML = '';

    const dates = [1, 2, 3];
    dates.forEach(dateNum => {
        const dateMatches = group.matches.filter(m => m.date === dateNum);

        const block = document.createElement('div');
        block.className = 'date-block';
        block.innerHTML = `<p class="date-block__label">FECHA ${dateNum}</p>`;

        const matchesWrap = document.createElement('div');
        matchesWrap.className = 'date-block__matches';

        dateMatches.forEach((match, _) => {
            const homeTeam = group.teams.find(t => t.code === match.home);
            const awayTeam = group.teams.find(t => t.code === match.away);
            const played   = match.result !== null;

            const card = document.createElement('div');
            card.className = 'match-card';

            const scoreText = played
                ? `${match.result.homeGoals} – ${match.result.awayGoals}`
                : '';

            card.innerHTML = `
        <div class="match-card__teams">
          <div class="match-card__team">
            <span class="match-card__team-code">${homeTeam.code}</span>
            <span class="match-card__team-name">${homeTeam.name}</span>
          </div>
          <span class="match-card__vs">VS</span>
          <div class="match-card__team">
            <span class="match-card__team-code">${awayTeam.code}</span>
            <span class="match-card__team-name">${awayTeam.name}</span>
          </div>
        </div>
        ${played ? `<p class="match-card__score">${scoreText}</p>` : ''}
        <button class="match-card__btn${played ? ' match-card__btn--played' : ''}"
                data-group="${groupKey}"
                data-match-index="${group.matches.indexOf(match)}">
          ${played ? ' Editar resultado' : '+ Ingresar resultado'}
        </button>
      `;

            matchesWrap.appendChild(card);
        });

        block.appendChild(matchesWrap);
        container.appendChild(block);
    });

    // ---- Tabla de posiciones ----
    renderStandingsTable(groupKey);
}


function renderStandingsTable(groupKey) {
    const standings = calcStandings(groupKey);
    const tbody = document.getElementById('standings-body');
    tbody.innerHTML = '';

    standings.forEach((team, index) => {
        const qualified = index < 2;
        const dg = team.gf - team.gc;
        const dgText = dg > 0 ? `+${dg}` : `${dg}`;

        const tr = document.createElement('tr');
        tr.className = qualified ? 'row-qualified' : '';
        tr.innerHTML = `
      <td class="col-country">
        <div class="standings-team">
          <span class="standings-team__code">${team.code}</span>
          <span class="standings-team__name">${team.name}</span>
          ${qualified ? '<span class="standings-team__check">✓</span>' : ''}
        </div>
      </td>
      <td>${team.pj}</td>
      <td>${team.pg}</td>
      <td>${team.pe}</td>
      <td>${team.pp}</td>
      <td>${team.gf}</td>
      <td>${team.gc}</td>
      <td>${dgText}</td>
      <td><strong>${team.pts}</strong></td>
    `;
        tbody.appendChild(tr);
    });
}

document.getElementById('matches-container').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-group]');
    if (!btn) return;

    const groupKey   = btn.dataset.group;
    const matchIndex = parseInt(btn.dataset.matchIndex);
    const match      = TOURNAMENT.groups[groupKey].matches[matchIndex];
    const group      = TOURNAMENT.groups[groupKey];
    const homeTeam   = group.teams.find(t => t.code === match.home);
    const awayTeam   = group.teams.find(t => t.code === match.away);

    openModal({
        subtitle: `Fecha ${match.date} · ${group.name}`,
        homeCode: homeTeam.code,
        homeName: homeTeam.name,
        awayCode: awayTeam.code,
        awayName: awayTeam.name,
        currentResult: match.result,
        onSave: (homeGoals, awayGoals) => {
            TOURNAMENT.groups[groupKey].matches[matchIndex].result = { homeGoals, awayGoals };
            saveData();
            renderGroupDetail(groupKey);
            renderGroupsSummary();
        }
    });
});
