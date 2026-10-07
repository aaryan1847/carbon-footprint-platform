Auth.requireLogin();
Auth.nav('calculator.html');

const user = Auth.current();
const HKEY = user ? ('cf_history_' + user.email) : 'cf_history_guest';

/* Emission factors (kg CO2) - simple average estimates */
const F = { electricity: 0.82, vehicle: 0.21, flight: 0.15, lpgCylinder: 42 };
/* Average yearly emission per person (kg CO2), approximate */
const AVG = { india: 2000, world: 4700, goal: 2300 };

let pieChart, barChart;
let latest = null;

const $ = id => document.getElementById(id);
const fields = ['electricity', 'vehicle', 'flight', 'lpg'];

function readInputs() {
  let ok = true;
  const vals = {};
  fields.forEach(id => {
    const el = $(id);
    const raw = el.value.trim();
    const n = raw === '' ? 0 : Number(raw);
    if (isNaN(n) || n < 0) { Auth.setErr(el, 'Enter a number that is 0 or more.'); ok = false; }
    else if (n > 1000000) { Auth.setErr(el, 'This value looks too large.'); ok = false; }
    else { Auth.setErr(el, ''); vals[id] = n; }
  });
  vals.diet = Number($('diet').value);
  return ok ? vals : null;
}

function levelOf(annual) {
  if (annual <= 2500) return 'Low';
  if (annual <= 4700) return 'Medium';
  return 'High';
}

function calculateFootprint() {
  const v = readInputs();
  if (!v) return;
  if (v.electricity + v.vehicle + v.flight + v.lpg === 0) {
    Auth.setErr($('electricity'), 'Enter at least one value to calculate.');
    return;
  }

  const parts = {
    Electricity: v.electricity * 12 * F.electricity,
    Vehicle: v.vehicle * 12 * F.vehicle,
    Flight: v.flight * F.flight,
    LPG: v.lpg * 12 * F.lpgCylinder,
    Diet: v.diet
  };
  const annual = Math.round(Object.values(parts).reduce((a, b) => a + b, 0));
  const score = Math.max(0, Math.round(100 - annual / 80));
  const level = levelOf(annual);
  const trees = Math.ceil(annual / 20);

  latest = { ...v, parts, annual, score, level, trees };

  $('totalEmission').textContent = annual.toLocaleString() + ' kg CO₂/year';
  $('ecoScore').textContent = score + '/100';
  $('carbonLevel').textContent = level;
  $('trees').textContent = trees.toLocaleString();

  renderTips(parts, level);
  saveHistory(annual, score, level);
  renderCharts(parts, annual);
}

function renderTips(parts, level) {
  const list = $('tipsList');
  list.innerHTML = '';
  const tipsBy = {
    Electricity: ['Switch to LED bulbs and 5-star rated appliances.', 'Turn off fans, lights and chargers when not in use.', 'Consider rooftop solar panels.'],
    Vehicle: ['Use public transport, metro or carpool at least 2 days a week.', 'Walk or cycle for short distances.', 'Keep tyres inflated and the engine serviced, or move to an electric vehicle.'],
    Flight: ['Prefer trains for trips under 800 km.', 'Combine trips and avoid unnecessary flights.'],
    LPG: ['Use a pressure cooker and keep lids on pots.', 'Plan meals to avoid reheating again and again.'],
    Diet: ['Eat more plant-based meals and local seasonal food.', 'Do not waste food; plan and store it properly.']
  };
  const sorted = Object.entries(parts).sort((a, b) => b[1] - a[1]);
  const tips = [];
  const top = sorted[0][0];
  tips.push('Your biggest source is ' + top + '. Focus here first.');
  tipsBy[top].forEach(t => tips.push(t));
  if (sorted[1][1] > 0) tipsBy[sorted[1][0]].slice(0, 1).forEach(t => tips.push(t));
  tips.push(level === 'Low' ? 'Great job! Keep up your sustainable habits and inspire friends and family.' : 'Plant trees and carry a cloth bag to cut plastic use.');
  tips.forEach(t => { const li = document.createElement('li'); li.textContent = t; list.appendChild(li); });
}

