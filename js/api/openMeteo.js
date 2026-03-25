// Función para obtener las coordenadas (latitud y longitud) y datos geográficos exactos a partir del nombre de una ciudad.
export async function fetchCoordinates(cityName, lang) {
  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=${lang}`;
  const response = await fetch(geoURL);

  if (!response.ok) {
    throw new Error(`Error de red: ${response.status}`);
  }

  return await response.json();
}

// Función para obtener todos los datos meteorológicos (actuales, por hora y diarios) basándose en unas coordenadas y aplicando las unidades de medida elegidas.
export async function fetchWeather(lat, long, units) {
  const { tempUnit, windUnit, precipUnit } = units;

  const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precipUnit}`;

  const response = await fetch(weatherURL);

  if (!response.ok) {
    throw new Error(`Server Response: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`API Validation Error: ${data.reason}`);
  }

  return data;
}
