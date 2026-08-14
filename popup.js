const CITIES = [
  { id: "islamabad", name: "Islamabad", latitude: 33.6844, longitude: 73.0479 },
  { id: "topi", name: "Topi", latitude: 34.0708, longitude: 72.6236 },
];

const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const cardsEl = document.getElementById("cards");

function weatherPhrase(code) {
  if (code === 0) return "Sunny";
  if (code === 1) return "Mostly sunny";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Mixed skies";
}

function highlightLine(todayCode, tomorrowCode) {
  const todayLabel = weatherPhrase(todayCode);
  const tomorrow = weatherPhrase(tomorrowCode).toLowerCase();
  return `${todayLabel} today · ${tomorrow} tomorrow`;
}

function forecastUrl(city) {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "temperature_2m,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "Asia/Karachi",
    forecast_days: "2",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function fetchCity(city) {
  const response = await fetch(forecastUrl(city));
  if (!response.ok) {
    throw new Error(`Weather request failed for ${city.name} (${response.status})`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.reason || `Weather request failed for ${city.name}`);
  }
  return data;
}

function fillCard(cityId, data) {
  const card = document.querySelector(`[data-city="${cityId}"]`);
  const currentTemp = Math.round(data.current.temperature_2m);
  const todayMax = Math.round(data.daily.temperature_2m_max[0]);
  const todayMin = Math.round(data.daily.temperature_2m_min[0]);
  const tomorrowMax = Math.round(data.daily.temperature_2m_max[1]);
  const tomorrowMin = Math.round(data.daily.temperature_2m_min[1]);
  const todayCode = data.daily.weather_code[0];
  const tomorrowCode = data.daily.weather_code[1];

  card.querySelector(".temp-value").textContent = String(currentTemp);
  card.querySelector(".range").textContent =
    `Today ${todayMax}° / ${todayMin}° · Tomorrow ${tomorrowMax}° / ${tomorrowMin}°`;
  card.querySelector(".highlight").textContent = highlightLine(
    todayCode,
    tomorrowCode
  );
}

function showError(message) {
  statusEl.hidden = true;
  cardsEl.hidden = true;
  errorEl.hidden = false;
  errorEl.textContent = message;
}

async function loadWeather() {
  try {
    const results = await Promise.all(CITIES.map(fetchCity));
    results.forEach((data, index) => fillCard(CITIES[index].id, data));
    statusEl.hidden = true;
    errorEl.hidden = true;
    cardsEl.hidden = false;
  } catch (err) {
    showError(
      "Could not load the forecast. Check your internet connection and try again."
    );
    console.error(err);
  }
}

loadWeather();
