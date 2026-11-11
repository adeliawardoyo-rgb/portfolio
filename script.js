// Adelia Wardoyo — portfolio interactions
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

// Reveal sections gently as they enter the viewport.
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
