function analyzePage() {
  const query = new URLSearchParams(window.location.search).get("q");
  if (!query) return;

  const resultBlocks = document.querySelectorAll("div.g");
  let redditCount = 0;
  let youtubeCount = 0;
  let domains = new Set();

  resultBlocks.forEach(block => {
    const link = block.querySelector("a");
    if (!link) return;

    try {
      const hostname = new URL(link.href).hostname;
      domains.add(hostname);

      if (hostname.includes("reddit.com")) redditCount++;
      if (hostname.includes("youtube.com")) youtubeCount++;
    } catch (e) {}
  });

  const domainDiversity = domains.size;

  const aiOverview = document.body.innerText.includes("AI Overview");

  const threatScore =
    (aiOverview ? 30 : 0) +
    redditCount * 5 +
    youtubeCount * 5 +
    (domainDiversity < 5 ? 20 : 0);

  createOverlay({
    query,
    aiOverview,
    redditCount,
    youtubeCount,
    domainDiversity,
    threatScore
  });
}

function createOverlay(info) {
  if (document.getElementById("ai-radar-panel")) return;

  const panel = document.createElement("div");
  panel.id = "ai-radar-panel";

  panel.innerHTML = `
    <div class="radar-header">
      <span>AI Visibility Radar</span>
      <button id="radar-toggle">–</button>
    </div>
    <div class="radar-body">
      <p><strong>Query:</strong> ${info.query}</p>
      <p><strong>AI Overview:</strong> ${info.aiOverview ? "Yes" : "No"}</p>
      <p><strong>Reddit Links:</strong> ${info.redditCount}</p>
      <p><strong>YouTube Links:</strong> ${info.youtubeCount}</p>
      <p><strong>Domain Diversity:</strong> ${info.domainDiversity}</p>
      <p><strong>Threat Score:</strong> ${info.threatScore}/100</p>
    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById("radar-toggle").onclick = () => {
    const body = panel.querySelector(".radar-body");
    body.style.display = body.style.display === "none" ? "block" : "none";
  };
}

window.addEventListener("load", () => {
  setTimeout(analyzePage, 1000);
});
