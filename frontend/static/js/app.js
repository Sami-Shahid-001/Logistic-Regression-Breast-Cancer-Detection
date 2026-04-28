/* =============================================
   OncoPredict AI — App JavaScript (FINAL FIX)
   Backend + Records Integration
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
    const badgeLabel = document.getElementById('badge-label');
    const ringProgress = document.getElementById('ring-progress');
    const confPercent = document.getElementById('conf-percent');
    const chartCanvas = document.getElementById('confidence-chart');

    // ── Features ──
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

    // ── SAVE RECORD ──
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
            fractal_dimension_mean: values[9],
            prediction: result.label,
            probability: result.confidence,
            timestamp: new Date().toLocaleString()
        };

        existing.push(newRecord);
        localStorage.setItem("patient_records", JSON.stringify(existing));
    }

    // ── Chart ──
    let chartInstance = null;

    function updateChart(probBenign, probMalignant) {
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: ['Benign', 'Malignant'],
                datasets: [{
                    data: [
                        +(probBenign * 100).toFixed(1),
                        +(probMalignant * 100).toFixed(1)
                    ],
                }],
            },
        });
    }

    // ── Animation ──
    function animateRing(confidence, isMalignant) {
        const circumference = 2 * Math.PI * 68;
        const offset = circumference * (1 - confidence);

        ringProgress.style.stroke = isMalignant
            ? 'var(--color-malignant)'
            : 'var(--color-primary)';

        ringProgress.setAttribute('stroke-dashoffset', circumference);

        requestAnimationFrame(() => {
            ringProgress.style.transition = 'stroke-dashoffset 1s ease';
            ringProgress.setAttribute('stroke-dashoffset', offset);
        });
    }

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

    // ── Validation ──
    function validateInputs() {
        let valid = true;

        FEATURES.forEach(f => {
            const input = document.getElementById(f);
            if (!input.value || isNaN(parseFloat(input.value))) {
                valid = false;
            }
        });

        return valid;
    }

    // ── SUBMIT (BACKEND CALL) ──
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateInputs()) return;

        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        btnPredict.disabled = true;

        const values = FEATURES.map(f =>
            parseFloat(document.getElementById(f).value)
        );

        try {
            const response = await fetch("https://logistic-regression-breast-cancer-detection-production.up.railway.app/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                radius_mean: values[0],
                texture_mean: values[1],
                perimeter_mean: values[2],
                area_mean: values[3],
                smoothness_mean: values[4],
                compactness_mean: values[5],
                concavity_mean: values[6],
                concave_points_mean: values[7],
                symmetry_mean: values[8],
                fractal_dimension_mean: values[9]
            })
            });

            const data = await response.json();

            const result = {
                label: data.label,
                isMalignant: data.label === "Malignant",
                confidence: data.probability,
                probMalignant: data.probability,
                probBenign: 1 - data.probability
            };

            saveRecord(values, result);

            // ── UI update ──
            resultPlaceholder.style.display = 'none';
            resultContent.style.display = 'flex';

            resultBadge.className =
                'result-badge ' + (result.isMalignant ? 'malignant' : 'benign');

            badgeLabel.textContent = result.label;

            const confPct = Math.round(result.confidence * 100);
            animateRing(result.confidence, result.isMalignant);
            animatePercent(confPct);

            updateChart(result.probBenign, result.probMalignant);

        } catch (error) {
            console.error("Backend error:", error);
            alert("Backend not running or connection failed!");
        }

        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btnPredict.disabled = false;
    });

})();