
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
let W, H, pts = [];
const mouse  = { x: -999, y: -999 };

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

class Dot {
  constructor() { this.init(true); }
  init(fresh) {
    this.x  = fresh ? Math.random() * W : (Math.random() > 0.5 ? -4 : W + 4);
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.2 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.28;
    this.vy = (Math.random() - 0.5) * 0.28;
    this.o  = Math.random() * 0.4 + 0.08;
    this.p  = Math.random() * Math.PI * 2;
    this.ps = Math.random() * 0.015 + 0.004;
  }
  tick() {
    this.x += this.vx;
    this.y += this.vy;
    this.p += this.ps;
    if (this.x < -8 || this.x > W + 8 || this.y < -8 || this.y > H + 8) this.init(false);
    const dx = this.x - mouse.x, dy = this.y - mouse.y;
    const d  = Math.hypot(dx, dy);
    if (d < 110) {
      const f = (110 - d) / 110;
      this.x += dx / d * f * 1.4;
      this.y += dy / d * f * 1.4;
    }
  }
  draw() {
    const a = this.o * (0.6 + 0.4 * Math.sin(this.p));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(52,199,109,${a})`;
    ctx.fill();
  }
}

function initDots() {
  pts = [];
  const n = Math.min(Math.floor(W * H / 9000), 140);
  for (let i = 0; i < n; i++) pts.push(new Dot());
}

function drawEdges() {
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 100) {
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(52,199,109,${0.08 * (1 - d / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function loop() {
  ctx.clearRect(0, 0, W, H);
  drawEdges();
  pts.forEach(p => { p.tick(); p.draw(); });
  requestAnimationFrame(loop);
}

window.addEventListener('resize',    () => { resize(); initDots(); });
window.addEventListener('mousemove', e  => { mouse.x = e.clientX; mouse.y = e.clientY; });
resize(); initDots(); loop();


/* ─── SCROLL PROGRESS ─── */
const bar = document.getElementById('scrollLine');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  bar.style.width = pct + '%';
});


/* ─── REVEAL ON SCROLL ─── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));


/* ─── ADD PROJECT ─── */
let count = 3;

function addProject() {
  const title  = document.getElementById('pTitle').value.trim();
  const desc   = document.getElementById('pDesc').value.trim();
  const tech   = document.getElementById('pTech').value.trim();
  const github = document.getElementById('pGH').value.trim();

  if (!title) return;

  const card = document.createElement('div');
  card.className = 'pcard reveal on';
  card.innerHTML = `
    <div class="pnum">${String(count).padStart(2, '0')}</div>
    <h3>${title}</h3>
    <p>${desc || 'No description provided.'}</p>
    <div class="pfoot">
      <span class="ptag">${tech || 'Tech'}</span>
      <a href="${github || '#'}" class="plink" target="_blank">GitHub →</a>
    </div>`;

  document.getElementById('projGrid').appendChild(card);
  count++;
  ['pTitle','pDesc','pTech','pGH'].forEach(id => document.getElementById(id).value = '');
}

/* ─── CONTACT FORM SUBMIT ─── */

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  const status = document.getElementById('formStatus');

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });

    const data = await response.json();

    if (data.success) {

      status.style.color = "#34c76d";

      /* interactive message */
      status.style.opacity = "0";
      status.textContent = `Message sent, thank you ${name}!`;

      setTimeout(() => {
        status.style.transition = "opacity 0.5s ease";
        status.style.opacity = "1";
      }, 100);

      contactForm.reset();

    } else {
      status.style.color = "red";
      status.textContent = data.error;
    }

  } catch (error) {
    console.error(error);
    status.style.color = "red";
    status.textContent = "Server error. Please try again.";
  }
});