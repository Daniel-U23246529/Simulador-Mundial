// ===================================================
// KNOCKOUT.JS — Lógica y renderizado de eliminatorias
// ===================================================

/** Actualiza los equipos de cuartos según los clasificados de los grupos */
function updateKnockoutTeams() {
    const ko = TOURNAMENT.knockout;

    // Los 2 clasificados de cada grupo
    const q = {};
    ['A', 'B', 'C', 'D'].forEach(g => {
        const standings = calcStandings(g);
        q[`1${g}`] = standings[0] || null;
        q[`2${g}`] = standings[1] || null;
    });

    // Cuartos: 1A vs 2B, 1B vs 2A, 1C vs 2D, 1D vs 2C
    const quarterPairs = [
        ['1A', '2B'],
        ['1B', '2A'],
        ['1C', '2D'],
        ['1D', '2C'],
    ];

    quarterPairs.forEach(([homeKey, awayKey], i) => {
        // Solo actualizar si no hay resultado aún (no sobreescribir equipo cambiado)
        ko.quarters[i].home = q[homeKey];
        ko.quarters[i].away = q[awayKey];
    });

    // Semis: ganador Q1 vs Q2, ganador Q3 vs Q4
    [0, 1].forEach(i => {
        const q1 = ko.quarters[i * 2];
        const q2 = ko.quarters[i * 2 + 1];
        ko.semis[i].home = q1.result ? getWinner(q1) : placeholder('G.');
        ko.semis[i].away = q2.result ? getWinner(q2) : placeholder('G.');
    });

    // Final y 3er puesto
    const [s1, s2] = ko.semis;
    ko.finals[0].home = s1.result ? getLoser(s1)  : placeholder('Perdedor');
    ko.finals[0].away = s2.result ? getLoser(s2)  : placeholder('Perdedor');
    ko.finals[1].home = s1.result ? getWinner(s1) : placeholder('G. Semi 1');
    ko.finals[1].away = s2.result ? getWinner(s2) : placeholder('G. Semi 2');
}

/** Equipo ganador de un partido de eliminatoria */
function getWinner(match) {
    if (!match.result) return null;
    return match.result.homeGoals >= match.result.awayGoals ? match.home : match.away;
}

/** Equipo perdedor de un partido de eliminatoria */
function getLoser(match) {
    if (!match.result) return null;
    return match.result.homeGoals >= match.result.awayGoals ? match.away : match.home;
}

/** Placeholder para equipos aún no definidos */
function placeholder(label) {
    return { code: '⚙', name: label };
}

// ---- Render: vista de eliminatorias completa ----
function renderKnockout() {
    updateKnockoutTeams();

    renderKnockoutStage('quarters-container', TOURNAMENT.knockout.quarters, 'quarter');
    renderKnockoutStage('semis-container',    TOURNAMENT.knockout.semis,    'semi');
    renderKnockoutStage('final-container',    TOURNAMENT.knockout.finals,   'final');
}

function renderKnockoutStage(containerId, matches, stageKey) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    matches.forEach((match, index) => {
        const played = match.result !== null;
        const winner = played ? getWinner(match) : null;

        const homeCode  = match.home?.code  || '–';
        const homeName  = match.home?.name  || '–';
        const awayCode  = match.away?.code  || '–';
        const awayName  = match.away?.name  || '–';
        const homeScore = played ? match.result.homeGoals : '–';
        const awayScore = played ? match.result.awayGoals : '–';

        const homeWinner = winner && match.home && winner.code === match.home.code;
        const awayWinner = winner && match.away && winner.code === match.away.code;

        const card = document.createElement('div');
        card.className = `knockout-card${match.isFinal ? ' knockout-card--final' : ''}`;

        card.innerHTML = `
      <p class="knockout-card__label">${match.label}</p>
      <div class="knockout-card__match">
        <div class="knockout-card__team${homeWinner ? ' knockout-card__team--winner' : ''}">
          <div class="knockout-card__team-left">
            <span class="knockout-card__team-code">${homeCode}</span>
            <span class="knockout-card__team-name">${homeName}</span>
          </div>
          <span class="knockout-card__team-score">${homeScore}</span>
        </div>
        <div class="knockout-card__team${awayWinner ? ' knockout-card__team--winner' : ''}">
          <div class="knockout-card__team-left">
            <span class="knockout-card__team-code">${awayCode}</span>
            <span class="knockout-card__team-name">${awayName}</span>
          </div>
          <span class="knockout-card__team-score">${awayScore}</span>
        </div>
      </div>
      <button class="knockout-card__btn${played ? ' knockout-card__btn--played' : ''}"
              data-stage="${stageKey}"
              data-index="${index}"
              ${!match.home || !match.away ? 'disabled' : ''}>
        ${played ? ' Editar resultado' : '+ Resultado'}
      </button>
    `;

        container.appendChild(card);
    });
}

// ---- Delegación de eventos en botones de eliminatoria ----
['quarters-container', 'semis-container', 'final-container'].forEach(containerId => {
    document.getElementById(containerId).addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-stage]');
        if (!btn || btn.disabled) return;

        const stageKey = btn.dataset.stage;
        const index    = parseInt(btn.dataset.index);

        const stageMap = {
            quarter: TOURNAMENT.knockout.quarters,
            semi:    TOURNAMENT.knockout.semis,
            final:   TOURNAMENT.knockout.finals,
        };

        const match    = stageMap[stageKey][index];
        const homeTeam = match.home;
        const awayTeam = match.away;

        openModal({
            subtitle: match.label,
            homeCode: homeTeam.code,
            homeName: homeTeam.name,
            awayCode: awayTeam.code,
            awayName: awayTeam.name,
            currentResult: match.result,
            onSave: (homeGoals, awayGoals) => {
                stageMap[stageKey][index].result = { homeGoals, awayGoals };
                saveData();
                renderKnockout();
            }
        });
    });
});
