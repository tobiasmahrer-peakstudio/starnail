// ===== Opening hours (Europe/Zurich) =====
const HOURS = {
  0: null,            // Sonntag: geschlossen
  1: [9, 0, 19, 0],
  2: [9, 0, 19, 0],
  3: [9, 0, 19, 0],
  4: [9, 0, 19, 0],
  5: [9, 0, 19, 0],
  6: [9, 0, 17, 0],
};

const DAY_NAMES = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];

function getZurichParts() {
  const fmt = new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  });
  const parts = fmt.formatToParts(new Date());
  const map = {};
  parts.forEach(p => map[p.type] = p.value);
  const weekdayMap = { So:0, Mo:1, Di:2, Mi:3, Do:4, Fr:5, Sa:6 };
  const key = (map.weekday || '').replace(/[^A-Za-zÀ-ÿ]/g, '');
  const day = weekdayMap[key];
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  return { day, minutes: hour * 60 + minute };
}

function pad(n){ return n.toString().padStart(2,'0'); }

function updateStatus() {
  const { day, minutes } = getZurichParts();
  const todayHours = HOURS[day];

  let isOpen = false;
  let message = '';

  if (todayHours) {
    const [oh, om, ch, cm] = todayHours;
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    isOpen = minutes >= openMin && minutes < closeMin;

    if (isOpen) {
      message = `Jetzt geöffnet · schliesst um ${pad(ch)}:${pad(cm)} Uhr`;
    } else if (minutes < openMin) {
      message = `Geschlossen · öffnet heute um ${pad(oh)}:${pad(om)} Uhr`;
    } else {
      message = `Geschlossen · öffnet ${nextOpenLabel(day)}`;
    }
  } else {
    message = `Geschlossen · öffnet ${nextOpenLabel(day)}`;
  }

  [ ['statusDot','statusText'], ['statusDot2','statusText2'] ].forEach(([dotId, textId]) => {
    const dot = document.getElementById(dotId);
    const text = document.getElementById(textId);
    if (!dot || !text) return;
    dot.classList.remove('open','closed');
    dot.classList.add(isOpen ? 'open' : 'closed');
    text.textContent = message;
  });

  const row = document.querySelector(`#hoursTable tr[data-day="${day}"]`);
  document.querySelectorAll('#hoursTable tr').forEach(tr => tr.classList.remove('today'));
  if (row) row.classList.add('today');
}

function nextOpenLabel(fromDay) {
  for (let i = 1; i <= 7; i++) {
    const d = (fromDay + i) % 7;
    if (HOURS[d]) {
      const [oh, om] = HOURS[d];
      const label = i === 1 ? 'morgen' : DAY_NAMES[d];
      return `${label} um ${pad(oh)}:${pad(om)} Uhr`;
    }
  }
  return '';
}

updateStatus();
setInterval(updateStatus, 60000);

// ===== Sticky header shadow =====
const header = document.getElementById('siteHeader');
if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();
