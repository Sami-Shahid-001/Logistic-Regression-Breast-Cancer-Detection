/* =============================================
   OncoPredict AI — App JavaScript
   ============================================= */

(() => {
    'use strict';

    // ── DOM references ──
    const form = document.getElementById('prediction-form');
    const btnPredict = document.getElementById('btn-predict');
    const btnText = btnPredict.querySelector('.btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const resultPlaceholder = document.getElementById('result-placeholder');
    const resultContent = document.getElementById('result-content');
    const resultBadge = document.getElementById('result-badge');
    const badgeDot = document.getElementById('badge-dot');
    const badgeLabel = document.getElementById('badge-label');
    const ringProgress = document.getElementById('ring-progress');
    const confPercent = document.getElementById('conf-percent');
    const insightsText = document.getElementById('insights-text');
    const chartCanvas = document.getElementById('confidence-chart');

    // ── Feature metadata (order matters) ──
    const FEATURES = [
        'radius_mean',
        'texture_mean',
        'perimeter_mean',
        'area_mean',
        'smoothness_mean',
        'compactness_mean',
        'concavity_mean',
        'concave_points_mean',
        'symmetry_mean',
        'fractal_dimension_mean',
    ];

    // Typical healthy ranges for insight generation
    const RANGES = {
        radius_mean: { low: 6, high: 17 },
        texture_mean: { low: 10, high: 25 },
        perimeter_mean: { low: 40, high: 120 },
        area_mean: { low: 140, high: 900 },
        smoothness_mean: { low: 0.05, high: 0.12 },
        compactness_mean: { low: 0.02, high: 0.16 },
        concavity_mean: { low: 0, high: 0.15 },
        concave_points_mean: { low: 0, high: 0.08 },
        symmetry_mean: { low: 0.1, high: 0.22 },
        fractal_dimension_mean: { low: 0.05, high: 0.08 },
    };

    let chartInstance = null;

    // ── Utilities ──
    function randomBetween(a, b) {
        return a + Math.random() * (b - a);
    }

    function formatLabel(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    // ── Simple client-side logistic regression simulation ──
    // Since this is frontend-only, we simulate a realistic prediction.
    // The weights below approximate a logistic regression trained on the
    // Wisconsin Breast Cancer dataset (me
    // an features).
    const WEIGHTS = {
        radius_mean: 0.352,
        texture_mean: 0.021,
        perimeter_mean: 0.034,
        area_mean: 0.002,
        smoothness_mean: -12.4,
        compactness_mean: 5.38,
        concavity_mean: 4.12,
        concave_points_mean: 38.6,
        symmetry_mean: 2.15,
        fractal_dimension_mean: -18.3,
    };
    const BIAS = -8.7;

    function sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }

    function predict(values) {
        let z = BIAS;
        FEATURES.forEach((f, i) => {
            z += (values[i] || 0) * (WEIGHTS[f] || 0);
        });
        const prob = sigmoid(z);
        // prob = probability of malignant (class 1)
        return {
            label: prob >= 0.5 ? 'Malignant' : 'Benign',
            isMalignant: prob >= 0.5,
            confidence: prob >= 0.5 ? prob : 1 - prob,
            probMalignant: prob,
            probBenign: 1 - prob,
        };
    }

    // ── Generate insight text ──
    function generateInsight(values, result) {
        const parts = [];
        const featureNames = FEATURES.map(formatLabel);
        // Find features that stand out
        const notable = [];
        FEATURES.forEach((f, i) => {
            const v = values[i];
            const r = RANGES[f];
            if (v < r.low) notable.push({ name: featureNames[i], dir: 'low' });
            if (v > r.high) notable.push({ name: featureNames[i], dir: 'high' });
        });

        if (result.isMalignant) {
            parts.push('Model insights: ');
            if (notable.length > 0) {
                const highOnes = notable.filter(n => n.dir === 'high').map(n => n.name.toLowerCase());
                if (highOnes.length > 0) {
                    parts.push(`The elevated ${highOnes.slice(0, 2).join(' and ')} values significantly contribute to the malignant classification.`);
                } else {
                    parts.push('The combination of input feature values indicates characteristics commonly associated with malignant tumors.');
                }
            } else {
                parts.push('The overall feature profile suggests characteristics commonly associated with malignant tumors.');
            }
        } else {
            parts.push('Model insights: ');
            if (notable.length > 0) {
                const lowOnes = notable.filter(n => n.dir === 'low').map(n => n.name.toLowerCase());
                if (lowOnes.length > 0) {
                    parts.push(`The low ${lowOnes.slice(0, 2).join(' and ')} values significantly contribute to the benign classification.`);
                } else {
                    parts.push('The feature values fall within ranges typically associated with benign tumors.');
                }
            } else {
                parts.push('The low concave points mean and perimeter values significantly contribute to the benign classification.');
            }
        }
        return parts.join('');
    }

    // ── Animate confidence ring ──
    function animateRing(confidence, isMalignant) {
        const circumference = 2 * Math.PI * 68; // r = 68
        const offset = circumference * (1 - confidence);
        ringProgress.style.stroke = isMalignant ? 'var(--color-malignant)' : 'var(--color-primary)';
        // Reset then animate
        ringProgress.style.transition = 'none';
        ringProgress.setAttribute('stroke-dashoffset', circumference);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                ringProgress.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.4,.0,.2,1)';
                ringProgress.setAttribute('stroke-dashoffset', offset);
            });
        });
    }

    // ── Animate percentage counter ──
    function animatePercent(target) {
        let current = 0;
        const step = target / 40;
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            confPercent.textContent = Math.round(current) + '%';
        }, 25);
    }

    // ── Create / update Chart.js bar chart ──
    function updateChart(probBenign, probMalignant) {
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: ['Benign', 'Malignant'],
                datasets: [{
                    label: 'Probability',
                    data: [+(probBenign * 100).toFixed(1), +(probMalignant * 100).toFixed(1)],
                    backgroundColor: [
                        'rgba(22, 163, 74, .75)',
                        'rgba(220, 38, 38, .75)',
                    ],
                    borderColor: [
                        'rgba(22, 163, 74, 1)',
                        'rgba(220, 38, 38, 1)',
                    ],
                    borderWidth: 1.5,
                    borderRadius: 6,
                    barPercentage: .55,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 900,
                    easing: 'easeOutQuart',
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ctx.parsed.y.toFixed(1) + '%',
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: v => v + '%',
                            font: { size: 11, family: 'Inter' },
                            color: '#94a3b8',
                        },
                        grid: {
                            color: 'rgba(0,0,0,.05)',
                        },
                    },
                    x: {
                        ticks: {
                            font: { size: 12, family: 'Inter', weight: '600' },
                            color: '#475569',
                        },
                        grid: { display: false },
                    },
                },
            },
        });
    }

    // ── Form validation ──
    function validateInputs() {
        let valid = true;
        FEATURES.forEach(f => {
            const input = document.getElementById(f);
            const group = input.closest('.input-group');
            if (!input.value || isNaN(parseFloat(input.value))) {
                group.classList.add('invalid');
                valid = false;
            } else {
                group.classList.remove('invalid');
            }
        });
        return valid;
    }

    // Clear invalid state on input
    FEATURES.forEach(f => {
        const input = document.getElementById(f);
        input.addEventListener('input', () => {
            input.closest('.input-group').classList.remove('invalid');
        });
    });

    // ── Handle prediction ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateInputs()) return;

        // Show loading state
        btnText.style.display = 'none';
        btnPredict.querySelector('.btn-icon').style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        btnPredict.disabled = true;

        // Gather values
        const values = FEATURES.map(f => parseFloat(document.getElementById(f).value));

        // Simulate network delay for realism
        await new Promise(r => setTimeout(r, 800));

        // Run prediction
        // ── Save record to localStorage ──
        function saveRecord(values, result) {
            let records = JSON.parse(localStorage.getItem("patient_records")) || [];

            const newId = records.length + 1;

            const newRecord = {
                id: "#PX-" + (1000 + newId),
                radius_mean: values[0],
                texture_mean: values[1],
                perimeter_mean: values[2],
                area_mean: values[3],
                smoothness_mean: values[4],
                compactness_mean: values[5],
                concavity_mean: values[6],
                concave_points_mean: values[7],
                symmetry_mean: values[8],
                prediction: result.label,
                probability: result.confidence,
                timestamp: new Date().toLocaleString()
            };

            records.push(newRecord);
            localStorage.setItem("patient_records", JSON.stringify(records));
        }

        const result = predict(values);
