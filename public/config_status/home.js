function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(function (content) {
        content.classList.remove('active');
    });
    document.getElementById(tab).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.classList.remove('active');
    });
    document.getElementById(tab + '-tab').classList.add('active');
}

function redirectToTextEditor() {
    window.location.href = '/txt';
}

const ctx = document.getElementById('cpuChart').getContext('2d');
const cpuChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'CPU Usage',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

async function fetchStatus() {
    try {
        const response = await fetch('/status');
        const data = await response.json();
        document.getElementById('cpu-usage').textContent = data.cpuUsage.toFixed(2);
        document.getElementById('memory-usage').textContent = ((data.memory.used / data.memory.total) * 100).toFixed(2);
        document.getElementById('disk-usage').textContent = ((data.disk.used / data.disk.size) * 100).toFixed(2);
        document.getElementById('uptime').textContent = new Date(data.uptime * 1000).toISOString().substr(11, 8);

        const now = new Date().toLocaleTimeString();
        if (cpuChart.data.labels.length > 10) {
            cpuChart.data.labels.shift();
            cpuChart.data.datasets[0].data.shift();
        }
        cpuChart.data.labels.push(now);
        cpuChart.data.datasets[0].data.push(data.cpuUsage);
        cpuChart.update();
    } catch (error) {
        console.error('Error fetching system status:', error);
    }
}

document.getElementById('config-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const powerPlan = document.getElementById('power-plan').value;
    const timezone = document.getElementById('timezone').value;

    const response = await fetch('config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({powerPlan, timezone })
    });

    const result = await response.json();
    document.getElementById('response-message').textContent = result.message;
});

fetchStatus();
setInterval(fetchStatus, 5000);