/* ============================================================
   LE CASIER — main.js
   ============================================================ */

// ─────────────────────────────────────────
// 0. CHARGEMENT DONNÉES DEPUIS BURSTFLOW
// ─────────────────────────────────────────
const RESTAURANT_SLUG = 'le-casier';
const BURSTFLOW_API   = 'https://burstflow.fr/api/public/restaurant/' + RESTAURANT_SLUG;

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function formatHoraire(schedule) {
  if (!schedule?.open) return 'Fermé';
  const parts = [];
  if (schedule.lunch)  parts.push(schedule.lunch.start  + ' – ' + schedule.lunch.end);
  if (schedule.dinner) parts.push(schedule.dinner.start + ' – ' + schedule.dinner.end);
  return parts.length ? parts.join(' · ') : 'Ouvert';
}

async function loadRestaurantData() {
  try {
    const res  = await fetch(BURSTFLOW_API);
    if (!res.ok) return;
    const data = await res.json();

    // Nom
    if (data.nom) {
      document.querySelectorAll('[data-bf="nom"]').forEach(el => el.textContent = data.nom);
    }
    // Téléphone
    if (data.telephone) {
      document.querySelectorAll('[data-bf="telephone"]').forEach(el => {
        el.textContent = data.telephone;
        if (el.tagName === 'A') el.href = 'tel:' + data.telephone.replace(/\s/g,'');
      });
    }
    // Adresse
    if (data.adresse) {
      document.querySelectorAll('[data-bf="adresse"]').forEach(el => el.textContent = data.adresse);
    }
    // Email
    if (data.email) {
      document.querySelectorAll('[data-bf="email"]').forEach(el => {
        el.textContent = data.email;
        if (el.tagName === 'A') el.href = 'mailto:' + data.email;
      });
    }
    // Horaires
    if (data.horaires) {
      document.querySelectorAll('[data-bf="horaires"]').forEach(container => {
        container.innerHTML = '';
        [1,2,3,4,5,6,0].forEach(dayIndex => {
          const sched = data.horaires[String(dayIndex)];
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(46,123,166,0.08);font-size:13px;';
          row.innerHTML = `<span style="color:var(--texte-doux)">${JOURS[dayIndex]}</span><span style="color:${sched?.open === false ? 'var(--texte-doux)' : '#fff'}">${formatHoraire(sched)}</span>`;
          container.appendChild(row);
        });
      });
    }
    // Couleur principale
    if (data.couleur) {
      document.documentElement.style.setProperty('--bleu', data.couleur);
    }
  } catch (e) {
    // Silencieux — le site affiche ses valeurs par défaut
  }
}

document.addEventListener('DOMContentLoaded', loadRestaurantData);

// ─────────────────────────────────────────
// 1. CURSEUR + TRAÎNÉE MARINE
// ─────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
const trail  = [];
const TRAIL_COUNT = 10;

for (let i = 0; i < TRAIL_COUNT; i++) {
  const dot = document.createElement('div');
  dot.style.cssText = `position:fixed;width:${4-i*0.3}px;height:${4-i*0.3}px;background:var(--bleu-clair);border-radius:50%;pointer-events:none;z-index:9990;transform:translate(-50%,-50%);opacity:${((TRAIL_COUNT-i)/TRAIL_COUNT)*0.4};`;
  document.body.appendChild(dot);
  trail.push({ el: dot, x: 0, y: 0 });
}

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) { cursor.style.left = mouseX+'px'; cursor.style.top = mouseY+'px'; }
  setTimeout(() => {
    if (ring) { ring.style.left = mouseX+'px'; ring.style.top = mouseY+'px'; }
  }, 80);
});

(function animateTrail() {
  trail[0].x += (mouseX - trail[0].x) * 0.45;
  trail[0].y += (mouseY - trail[0].y) * 0.45;
  for (let i = 1; i < TRAIL_COUNT; i++) {
    trail[i].x += (trail[i-1].x - trail[i].x) * 0.4;
    trail[i].y += (trail[i-1].y - trail[i].y) * 0.4;
    trail[i].el.style.left = trail[i].x + 'px';
    trail[i].el.style.top  = trail[i].y + 'px';
  }
  requestAnimationFrame(animateTrail);
})();

if (cursor && ring) {
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform   = 'translate(-50%,-50%) scale(2.2)';
      ring.style.borderColor = 'rgba(74,175,212,0.9)';
      ring.style.background  = 'rgba(74,175,212,0.08)';
      cursor.style.transform = 'translate(-50%,-50%) scale(0)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform   = 'translate(-50%,-50%) scale(1)';
      ring.style.borderColor = 'rgba(74,175,212,0.5)';
      ring.style.background  = 'transparent';
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
}