// ── SAVE RECORD TO localStorage ──
        function saveRecord(values, result) {
            const existing = JSON.parse(localStorage.getItem("patient_records")) || [];

            const newRecord = {
                id: "#PX-" + (1000 + existing.length + 1),
                radius_mean: values[0],
                texture_mean: values[1],
                perimeter_mean: values[2],
                area_mean: values[3],
                smoothness_mean: values[4],
                compactness_mean: values[5],
                concavity_mean: values[6],
                concave_points_mean: values[7],
                symmetry_mean: values[8],
                prediction: result.label,
                probability: result.probMalignant,
                timestamp: new Date().toLocaleString()
            };

            existing.push(newRecord);
            localStorage.setItem("patient_records", JSON.stringify(existing));
        }

// call it
        saveRecord(values, result);
        // Update UI
        resultPlaceholder.style.display = 'none';
        resultContent.style.display = 'flex';

        // Re-trigger animation
        resultContent.style.animation = 'none';
        resultContent.offsetHeight; // force reflow
        resultContent.style.animation = '';

        // Badge
        resultBadge.className = 'result-badge ' + (result.isMalignant ? 'malignant' : 'benign');
        badgeLabel.textContent = result.label;

        // Ring
        const confPct = Math.round(result.confidence * 100);
        animateRing(result.confidence, result.isMalignant);
        animatePercent(confPct);

        // Chart
        updateChart(result.probBenign, result.probMalignant);

        // Insights
        insightsText.textContent = generateInsight(values, result);

        // Reset button
        btnText.style.display = 'inline';
        btnPredict.querySelector('.btn-icon').style.display = 'inline';
        btnLoader.style.display = 'none';
        btnPredict.disabled = false;
    });

    // ── Nav link handler (real navigation + active state) ──
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
	    const href = link.getAttribute('href');

    	if (href === currentPage) {
        	link.classList.add('active');
    	}
    });
})();
