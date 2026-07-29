function calcularPrediccion() {
    // 1. Obtener valores de los inputs
    const shotsHome = parseFloat(document.getElementById('shotsHome').value) || 0;
    const sotHome = parseFloat(document.getElementById('sotHome').value) || 0;
    const shotsAway = parseFloat(document.getElementById('shotsAway').value) || 0;
    const sotAway = parseFloat(document.getElementById('sotAway').value) || 0;

    // Calcular remates fuera (remates totales menos remates a puerta)
    const outHome = Math.max(0, shotsHome - sotHome);
    const outAway = Math.max(0, shotsAway - sotAway);

    // 2. Modelo xG simplificado basado en remates
    // Remate fuera = ~0.03 xG | Remate a puerta = ~0.30 xG
    let xgHome = (outHome * 0.03) + (sotHome * 0.30);
    let xgAway = (outAway * 0.03) + (sotAway * 0.30);

    // Mostrar xG en pantalla
    document.getElementById('xgHomeVal').innerText = xgHome.toFixed(2);
    document.getElementById('xgAwayVal').innerText = xgAway.toFixed(2);

    // 3. Distribución de Poisson para calcular probabilidades de partido
    function poisson(lambda, k) {
        return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
    }

    function factorial(n) {
        if (n === 0 || n === 1) return 1;
        let resultado = 1;
        for (let i = 2; i <= n; i++) {
            resultado *= i;
        }
        return resultado;
    }

    let probHomeWin = 0;
    let probDraw = 0;
    let probAwayWin = 0;
    let matrix = [];

    // Calcular matriz de resultados de 0 a 5 goles
    for (let h = 0; h <= 5; h++) {
        for (let a = 0; a <= 5; a++) {
            let pHome = poisson(xgHome, h);
            let pAway = poisson(xgAway, a);
            let probScore = pHome * pAway;

            if (h > a) probHomeWin += probScore;
            else if (h === a) probDraw += probScore;
            else probAwayWin += probScore;

            matrix.push({ home: h, away: a, prob: probScore });
        }
    }

    // Mostrar porcentajes globales
    document.getElementById('probHome').innerText = (probHomeWin * 100).toFixed(1) + '%';
    document.getElementById('probDraw').innerText = (probDraw * 100).toFixed(1) + '%';
    document.getElementById('probAway').innerText = (probAwayWin * 100).toFixed(1) + '%';

    // Ordenar resultados por los más probables
    matrix.sort((a, b) => b.prob - a.prob);

    // Mostrar top 5 marcadores en la tabla
    const tbody = document.querySelector('#scoreTable tbody');
    tbody.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        let item = matrix[i];
        let row = `<tr>
            <td>${item.home} - ${item.away}</td>
            <td>${(item.prob * 100).toFixed(1)}%</td>
        </tr>`;
        tbody.innerHTML += row;
    }

    // Mostrar contenedor de resultados
    document.getElementById('results').classList.remove('hidden');
}
