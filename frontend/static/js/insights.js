/* =============================================
   OncoPredict AI — Model Insights JavaScript
   Chart.js charts, animated counters, and UI
   ============================================= */

(() => {
    'use strict';

    // ────────────────────────────────────────────
    // 1. Animate Metric Counters
    // ────────────────────────────────────────────
    function animateMetrics() {
        document.querySelectorAll('.metric-value').forEach(el => {
            const target = parseFloat(el.dataset.target);
            const duration = 1200;
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = (target * eased).toFixed(target % 1 === 0 ? 0 : 2);
                el.textContent = current + '%';
                if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
        });
    }

    // ────────────────────────────────────────────
    // 2. Chart.js shared config
    // ────────────────────────────────────────────
    const FONT_FAMILY = "'Inter', sans-serif";
    const GRID_COLOR = 'rgba(0,0,0,.06)';
    const MUTED = '#94a3b8';

    Chart.defaults.font.family = FONT_FAMILY;

    // ────────────────────────────────────────────
    // 3. INSIGHT 03 — Correlation Horizontal Bar
    // ────────────────────────────────────────────
    function createCorrelationChart() {
        const ctx = document.getElementById('correlation-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'concave pts worst',
                    'perimeter worst',
                    'concave pts mean',
                    'radius worst',
                    'perimeter mean',
                ],
                datasets: [{
                    label: 'Correlation',
                    data: [0.79, 0.78, 0.77, 0.77, 0.74],
                    backgroundColor: [
                        'rgba(26,86,219,.85)',
                        'rgba(26,86,219,.72)',
                        'rgba(26,86,219,.62)',
                        'rgba(26,86,219,.52)',
                        'rgba(26,86,219,.42)',
                    ],
                    borderRadius: 6,
                    barPercentage: 0.65,
                }],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1000, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: c => 'r = ' + c.parsed.x.toFixed(2),
                        },
                    },
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            stepSize: 0.2,
                            font: { size: 11 },
                            color: MUTED,
                        },
                        grid: { color: GRID_COLOR },
                    },
                    y: {
                        ticks: {
                            font: { size: 12, weight: '500' },
                            color: '#475569',
                        },
                        grid: { display: false },
                    },
                },
            },
        });
    }

    // ────────────────────────────────────────────
    // 4. INSIGHT 04 — Size Features Grouped Bar
    // ────────────────────────────────────────────
    function createSizeChart() {
        const ctx = document.getElementById('size-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Radius', 'Perimeter', 'Area'],
                datasets: [
                    {
                        label: 'Malignant',
                        data: [17.46, 115.36, 978.4],
                        backgroundColor: 'rgba(220,38,38,.7)',
                        borderColor: 'rgba(220,38,38,1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        barPercentage: 0.6,
                    },
                    {
                        label: 'Benign',
                        data: [12.15, 78.08, 462.8],
                        backgroundColor: 'rgba(22,163,74,.7)',
                        borderColor: 'rgba(22,163,74,1)',
                        borderWidth: 1,
                        borderRadius: 6,
                        barPercentage: 0.6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1000, easing: 'easeOutQuart' },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            font: { size: 12, weight: '600' },
                            color: '#475569',
                            padding: 16,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: c => c.dataset.label + ': ' + c.parsed.y.toFixed(1),
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { size: 11 },
                            color: MUTED,
                        },
                        grid: { color: GRID_COLOR },
                    },
                    x: {
                        ticks: {
                            font: { size: 12, weight: '600' },
                            color: '#475569',
                        },
                        grid: { display: false },
                    },
                },
            },
        });
    }

    // ────────────────────────────────────────────
    // 5. Scaling Impact Chart (before/after)
    // ────────────────────────────────────────────
    function createScalingChart() {
        const ctx = document.getElementById('scaling-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['area_mean', 'perimeter_mean', 'concave_pts', 'smoothness'],
                datasets: [
                    {
                        label: 'Before Scaling',
                        data: [654, 92, 0.05, 0.10],
                        backgroundColor: 'rgba(148,163,184,.5)',
                        borderColor: 'rgba(148,163,184,1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.55,
                    },
                    {
                        label: 'After Scaling',
                        data: [0.84, 0.76, 0.68, 0.72],
                        backgroundColor: 'rgba(26,86,219,.65)',
                        borderColor: 'rgba(26,86,219,1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.55,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 900, easing: 'easeOutQuart' },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            font: { size: 11, weight: '600' },
                            color: '#475569',
                            padding: 14,
                        },
                    },
                },
                scales: {
                    y: {
                        display: false,
                    },
                    x: {
                        ticks: {
                            font: { size: 11, weight: '500' },
                            color: '#64748b',
                        },
                        grid: { display: false },
                    },
                },
            },
        });
    }

    // ────────────────────────────────────────────
    // 6. INSIGHT 10 — Separability Scatter Plot
    // ────────────────────────────────────────────
    function createSeparableChart() {
        const ctx = document.getElementById('separable-chart');
        if (!ctx) return;

        // Generate synthetic 2-cluster scatter data
        const benignPts = [];
        const malignantPts = [];

        for (let i = 0; i < 60; i++) {
            benignPts.push({
                x: 1.5 + Math.random() * 3 + (Math.random() - 0.5) * 0.8,
                y: 1 + Math.random() * 3 + (Math.random() - 0.5) * 0.8,
            });
        }
        for (let i = 0; i < 40; i++) {
            malignantPts.push({
                x: 5.5 + Math.random() * 3 + (Math.random() - 0.5) * 0.8,
                y: 4 + Math.random() * 3 + (Math.random() - 0.5) * 0.8,
            });
        }

        // Decision boundary line (two points)
        const boundaryPts = [
            { x: 3.5, y: 0 },
            { x: 6.5, y: 8 },
        ];

        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Benign',
                        data: benignPts,
                        backgroundColor: 'rgba(22,163,74,.6)',
                        borderColor: 'rgba(22,163,74,1)',
                        borderWidth: 1,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                    },
                    {
                        label: 'Malignant',
                        data: malignantPts,
                        backgroundColor: 'rgba(220,38,38,.6)',
                        borderColor: 'rgba(220,38,38,1)',
                        borderWidth: 1,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                    },
                    {
                        label: 'Decision Boundary',
                        data: boundaryPts,
                        type: 'line',
                        borderColor: 'rgba(26,86,219,.6)',
                        borderWidth: 2,
                        borderDash: [6, 4],
                        pointRadius: 0,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1200, easing: 'easeOutQuart' },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            font: { size: 11, weight: '600' },
                            color: '#475569',
                            padding: 14,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: c => {
                                if (c.dataset.label === 'Decision Boundary') return '';
                                return `${c.dataset.label}: (${c.parsed.x.toFixed(2)}, ${c.parsed.y.toFixed(2)})`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Principal Component 1',
                            font: { size: 11, weight: '600' },
                            color: MUTED,
                        },
                        ticks: { color: MUTED, font: { size: 10 } },
                        grid: { color: GRID_COLOR },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Principal Component 2',
                            font: { size: 11, weight: '600' },
                            color: MUTED,
                        },
                        ticks: { color: MUTED, font: { size: 10 } },
                        grid: { color: GRID_COLOR },
                    },
                },
            },
        });
    }

    // ────────────────────────────────────────────
    // 7. Intersection Observer for scroll-in
    // ────────────────────────────────────────────
    function setupScrollAnimations() {
        const cards = document.querySelectorAll('.insight-card, .metric-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity .5s ease, transform .5s ease';
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, idx * 60);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => observer.observe(card));
    }

    // ────────────────────────────────────────────
    // 8. Initialize everything
    // ────────────────────────────────────────────
    function init() {
        animateMetrics();
        createCorrelationChart();
        createSizeChart();
        createScalingChart();
        createSeparableChart();
        setupScrollAnimations();
    }

    // Wait for DOM + Chart.js
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