function renderCharts(parts, annual) {
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  const labels = Object.keys(parts);
  pieChart = new Chart($('footprintChart'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: labels.map(k => Math.round(parts[k])), backgroundColor: ['#ffd600', '#40c4ff', '#ff6e40', '#e040fb', '#00e676'] }] },
    options: { plugins: { legend: { labels: { color: '#fff' } } } }
  });
  barChart = new Chart($('compareChart'), {
    type: 'bar',
    data: {
      labels: ['You', 'India avg', 'World avg', '1.5°C goal'],
      datasets: [{ label: 'kg CO₂ per year', data: [annual, AVG.india, AVG.world, AVG.goal], backgroundColor: ['#00c853', '#ffb300', '#ef5350', '#29b6f6'] }]
    },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' }, beginAtZero: true } }
    }
  });
}

/* ---------- History (saved separately for every user) ---------- */
function getHistory() { return JSON.parse(localStorage.getItem(HKEY) || '[]'); }

function saveHistory(annual, score, level) {
  const h = getHistory();
  h.push({ date: new Date().toLocaleDateString(), annual, score, level });
  localStorage.setItem(HKEY, JSON.stringify(h));
  displayHistory();
}

function displayHistory() {
  const body = $('historyBody');
  body.innerHTML = '';
  const h = getHistory();
  $('noHistory').style.display = h.length ? 'none' : 'block';
  h.forEach((r, i) => {
    const tr = document.createElement('tr');
    [i + 1, r.date, r.annual.toLocaleString(), r.score + '/100'].forEach(x => { const td = document.createElement('td'); td.textContent = x; tr.appendChild(td); });
    const td = document.createElement('td');
    const b = document.createElement('span'); b.className = 'badge ' + r.level; b.textContent = r.level;
    td.appendChild(b); tr.appendChild(td);
    body.appendChild(tr);
  });
}

function clearHistory() {
  if (confirm('Delete all your saved records?')) { localStorage.removeItem(HKEY); displayHistory(); }
}

/* ---------- PDF ---------- */
function downloadPDF() {
  if (!latest) { alert('Please calculate your carbon footprint first!'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  doc.setFontSize(22);
  doc.text('Carbon Footprint Report', 55, 20);
  doc.setFontSize(12);
  doc.text('Name: ' + (user ? user.name : 'Eco Explorer'), 20, 33);
  doc.text('Date: ' + date, 20, 40);
  doc.line(20, 45, 190, 45);

  doc.setFontSize(16); doc.text('Activity Summary', 20, 58);
  doc.setFontSize(12);
  doc.text('Electricity Usage: ' + latest.electricity + ' kWh/month', 25, 70);
  doc.text('Vehicle Travel: ' + latest.vehicle + ' km/month', 25, 78);
  doc.text('Flight Travel: ' + latest.flight + ' km/year', 25, 86);
  doc.text('LPG Cylinders: ' + latest.lpg + ' per month', 25, 94);

  doc.setFontSize(16); doc.text('Emission Analysis', 20, 112);
  doc.setFontSize(12);
  doc.text('Total Emission: ' + latest.annual.toLocaleString() + ' kg CO2 per year', 25, 124);
  doc.text('Eco Score: ' + latest.score + '/100', 25, 132);
  doc.text('Carbon Level: ' + latest.level, 25, 140);
  doc.text('Trees needed to offset: ' + latest.trees, 25, 148);

  doc.setFontSize(16); doc.text('Suggestions', 20, 166);
  doc.setFontSize(12);
  let y = 178;
  document.querySelectorAll('#tipsList li').forEach(li => {
    doc.splitTextToSize('- ' + li.textContent, 160).forEach(line => { doc.text(line, 25, y); y += 7; });
  });

  doc.addPage();
  doc.setFontSize(20); doc.text('Carbon Footprint Charts', 50, 20);
  doc.addImage($('footprintChart').toDataURL('image/png'), 'PNG', 45, 30, 110, 110);
  doc.addImage($('compareChart').toDataURL('image/png'), 'PNG', 25, 150, 160, 100);
  doc.setFontSize(12);
  doc.text('Save Earth, Reduce Carbon, Build a Better Future', 45, 280);

  doc.save('Carbon_Footprint_Report.pdf');
}

function resetData() {
  fields.forEach(id => { $(id).value = ''; Auth.setErr($(id), ''); $(id).classList.remove('good'); });
  $('diet').value = '1700';
  $('totalEmission').textContent = '0 kg CO₂/year';
  $('ecoScore').textContent = '0/100';
  $('carbonLevel').textContent = '-';
  $('trees').textContent = '0';
  $('tipsList').innerHTML = '<li>Calculate your footprint to get personalised tips.</li>';
  if (pieChart) pieChart.destroy();
  if (barChart) barChart.destroy();
  latest = null;
}

window.onload = displayHistory;
