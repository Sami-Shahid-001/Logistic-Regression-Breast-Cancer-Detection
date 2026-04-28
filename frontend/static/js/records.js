(() => {
    'use strict';

    // ── DOM References ──
    const searchInput = document.getElementById('search-input');
    const rowsSelect = document.getElementById('rows-select');
    const tbody = document.getElementById('records-tbody');
    const tableInfo = document.getElementById('table-info');
    const pagination = document.getElementById('pagination');
    const totalCount = document.getElementById('total-records-count');
    const benignCount = document.getElementById('benign-count');
    const malignantCnt = document.getElementById('malignant-count');

    // ── Load data ──
    function loadRecords() {
        const data = JSON.parse(localStorage.getItem("patient_records")) || [];

        // ensure timestampStr exists
        return data.map(r => ({
            ...r,
            timestampStr: r.timestamp || ''
        })).reverse();
    }

    let PATIENT_DATA = loadRecords();
    let filteredData = [...PATIENT_DATA];

    let currentPage = 1;
    let rowsPerPage = parseInt(rowsSelect.value, 10);
    let sortCol = null;
    let sortDir = 'asc';

    // ── Update stats ──
    function updateStats() {
        const total = PATIENT_DATA.length;
        const benign = PATIENT_DATA.filter(r => r.prediction === 'Benign').length;

        totalCount.textContent = total;
        benignCount.textContent = benign;
        malignantCnt.textContent = total - benign;
    }

    // ── Render table ──
    function renderTable() {

        // 🔥 ALWAYS reload fresh data
        PATIENT_DATA = loadRecords();
        filteredData = [...PATIENT_DATA];

        const start = (currentPage - 1) * rowsPerPage;
        const end = Math.min(start + rowsPerPage, filteredData.length);
        const slice = filteredData.slice(start, end);

        tbody.innerHTML = '';

        if (slice.length === 0) {
            const tr = document.createElement('tr');
            tr.className = 'table-empty';
            tr.innerHTML = '<td colspan="13">No records found.</td>';
            tbody.appendChild(tr);
        } else {
            slice.forEach((row, idx) => {
                const tr = document.createElement('tr');
                const predClass = row.prediction === 'Benign' ? 'benign' : 'malignant';
                const probPct = (row.probability * 100).toFixed(1);

                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.radius_mean}</td>
                    <td>${row.texture_mean}</td>
                    <td>${row.perimeter_mean}</td>
                    <td>${row.area_mean}</td>
                    <td>${row.smoothness_mean}</td>
                    <td>${row.compactness_mean}</td>
                    <td>${row.concavity_mean}</td>
                    <td>${row.concave_points_mean}</td>
                    <td>${row.symmetry_mean}</td>
                    <td>
                        <span class="pred-badge ${predClass}">
                            ${row.prediction}
                        </span>
                    </td>
                    <td>${probPct}%</td>
                    <td>${row.timestampStr}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        tableInfo.textContent = `Showing ${start + 1} to ${end} of ${filteredData.length} records`;

        updateStats();
        renderPagination();
    }

    // ── Pagination ──
    function renderPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = 'page-btn';
            if (i === currentPage) btn.classList.add('active');

            btn.onclick = () => {
                currentPage = i;
                renderTable();
            };

            pagination.appendChild(btn);
        }
    }

    // ── Search ──
    function applyFilter() {
        const q = searchInput.value.toLowerCase();

        filteredData = PATIENT_DATA.filter(r =>
            Object.values(r).join(' ').toLowerCase().includes(q)
        );

        currentPage = 1;
        renderTable();
    }

    searchInput.addEventListener('input', applyFilter);

    rowsSelect.addEventListener('change', () => {
        rowsPerPage = parseInt(rowsSelect.value, 10);
        currentPage = 1;
        renderTable();
    });

    // ── Init ──
    renderTable();
})();