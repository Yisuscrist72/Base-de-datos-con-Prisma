const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const btnImport = document.getElementById('btn-import');
const btnExport = document.getElementById('btn-export');
const reportsList = document.getElementById('reports-list');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

let selectedFile = null;

// Gestor de Drag and Drop
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
    selectedFile = file;
    fileName.innerText = file.name;
    fileName.style.color = '#10b981';
}

// Acción de Importación
btnImport.addEventListener('click', async () => {
    if (!selectedFile) return alert('Por favor, selecciona un archivo primero.');

    const model = document.getElementById('importModel').value;
    const formData = new FormData();
    formData.append('file', selectedFile);

    btnImport.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    btnImport.disabled = true;

    try {
        const res = await fetch(`/api/import/${model}`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        showResult(data);
        loadReports(); // Recargar lista
    } catch (e) {
        alert('Error conectando con el servidor.');
    } finally {
        btnImport.innerHTML = '<i class="rocket"></i> Iniciar Importación';
        btnImport.disabled = false;
        selectedFile = null;
        fileName.innerText = 'Sin archivo seleccionado';
    }
});

// Acción de Exportación
btnExport.addEventListener('click', async () => {
    const model = document.getElementById('exportModel').value;
    const format = document.getElementById('exportFormat').value;

    window.location.href = `/api/export/${model}/${format}`;
});

// Cargar Reportes
async function loadReports() {
    try {
        const res = await fetch('/api/reports');
        const list = await res.json();
        
        if (list.length === 0) {
            reportsList.innerHTML = '<div class="empty-state">No hay reportes disponibles.</div>';
            return;
        }

        reportsList.innerHTML = list.map(item => `
            <div class="report-item fade-in">
                <span>📄 ${item.name}</span>
                <a href="${item.url}" target="_blank"><i class="fas fa-external-link-alt"></i> Ver Informe</a>
            </div>
        `).join('');
    } catch (e) {}
}

// Mostrar Modal con Resultados
function showResult(report) {
    modal.style.display = 'flex';
    modalBody.innerHTML = `
        <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p>🏁 <b>Estado:</b> Finalizado</p>
            <p>📝 <b>Tipo:</b> ${report.processType}</p>
            <p>📊 <b>Total:</b> ${report.totalProcessed}</p>
            <p>✅ <b>Éxitos:</b> <span style="color:var(--secondary)">${report.successCount}</span></p>
            <p>❌ <b>Fallos:</b> <span style="color:var(--error)">${report.failureCount}</span></p>
        </div>
        <p style="font-size: 0.9rem;">El informe detallado ha sido generado en la carpeta <b>/reports</b>.</p>
    `;
}

// Cerrar Modal
document.getElementById('close-modal').onclick = () => modal.style.display = 'none';
document.getElementById('btn-close').onclick = () => modal.style.display = 'none';

// --- FUNCIONALIDADES AED (NATIVO) ---

document.getElementById('btn-aed-users').addEventListener('click', async () => {
    const role = document.getElementById('aedRoleSelect').value;
    try {
        const res = await fetch(`/api/native/users/${role}`);
        const data = await res.json();
        showNativeResult(`Usuarios con Rol: ${role}`, data.rows, ['email', 'role', 'createdAt']);
    } catch (e) { alert('Error cargando informe nativo'); }
});

document.getElementById('btn-aed-ranking').addEventListener('click', async () => {
    try {
        const res = await fetch('/api/native/ranking');
        const data = await res.json();
        showNativeResult('Ranking de Facturación Optimizado (JOIN)', data, ['email', 'total_spent', 'orders_count']);
    } catch (e) { alert('Error cargando ranking'); }
});

document.getElementById('btn-aed-products').addEventListener('click', async () => {
    try {
        const res = await fetch('/api/native/products');
        const data = await res.json();
        showNativeResult('Informe de Precios (Inner Join)', data, ['producto', 'intervalo', 'precio']);
    } catch (e) { alert('Error cargando productos'); }
});

function showNativeResult(title, rows, fields) {
    modal.style.display = 'flex';
    let tableHtml = `
        <h4 style="color:var(--secondary); margin-bottom:15px;">${title}</h4>
        <div class="table-container">
            <table>
                <thead>
                    <tr>${fields.map(f => `<th>${f}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>${fields.map(f => `<td>${row[f] || 'N/A'}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <p style="font-size: 0.8rem; margin-top:15px; color:#94a3b8;">
            <i class="fas fa-info-circle"></i> Esta consulta se ha ejecutado directamente en PostgreSQL 
            usando <b>PreparedStatements</b> y <b>ResulSets</b> nativos (pg-driver).
        </p>
    `;
    modalBody.innerHTML = tableHtml;
}

// Inicialización
window.onload = loadReports;