// ─────────────────────────────────────────
// 2. NAVBAR SCROLL
// ─────────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
  const links = navbar.querySelectorAll('.nav-links a');
  links.forEach(link => {
    if (link.href === location.href || link.getAttribute('href') === location.pathname.split('/').pop()) {
      link.classList.add('active');
    }
  });
}

// ─────────────────────────────────────────
// 3. REVEAL AU SCROLL
// ─────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObs.observe(el));

// ─────────────────────────────────────────
// 4. TRANSITION PAGE
// ─────────────────────────────────────────
const pt = document.querySelector('.page-transition');
if (pt) {
  window.addEventListener('load', () => {
    pt.style.transformOrigin = 'top';
    pt.style.animation = 'pageOut 0.6s ease forwards';
  });
  const style = document.createElement('style');
  style.textContent = `@keyframes pageOut { from { transform: scaleY(1); } to { transform: scaleY(0); } }
  @keyframes pageIn  { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }`;
  document.head.appendChild(style);
  document.querySelectorAll('a[href]').forEach(a => {
    if (!a.href.startsWith('mailto') && !a.href.startsWith('tel') && !a.href.includes('#') && a.target !== '_blank') {
      a.addEventListener('click', e => {
        const dest = a.href;
        if (dest === location.href) return;
        e.preventDefault();
        pt.style.animation = 'none'; pt.style.transformOrigin = 'bottom'; pt.style.transform = 'scaleY(0)';
        requestAnimationFrame(() => { pt.style.animation = 'pageIn 0.45s ease forwards'; });
        setTimeout(() => { location.href = dest; }, 450);
      });
    }
  });
}

// ─────────────────────────────────────────
// 5. NOTIFICATION
// ─────────────────────────────────────────
function showNotif(title, text) {
  const n = document.getElementById('notif');
  if (!n) return;
  n.querySelector('.notif-title').textContent = title;
  n.querySelector('.notif-text').textContent  = text;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3500);
}
window.showNotif = showNotif;

// ─────────────────────────────────────────
// 6. FORMULAIRE RÉSERVATION
// ─────────────────────────────────────────
const resaForm = document.getElementById('resaForm');
if (resaForm) {
  resaForm.addEventListener('submit', async e => {
    e.preventDefault();
    const slug = resaForm.dataset.restaurantSlug;
    const inputs = resaForm.querySelectorAll('input, select, textarea');
    const fields = {};
    inputs.forEach(el => { if (el.name) fields[el.name] = el.value; });

    // Récupère les champs par position (le form n'a pas de name= sur les inputs)
    const allInputs = [...resaForm.querySelectorAll('input:not([type=hidden]), select, textarea')];
    const data = {
      slug,
      nom:       (allInputs[0]?.value || '') + ' ' + (allInputs[1]?.value || ''),
      email:     allInputs[2]?.value || '',
      telephone: allInputs[3]?.value || '',
      date:      allInputs[4]?.value || '',
      heure:     allInputs[5]?.value === 'Déjeuner (12h00 – 14h30)' ? '12:00' : '19:00',
      personnes: allInputs[6]?.value?.replace(/\D/g,'') || '2',
      message:   allInputs[8]?.value || '',
    };

    try {
      const res = await fetch('https://burstflow.fr/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showNotif('Réservation confirmée', 'Un email de confirmation vous a été envoyé.');
        resaForm.reset();
      } else {
        showNotif('Erreur', 'Veuillez nous contacter directement.');
      }
    } catch {
      showNotif('Erreur réseau', 'Veuillez réessayer ou nous appeler.');
    }
  });
}

// ─────────────────────────────────────────
// 7. FORMULAIRE CONTACT
// ─────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    showNotif('Message envoyé', 'Notre équipe vous répondra dans les meilleurs délais.');
    contactForm.reset();
  });
}

// ─────────────────────────────────────────
// 8. ONDULATIONS (vagues de fond)
// ─────────────────────────────────────────
const waveCanvas = document.getElementById('waveCanvas');
if (waveCanvas) {
  const ctx = waveCanvas.getContext('2d');
  let w, h, t = 0;
  function resize() { w = waveCanvas.width = waveCanvas.offsetWidth; h = waveCanvas.height = waveCanvas.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  function drawWave() {
    ctx.clearRect(0, 0, w, h);
    [0.012, 0.008, 0.005].forEach((freq, i) => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x++) {
        const y = h * 0.6 + Math.sin(x * freq + t + i * 1.2) * (20 + i * 10) + Math.sin(x * 0.02 + t * 0.7) * 12;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = `rgba(46,123,166,${0.06 - i * 0.015})`;
      ctx.fill();
    });
    t += 0.008;
    requestAnimationFrame(drawWave);
  }
  drawWave();
}
