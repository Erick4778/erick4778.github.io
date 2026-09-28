const WHATSAPP_NUMBER = "5511927078797";
const navMenu = document.querySelector(".nav-menu");
const mobileToggle = document.querySelector(".mobile-toggle");
const jobFilters = document.querySelectorAll(".job-filter");
const jobCards = document.querySelectorAll(".vaga-card");
const hero = document.querySelector(".hero");
const heroCanvas = document.querySelector("#hero-network");

window.switchTab = function switchTab(tabId) {
  const links = document.querySelectorAll(".nav-link, .nav-btn");
  const activeTab = document.getElementById(`tab-${tabId}`);

  links.forEach((link) => {
    link.classList.remove("active");
  });

  if (activeTab) {
    activeTab.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  links.forEach((link) => {
    if (link.getAttribute("onclick") === `switchTab('${tabId}')`) {
      link.classList.add("active");
    }
  });

  navMenu.classList.remove("open");
};

mobileToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

jobFilters.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;

    jobFilters.forEach((filter) => filter.classList.remove("active"));
    button.classList.add("active");

    jobCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.hidden = selectedFilter !== "todas" && !categories.includes(selectedFilter);
    });
  });
});

function openWhatsApp(message) {
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank", "noopener");
}

function getSelectText(form, name) {
  const field = form.elements[name];
  return field?.selectedOptions?.[0]?.textContent || "Não informado";
}

function getFileName(form, name) {
  const field = form.elements[name];
  return field?.files?.[0]?.name || "Não anexado no site";
}

function buildWhatsAppMessage(form) {
  const formData = new FormData(form);
  const formType = form.dataset.formType;

  if (formType === "empresa") {
    return [
      "Olá, vim pelo site da Talentus do RH.",
      "",
      "Quero contratar e preciso de ajuda com uma vaga.",
      `Setor: ${getSelectText(form, "setor")}`,
      `Descrição: ${formData.get("descricao") || "Não informado"}`,
      `Arquivo: ${getFileName(form, "arquivo")}`,
    ].join("\n");
  }

  if (formType === "candidato") {
    return [
      "Olá, vim pelo site da Talentus do RH.",
      "",
      "Quero me candidatar ou entrar no banco de talentos.",
      `Nome: ${formData.get("nome") || "Não informado"}`,
      `Área de interesse: ${getSelectText(form, "area")}`,
      `Currículo: ${getFileName(form, "curriculo")}`,
      "",
      "Currículo anexado pelo site e já recebido por mim.",
    ].join("\n");
  }

  return [
    "Olá, vim pelo site da Talentus do RH.",
    "",
    `Nome: ${formData.get("nome") || "Não informado"}`,
    `Mensagem: ${formData.get("mensagem") || "Não informado"}`,
  ].join("\n");
}

function setupFileLabel(input) {
  const box = input.closest(".file-upload-box");
  const label = box ? box.querySelector("label") : null;
  if (!label) return;

  label.dataset.original = label.innerHTML;

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (file) {
      label.innerHTML = '<i class="fa-solid fa-file-circle-check"></i> ' + file.name;
    } else {
      label.innerHTML = label.dataset.original;
    }
  });
}

document.querySelectorAll('.file-upload-box input[type="file"]').forEach(setupFileLabel);

document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const originalText = button ? button.textContent : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Enviando...";
    }

    // 1) Envia os dados + o ARQUIVO para o Netlify Forms (funciona só no ar)
    try {
      await fetch("/", {
        method: "POST",
        body: new FormData(form),
      });
    } catch (error) {
      // Fora do Netlify falha em silêncio: o WhatsApp abaixo ainda garante o contato.
    }

    // 2) Abre o WhatsApp com o resumo para conversar na hora
    openWhatsApp(buildWhatsAppMessage(form));
    form.reset();

    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
});

function initHeroNetwork() {
  if (!hero || !heroCanvas) return;

  const ctx = heroCanvas.getContext("2d");
  const pointer = { active: false, x: 0, y: 0 };
  const nodes = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frameId = 0;

  function nodeCount() {
    if (window.innerWidth < 640) return 36;
    if (window.innerWidth < 980) return 52;
    return 72;
  }

  function createNodes() {
    nodes.length = 0;
    const count = nodeCount();

    for (let index = 0; index < count; index += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;

      nodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: Math.random() * 1.8 + 1.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    heroCanvas.width = Math.floor(width * dpr);
    heroCanvas.height = Math.floor(height * dpr);
    heroCanvas.style.width = `${width}px`;
    heroCanvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createNodes();
  }

  function updatePointer(event) {
    const rect = hero.getBoundingClientRect();
    pointer.active = true;
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }

  function drawConnections() {
    const maxDistance = window.innerWidth < 700 ? 110 : 145;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.28;
          ctx.strokeStyle = `rgba(192, 132, 252, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawPointerLinks(node) {
    if (!pointer.active) return;

    const dx = pointer.x - node.x;
    const dy = pointer.y - node.y;
    const distance = Math.hypot(dx, dy);
    const radius = window.innerWidth < 700 ? 130 : 185;

    if (distance < radius) {
      const force = 1 - distance / radius;
      ctx.strokeStyle = `rgba(255, 255, 255, ${force * 0.34})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();

      node.vx -= (dx / Math.max(distance, 1)) * force * 0.22;
      node.vy -= (dy / Math.max(distance, 1)) * force * 0.22;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawConnections();

    nodes.forEach((node) => {
      node.phase += 0.008;
      node.vx += (node.baseX - node.x) * 0.003 + Math.cos(node.phase) * 0.006;
      node.vy += (node.baseY - node.y) * 0.003 + Math.sin(node.phase) * 0.006;

      drawPointerLinks(node);

      node.vx *= 0.92;
      node.vy *= 0.92;
      node.x += node.vx;
      node.y += node.vy;

      ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(192, 132, 252, 0.18)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * 3.2, 0, Math.PI * 2);
      ctx.fill();
    });

    frameId = requestAnimationFrame(animate);
  }

  hero.addEventListener("pointermove", updatePointer);
  hero.addEventListener("pointerdown", updatePointer);
  hero.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  hero.addEventListener("pointercancel", () => {
    pointer.active = false;
  });
  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  cancelAnimationFrame(frameId);
  animate();
}

initHeroNetwork();
