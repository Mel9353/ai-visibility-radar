const API_KEY = "YOUR_SERPAPI_KEY";

async function analyzeSERP() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (!query) return;

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?q=${query}&engine=google&api_key=${API_KEY}`
    );

    const data = await response.json();

    const aiOverview = !!data.ai_overview;
    const organicResults = data.organic_results || [];

    let redditCount = 0;
    let youtubeCount = 0;
    let domains = new Set();

    organicResults.slice(0, 10).forEach(result => {
      const link = result.link || "";
      try {
        const hostname = new URL(link).hostname;
        domains.add(hostname);

        if (hostname.includes("reddit.com")) redditCount++;
        if (hostname.includes("youtube.com")) youtubeCount++;
      } catch (e) {}
    });

    const domainDiversity = domains.size;

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

  } catch (error) {
    console.error("Radar error:", error);
  }
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
      <p><strong>Reddit in Top 10:</strong> ${info.redditCount}</p>
      <p><strong>YouTube in Top 10:</strong> ${info.youtubeCount}</p>
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

analyzeSERP();
