function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${id}`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    // Simple logic to highlight active nav
}

function renderShipmentTable(shipments) {
    const tbody = document.getElementById('shipments-body');
    document.getElementById('m-active').textContent = shipments.length;
    
    tbody.innerHTML = shipments.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.origin} → ${s.destination}</td>
            <td>${s.cargo_type}</td>
            <td><span class="status-${s.status}">${s.status}</span></td>
            <td><button onclick="alert('Tracking ${s.id}')">Track</button></td>
        </tr>
    `).join('');
}

function updateAISelect(shipments) {
    const select = document.getElementById('ai-shipment-select');
    select.innerHTML = shipments.map(s => `
        <option value="${s.id}">${s.id} (${s.origin})</option>
    `).join('');
}