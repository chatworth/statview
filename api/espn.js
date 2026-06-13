export default async function handler(req, res) {
  const { sport, league, type, event, dates, limit } = req.query;

  if (!sport || !league) {
    return res.status(400).json({ error: "sport and league are required" });
  }

  const { team, season, page } = req.query;

  let url;
  if (type === "standings") {
    url = `https://site.api.espn.com/apis/v2/sports/${sport}/${league}/standings`;
    if (season) url += `?season=${season}`;
  } else if (type === "summary" && event) {
    url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${event}`;
  } else if (type === "teams") {
    url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`;
    if (limit) url += `?limit=${limit}`;
  } else if (type === "news") {
    url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/news`;
    const params = [];
    if (team) params.push(`team=${team}`);
    if (limit) params.push(`limit=${limit}`);
    if (page) params.push(`page=${page}`);
    if (params.length) url += `?${params.join("&")}`;
  } else if (type === "schedule" && team) {
    url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${team}/schedule`;
    if (season) url += `?season=${season}`;
  } else {
    url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
    if (dates) url += `?dates=${dates}`;
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `ESPN returned ${response.status}`,
        url,
      });
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=25, stale-while-revalidate=55");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
