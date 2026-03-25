import { formatTime, formatDate } from "../utils/helpers.js";
import { weatherCodeMap } from "../utils/constants.js";
import { translations } from "../i18n/translation.js";

// Función para actualizar toda la interfaz gráfica llamando a las demás funciones de renderizado.
export function updateUI(weatherData, cityName, countryName, currentLang) {
  updateCurrentWeather(weatherData, cityName, countryName, currentLang);
  updateMetrics(weatherData);
  updateDailyForecast(weatherData, currentLang);
  updateHourlyForecast(weatherData, null, currentLang);
}

// Función para mostrar los datos principales del clima actual (ciudad, fecha, icono y temperatura).
function updateCurrentWeather(weatherData, cityName, countryName, currentLang) {
  const locationDisplay = document.getElementById("location");
  const dateDisplay = document.getElementById("date");
  const weatherDisplay = document.getElementById("current-weather");
  const temperatureDisplay = document.getElementById("current-temperature");

  if (countryName && cityName != countryName) {
    locationDisplay.innerText = `${cityName}, ${countryName}`;
  } else {
    locationDisplay.innerText = `${cityName}`;
  }

  const date = formatDate(weatherData.current.time, undefined, currentLang);
  dateDisplay.innerText = date;

  const currentWeatherCode = weatherData.current.weather_code;
  const [condition, imagePath] = weatherCodeMap[currentWeatherCode] || [
    "Unknown",
    "assets/images/default.webp",
  ];

  weatherDisplay.src = imagePath;
  weatherDisplay.alt = condition;
  temperatureDisplay.innerText = `${Math.round(weatherData.current.temperature_2m)}º`;
}

// Función para actualizar las tarjetas de métricas adicionales (sensación térmica, humedad, viento y precipitación).
function updateMetrics(weatherData) {
  const feelLikeDisplay = document.getElementById("feel-like");
  const humidityDsiplay = document.getElementById("humidity");
  const windDisplay = document.getElementById("wind");
  const precipitationDisplay = document.getElementById("precipitation");

  feelLikeDisplay.innerText = `${Math.round(weatherData.current.apparent_temperature)}º`;
  humidityDsiplay.innerText = `${weatherData.current.relative_humidity_2m}%`;
  windDisplay.innerText = `${weatherData.current.wind_speed_10m} ${weatherData.current_units.wind_speed_10m}`;
  precipitationDisplay.innerText = `${weatherData.current.precipitation} ${weatherData.current_units.precipitation}`;
}

// Función para pintar el pronóstico diario general en la cuadrícula de tarjetas.
function updateDailyForecast(weatherData, currentLang) {
  const dailyData = weatherData.daily;
  const dayCards = document.querySelectorAll(".day-card");

  dayCards.forEach((card, index) => {
    const dayName = formatDate(dailyData.time[index], "short", currentLang);
    card.querySelector(".day-name").innerText = dayName;

    const weatherCode = dailyData.weather_code[index];
    const [condition, imagePath] = weatherCodeMap[weatherCode] || [
      "Unknown",
      "assets/images/default.webp",
    ];

    const icon = card.querySelector(".day-icon");
    icon.src = imagePath;
    icon.alt = condition;

    card.querySelector(".high").innerText =
      `${Math.round(dailyData.temperature_2m_max[index])}º`;
    card.querySelector(".low").innerText =
      `${Math.round(dailyData.temperature_2m_min[index])}º`;
  });
}

// Función para mostrar el pronóstico por horas del día seleccionado y gestionar el menú desplegable de días.
function updateHourlyForecast(
  weatherData,
  targetDateString = null,
  currentLang,
) {
  const currentData = weatherData.current;
  const hourlyData = weatherData.hourly;
  const dailyData = weatherData.daily;

  const dropdownButtons = document.querySelectorAll(
    "#days-dropdown .dropdown-item",
  );

  dailyData.time.forEach((dateString, index) => {
    if (dropdownButtons[index]) {
      const btn = dropdownButtons[index];
      const dayName = formatDate(dateString, "dayOnly", currentLang);

      btn.innerText = index === 0 ? translations[currentLang].today : dayName;
      btn.classList.remove("active");

      if (
        (!targetDateString && index === 0) ||
        targetDateString === dateString
      ) {
        btn.classList.add("active");
        document.querySelector("#hourly-selected-day").innerText =
          btn.innerText;
      }

      btn.onclick = () => {
        updateHourlyForecast(weatherData, dateString, currentLang);
        document.getElementById("days-dropdown").classList.add("hidden");
      };
    }
  });

  let startIndex = 0;
  const timeParts = currentData.time.split("T");
  const currentHour = timeParts[1].split(":")[0];
  const targetDate = targetDateString || dailyData.time[0];
  const searchString = `${targetDate}T${currentHour}:00`;

  startIndex = hourlyData.time.indexOf(searchString);

  if (startIndex === -1) return;

  const hourlyList = document.querySelectorAll(".hourly-card");
  const tempUnit = weatherData.hourly_units.temperature_2m;

  hourlyList.forEach((card, index) => {
    let apiIndex = startIndex + index;

    if (hourlyData.time[apiIndex]) {
      const [condition, imagePath] = weatherCodeMap[
        hourlyData.weather_code[apiIndex]
      ] || ["Unknown", "assets/images/icon-partly-cloudy.webp"];

      const icon = card.querySelector(".hourly-icon");
      icon.src = imagePath;
      icon.alt = condition;

      const time = formatTime(hourlyData.time[apiIndex], currentLang);
      card.querySelector(".hourly-time").innerText = time;

      const temperature = Math.round(hourlyData.temperature_2m[apiIndex]);
      card.querySelector(".high").innerText = `${temperature}${tempUnit}`;
    }
  });
}

// Función para marcar visualmente qué unidades de medida están activas en los menús desplegables y el botón principal.
export function syncUnitsUI(tempUnit, windUnit, precipUnit) {
  const unitButtons = document.querySelectorAll(
    "#units-dropdown .dropdown-item",
  );
  const switchSystemBtn = document.getElementById("switch-system-btn");

  unitButtons.forEach((btn) => {
    const unit = btn.getAttribute("data-unit");
    if (unit === tempUnit || unit === windUnit || unit === precipUnit) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (tempUnit === "celsius" && windUnit === "kmh" && precipUnit === "mm") {
    switchSystemBtn.innerText = "Switch to Imperial";
  } else if (
    tempUnit === "fahrenheit" &&
    windUnit === "mph" &&
    precipUnit === "inch"
  ) {
    switchSystemBtn.innerText = "Switch to Metric";
  } else {
    switchSystemBtn.innerText = "Mixed System";
  }
}

// Función para ocultar el contenido principal y mostrar la pantalla de error cuando falla la conexión con la API.
export function showApiError() {
  document.querySelector(".search-section").classList.add("hidden");
  document.getElementById("weather-content").classList.add("hidden");
  document.getElementById("api-error-content").classList.remove("hidden");
}
