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


const canvas = document.getElementById("prabowoCanvas");
const ctx = canvas?.getContext("2d");

if (canvas && ctx) {
  const pixelSize = 12;

  const palette = {
    ".": null,
    o: "#1a1030",
    h: "#e8a92b",
    H: "#ffd470",
    s: "#ffd0a8",
    S: "#d9906a",
    e: "#1a1030",
    r: "#e4506b",
    b: "#3d6fd6",
    B: "#2a4ea3",
    f: "#6a4736",
  };

  // Prabowo-inspired 16x16 sprite
  const sprite = [
    "................",
    ".....oooooo.....",
    "....ohhhhhho....",
    "...ohhHHHHhho...",
    "...ohhhhhhhho...",
    "...ohssssssho...",
    "...oseessssho...",
    "...ohssssssho...",
    "....oSSSSSSo....",
    "...orrrrrrrro...",
    "..obbrrbbbbbbo..",
    "..obbbbbbbbbbo..",
    "..obbbBbbbbbbo..",
    "...oBBBBBBBBo...",
    "....oBBooBBo....",
    "...offfoofffo...",
  ];

  let isKilling = false;
  let animationFrame = 0;
  

  function drawSprite() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const progress = animationFrame;
    const shake = isKilling ? Math.sin(progress * 1.8) * 5 : 0;
    const lift = isKilling ? Math.min(progress * 1.5, 25) : 0;
    const rotation = isKilling ? Math.min(progress * 0.035, 0.5) : 0;

    ctx.save();
    ctx.translate(96 + shake, 96 - lift);
    ctx.rotate(rotation);
    ctx.translate(-96, -96);

    sprite.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (palette[pixel]) {
          ctx.fillStyle = palette[pixel];
          ctx.fillRect(
            x * pixelSize,
            y * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      });
    });

    ctx.restore();

    // Among Us-style kill effect
    if (isKilling && progress > 5 && progress < 22) {
      ctx.save();

      ctx.strokeStyle = "#e4506b";
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(35, 45);
      ctx.lineTo(155, 145);
      ctx.stroke();

      // Bone
      ctx.fillStyle = "#fff4df";
      ctx.fillRect(120, 120, 12, 34);
      ctx.fillRect(112, 118, 10, 10);
      ctx.fillRect(130, 145, 10, 10);

      ctx.restore();
    }
  }

  function animate() {
    if (!isKilling) return;

    animationFrame++;
    drawSprite();

    if (animationFrame < 35) {
      requestAnimationFrame(animate);
    } else {
      isKilling = false;
      animationFrame = 0;
      drawSprite();
    }
  }

  function killPrabowo() {
    if (isKilling) return;

    isKilling = true;
    animationFrame = 0;
    animate();
  }

  canvas.addEventListener("click", killPrabowo);

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    killPrabowo();
  }, { passive: false });

  drawSprite();
}

console.log("Canvas:", document.getElementById("prabowoCanvas"));
console.log("Prabowo widget loaded!");
