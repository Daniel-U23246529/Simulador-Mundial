
// DATA.JS — Estructura de datos del torneo


const TOURNAMENT = {
    groups: {
        A: {
            name: 'Grupo A',
            teams: [
                { code: 'MX', name: 'México' },
                { code: 'ZA', name: 'Sudáfrica' },
                { code: 'KR', name: 'Corea del Sur' },
                { code: 'CZ', name: 'Chequia' },
            ],

            matches: [
                { date: 1, home: 'MX', away: 'ZA',  result: null },
                { date: 1, home: 'KR', away: 'CZ',  result: null },
                { date: 2, home: 'MX', away: 'KR',  result: null },
                { date: 2, home: 'ZA', away: 'CZ',  result: null },
                { date: 3, home: 'MX', away: 'CZ',  result: null },
                { date: 3, home: 'ZA', away: 'KR',  result: null },
            ]
        },
        B: {
            name: 'Grupo B',
            teams: [
                { code: 'CA', name: 'Canadá' },
                { code: 'BA', name: 'Bosnia' },
                { code: 'QA', name: 'Qatar' },
                { code: 'CH', name: 'Suiza' },
            ],
            matches: [
                { date: 1, home: 'CA', away: 'BA',  result: null },
                { date: 1, home: 'QA', away: 'CH',  result: null },
                { date: 2, home: 'CA', away: 'QA',  result: null },
                { date: 2, home: 'BA', away: 'CH',  result: null },
                { date: 3, home: 'CA', away: 'CH',  result: null },
                { date: 3, home: 'BA', away: 'QA',  result: null },
            ]
        },
        C: {
            name: 'Grupo C',
            teams: [
                { code: 'BR', name: 'Brasil' },
                { code: 'MA', name: 'Marruecos' },
                { code: 'HT', name: 'Haití' },
                { code: 'SC', name: 'Escocia' },
            ],
            matches: [
                { date: 1, home: 'BR', away: 'MA',  result: null },
                { date: 1, home: 'HT', away: 'SC',  result: null },
                { date: 2, home: 'BR', away: 'HT',  result: null },
                { date: 2, home: 'MA', away: 'SC',  result: null },
                { date: 3, home: 'BR', away: 'SC',  result: null },
                { date: 3, home: 'MA', away: 'HT',  result: null },
            ]
        },
        D: {
            name: 'Grupo D',
            teams: [
                { code: 'AR', name: 'Argentina' },
                { code: 'DZ', name: 'Argelia' },
                { code: 'AT', name: 'Austria' },
                { code: 'JO', name: 'Jordania' },
            ],
            matches: [
                { date: 1, home: 'AR', away: 'DZ',  result: null },
                { date: 1, home: 'AT', away: 'JO',  result: null },
                { date: 2, home: 'AR', away: 'AT',  result: null },
                { date: 2, home: 'DZ', away: 'JO',  result: null },
                { date: 3, home: 'AR', away: 'JO',  result: null },
                { date: 3, home: 'DZ', away: 'AT',  result: null },
            ]
        }
    },

    // Eliminatorias — los equipos se rellenan dinámicamente
    knockout: {
        quarters: [
            { id: 'Q1', label: 'CUARTOS 1', home: null, away: null, result: null, source: '1A_vs_2B' },
            { id: 'Q2', label: 'CUARTOS 2', home: null, away: null, result: null, source: '1B_vs_2A' },
            { id: 'Q3', label: 'CUARTOS 3', home: null, away: null, result: null, source: '1C_vs_2D' },
            { id: 'Q4', label: 'CUARTOS 4', home: null, away: null, result: null, source: '1D_vs_2C' },
        ],
        semis: [
            { id: 'S1', label: 'SEMIFINAL 1', home: null, away: null, result: null, source: 'W_Q1_vs_W_Q2' },
            { id: 'S2', label: 'SEMIFINAL 2', home: null, away: null, result: null, source: 'W_Q3_vs_W_Q4' },
        ],
        finals: [
            { id: 'F3', label: '3ER PUESTO', home: null, away: null, result: null, source: 'L_S1_vs_L_S2' },
            { id: 'F1', label: 'GRAN FINAL', home: null, away: null, result: null, source: 'W_S1_vs_W_S2', isFinal: true },
        ]
    }
};


// UTILIDADES DE DATOS


/** Busca un equipo por código en cualquier grupo */
function getTeamByCode(code) {
    for (const group of Object.values(TOURNAMENT.groups)) {
        const found = group.teams.find(t => t.code === code);
        if (found) return found;
    }
    return null;
}

/** Calcula la tabla de posiciones de un grupo */
function calcStandings(groupKey) {
    const group = TOURNAMENT.groups[groupKey];

    const stats = {};
    group.teams.forEach(t => {
        stats[t.code] = { code: t.code, name: t.name, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    });

    group.matches.forEach(match => {
        if (!match.result) return;
        const { homeGoals, awayGoals } = match.result;
        const h = stats[match.home];
        const a = stats[match.away];

        h.pj++; a.pj++;
        h.gf += homeGoals; h.gc += awayGoals;
        a.gf += awayGoals; a.gc += homeGoals;

        if (homeGoals > awayGoals) {
            h.pg++; h.pts += 3;
            a.pp++;
        } else if (homeGoals < awayGoals) {
            a.pg++; a.pts += 3;
            h.pp++;
        } else {
            h.pe++; h.pts += 1;
            a.pe++; a.pts += 1;
        }
    });

    // Ordenar: pts > dg > gf
    return Object.values(stats).sort((a, b) => {
        const dgA = a.gf - a.gc;
        const dgB = b.gf - b.gc;
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (dgB !== dgA) return dgB - dgA;
        return b.gf - a.gf;
    });
}

//Devuelve los 2 clasificados de un grupo
function getQualified(groupKey) {
    return calcStandings(groupKey).slice(0, 2);
}

//Persiste el torneo en localStorage
function saveData() {
    localStorage.setItem('mundial2024', JSON.stringify(TOURNAMENT));
}

// Carga el torneo desde localStorage (si existe)
function loadData() {
    const saved = localStorage.getItem('mundial2024');
    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);

        // Restaurar resultados de los partidos de grupo
        Object.keys(parsed.groups).forEach(gKey => {
            parsed.groups[gKey].matches.forEach((savedMatch, i) => {
                TOURNAMENT.groups[gKey].matches[i].result = savedMatch.result;
            });
        });

        // Restaurar resultados de eliminatorias
        ['quarters', 'semis', 'finals'].forEach(stage => {
            parsed.knockout[stage].forEach((savedItem, i) => {
                TOURNAMENT.knockout[stage][i].result = savedItem.result;
                TOURNAMENT.knockout[stage][i].home   = savedItem.home;
                TOURNAMENT.knockout[stage][i].away   = savedItem.away;
            });
        });
    } catch (e) {
        console.warn('No se pudo cargar el estado guardado:', e);
    }
}
