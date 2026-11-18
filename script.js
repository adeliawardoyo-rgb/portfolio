const cursorDot = document.querySelector(".cursor-dot");
const cursorOutline = document.querySelector(".cursor-outline");
const flowerContainer = document.querySelector("#flower-trail");
const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const flowers = ["✿", "❀", "✾", "✽"];
const flowerColors = ["pink", "lavender", "light-pink"];
let lastX = 0;
let lastY = 0;

if (desktopPointer) {
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;

    const { clientX: x, clientY: y } = event;

    if (cursorDot && cursorOutline) {
      cursorDot.style.left = `${x}px`;
      cursorDot.style.top = `${y}px`;
      cursorOutline.style.left = `${x}px`;
      cursorOutline.style.top = `${y}px`;
    }

    if (!flowerContainer) return;

    const distance = Math.hypot(x - lastX, y - lastY);
    if (distance < 22) return;

    lastX = x;
    lastY = y;

    const flower = document.createElement("span");
    flower.className = `trail-flower ${flowerColors[Math.floor(Math.random() * flowerColors.length)]}`;
    flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    flower.style.left = `${x}px`;
    flower.style.top = `${y}px`;
    flower.style.setProperty("--drift-x", `${Math.random() * 50 - 25}px`);

    flowerContainer.appendChild(flower);
    flower.addEventListener("animationend", () => flower.remove(), { once: true });
  });
}

document.querySelectorAll("a, button, .expertise-card, .work-item").forEach((element) => {
  element.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
  element.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
});


const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

console.log("%c Adelia Wardoyo — Portfolio ", "background:#dce7d7;color:#263326;padding:8px 12px;border-radius:8px;");

const heroHeading = document.getElementById("hero-heading");

const greetings = [
  "Hi, I'm Adelia Wardoyo.",
  'Building reliable<br><em class="accent">networks & systems.</em>'
];

let currentGreeting = 0;

setInterval(() => {
  heroHeading.classList.add("fade-out");

  setTimeout(() => {
    currentGreeting = (currentGreeting + 1) % greetings.length;
    heroHeading.innerHTML = greetings[currentGreeting];

    heroHeading.classList.remove("fade-out");
  }, 450);

}, 5000);

/* ---------- Butterfly ---------- */
const bf = document.querySelector(".butterfly");
const anchor = document.getElementById("butterfly-anchor");

if (bf && anchor) {
  const SMALL = 90;   // size (px) when it's flying around small
  let size = 400;     // big size, measured from the anchor
  let lastSide = null;
  let hopTimer;

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const lerp  = (a, b, t) => a + (b - a) * t;
  const ease  = (t) => t * t * (3 - 2 * t);

  function measure() {
    size = clamp(anchor.getBoundingClientRect().width, 220, 460);
    bf.style.width = bf.style.height = size + "px";
    update();
  }

  function update() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const a  = anchor.getBoundingClientRect();   // where the big butterfly belongs

    // 0 = top of page, 1 = fully shrunk (after ~70% of a screen)
    const p = clamp(window.scrollY / (vh * 0.7), 0, 1);
    const t = ease(p);

    // switch side every screen of scrolling: 1 = right, -1 = left
    const side = Math.floor(window.scrollY / vh) % 2 === 0 ? 1 : -1;

    const startX = a.left + a.width / 2;
    const startY = a.top + a.height / 2;
    const endX = side === 1 ? vw - SMALL / 2 - 20 : SMALL / 2 + 20;
    const endY = 150;

    const cx = lerp(startX, endX, t);
    const cy = lerp(startY, endY, t);
    const scale = lerp(1, SMALL / size, t);

    bf.style.transform =
      `translate(${cx - size / 2}px, ${cy - size / 2}px) scale(${scale})`;

    bf.style.setProperty("--m", clamp((p - 0.25) / 0.5, 0, 1));
    bf.style.setProperty("--face", side);

    if (lastSide !== null && side !== lastSide) {
      bf.classList.add("hop");
      clearTimeout(hopTimer);
      hopTimer = setTimeout(() => bf.classList.remove("hop"), 900);
    }
    lastSide = side;
  }

  window.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);

  measure();
  requestAnimationFrame(() => bf.classList.add("ready"));
}
