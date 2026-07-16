
//  Inicialización y navegación


let grupoActual = null;

const vistas = {
    groups:       document.getElementById('view-groups'),
    groupDetail:  document.getElementById('view-group-detail'),
    knockout:     document.getElementById('view-knockout'),
};

const navBtns = document.querySelectorAll('.nav__btn');


// NAVEGACIÓN PRINCIPAL (Grupos / Eliminatorias)

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.view;

        // Actualizar botón activo
        navBtns.forEach(b => b.classList.remove('nav__btn--active'));
        btn.classList.add('nav__btn--active');

        if (target === 'groups') {
            showView('groups');
        } else if (target === 'knockout') {
            renderKnockout();
            showView('knockout');
        }
    });
});

// ===================================================
// CLIC EN TARJETA DE GRUPO → ir al detalle
// ===================================================
document.querySelectorAll('.group-card').forEach(card => {
    card.addEventListener('click', () => {
        const groupKey = card.dataset.group;
        grupoActual = groupKey;
        renderGroupDetail(groupKey);
        showView('groupDetail');
    });
});

// ===================================================
// BOTÓN "TODOS LOS GRUPOS"
// ===================================================
document.getElementById('btn-back-groups').addEventListener('click', () => {
    grupoActual = null;
    showView('groups');
});

// ===================================================
// MODAL
// ===================================================
let _onSaveCallback = null;

/** Abre el modal con los datos del partido */
function openModal({ subtitle, homeCode, homeName, awayCode, awayName, currentResult, onSave }) {
    document.getElementById('modal-subtitle').textContent   = subtitle;
    document.getElementById('modal-home-code').textContent  = homeCode;
    document.getElementById('modal-home-name').textContent  = homeName;
    document.getElementById('modal-away-code').textContent  = awayCode;
    document.getElementById('modal-away-name').textContent  = awayName;

    // Si ya tiene resultado, pre-rellenar
    const homeInput = document.getElementById('modal-home-score');
    const awayInput = document.getElementById('modal-away-score');
    homeInput.value = currentResult ? currentResult.homeGoals : 0;
    awayInput.value = currentResult ? currentResult.awayGoals : 0;

    _onSaveCallback = onSave;
    document.getElementById('modal-overlay').classList.add('modal-overlay--active');
    homeInput.focus();
}

/** Cierra el modal */
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('modal-overlay--active');
    _onSaveCallback = null;
}

// Guardar resultado
document.getElementById('modal-save').addEventListener('click', () => {
    const homeGoals = parseInt(document.getElementById('modal-home-score').value) || 0;
    const awayGoals = parseInt(document.getElementById('modal-away-score').value) || 0;

    if (homeGoals < 0 || awayGoals < 0) return;

    if (_onSaveCallback) _onSaveCallback(homeGoals, awayGoals);
    closeModal();
});

// Cancelar
document.getElementById('modal-cancel').addEventListener('click', closeModal);

// Cerrar al hacer clic fuera del modal
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// HELPER: mostrar una vista y ocultar las demás

function showView(viewName) {
    Object.values(vistas).forEach(v => v.classList.remove('view--active'));
    vistas[viewName].classList.add('view--active');
}

// INICIALIZACIÓN

loadData();
renderGroupsSummary();
