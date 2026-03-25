import { fetchCoordinates, fetchWeather, fetchSuggestionsAPI } from './api/openMeteo.js';
import { weatherCodeMap, predefinedCities } from './utils/constants.js';

//Iniciar app
document.addEventListener("DOMContentLoaded", initApp);

let globalWeatherData = null;

//Estado global en memoria de la app
let currentLat, currentLong, currentCityName, currentCountryName;
let tempUnit = localStorage.getItem("tempUnit") || "celsius";
let windUnit = localStorage.getItem("windUnit") || "kmh";
let precipUnit = localStorage.getItem("precipUnit") || "mm";

// -- ELEMENTOS DEL DOM --
//Elementos buscador
let searchTimeout;
const searchFrom = document.querySelector(".search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchSuggestions = document.getElementById("search-suggestions");
const searchError = document.getElementById("search-error");
const weatherContent = document.getElementById("weather-content");
const clearBtn = document.getElementById("clear-btn");
searchFrom.addEventListener("submit", handleSearch);

//Elementos ciudades sugeridas
const defaultSuggestionsContainer = document.getElementById(
  "default-suggestions",
);
const suggestedCitiesList = document.getElementById("suggested-cities-list");

//Elementos tiempo actual
const locationDisplay = document.getElementById("location");
const dateDisplay = document.getElementById("date");
const weatherDisplay = document.getElementById("current-weather");
const temperatureDisplay = document.getElementById("current-temperature");
const feelLikeDisplay = document.getElementById("feel-like");
const humidityDsiplay = document.getElementById("humidity");
const windDisplay = document.getElementById("wind");
const precipitationDisplay = document.getElementById("precipitation");

//Elementos de los desplegables
const unitsBtn = document.getElementById("units-btn");
const unitsDropdown = document.getElementById("units-dropdown");
const hourlyBtn = document.getElementById("hourly-btn");
const daysDropdown = document.getElementById("days-dropdown");

//Elementos mensaje de error de la API
const apiErrorContent = document.getElementById("api-error-content");
const apiErrorCode = document.getElementById("api-error-code");
const searchSection = document.querySelector(".search-section");
const retryBtn = document.getElementById("retry-btn");

//Evento de clic al botón "X"
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.classList.add("hidden");
  searchSuggestions.classList.add("hidden");
  searchError.classList.add("hidden");

  defaultSuggestionsContainer.classList.remove("hidden");

  if (globalWeatherData) {
    weatherContent.classList.remove("hidden");
  }

  searchInput.focus();
});

// Evento para el botón de "Retry" cuando la API da error
retryBtn.addEventListener("click", () => {
  location.reload();
});

//Eventos abrir/cerrar menús desplegables
searchInput.addEventListener("input", (event) => {
  const query = event.target.value.trim();
  clearTimeout(searchTimeout);

  if (query.length > 0) {
    clearBtn.classList.remove("hidden");
  } else {
    clearBtn.classList.add("hidden");
    defaultSuggestionsContainer.classList.remove("hidden");

    if (globalWeatherData) {
      weatherContent.classList.remove("hidden");
    }
    searchError.classList.add("hidden");
  }

  if (query.length < 2) {
    searchSuggestions.innerHTML = "";
    searchSuggestions.classList.add("hidden");
    return;
  }

  searchTimeout = setTimeout(() => {
    fetchSuggestions(query);
  }, 300);
});

unitsBtn.addEventListener("click", () => {
  unitsDropdown.classList.toggle("hidden");
  daysDropdown.classList.add("hidden");
});

hourlyBtn.addEventListener("click", () => {
  daysDropdown.classList.toggle("hidden");
  unitsDropdown.classList.add("hidden");
});

//Cerrar menús al hacer clic fuera de ellos
document.addEventListener("click", (event) => {
  if (
    !searchFrom.contains(event.target) &&
    !searchSuggestions.contains(event.target)
  ) {
    searchSuggestions.classList.add("hidden");
  }

  if (
    !unitsBtn.contains(event.target) &&
    !unitsDropdown.contains(event.target)
  ) {
    unitsDropdown.classList.add("hidden");
  }

  if (
    !hourlyBtn.contains(event.target) &&
    !daysDropdown.contains(event.target)
  ) {
    daysDropdown.classList.add("hidden");
  }
});

// -- LÓGICA DE LOS BOTONES DE UNIDADES -
// Seleccionamos todos los botones dentro del menú desplegable
const unitButtons = document.querySelectorAll("#units-dropdown .dropdown-item");

unitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const section = button.closest(".dropdown-section");
    section
      .querySelectorAll(".dropdown-item")
      .forEach((btn) => btn.classList.remove("active"));

    // Le ponemos el 'active' al botón que acabamos de pulsar
    button.classList.add("active");

    const selectedUnit = button.getAttribute("data-unit");

    if (selectedUnit === "celsius" || selectedUnit === "fahrenheit") {
      tempUnit = selectedUnit;
      localStorage.setItem("tempUnit", tempUnit);
    } else if (selectedUnit === "kmh" || selectedUnit === "mph") {
      windUnit = selectedUnit;
      localStorage.setItem("windUnit", windUnit);
    } else if (selectedUnit === "mm" || selectedUnit === "inch") {
      precipUnit = selectedUnit;
      localStorage.setItem("precipUnit", precipUnit);
    }

    if (currentLat && currentLong) {
      loadWeatherAndUI(currentLat, currentLong, currentCityName, currentCountryName);

      unitsDropdown.classList.add("hidden");
    }
  });
});

// -- LÓGICA DEL BOTÓN Switch to Imperial / Metric --
const switchSystemBtn = document.getElementById("switch-system-btn");

switchSystemBtn.addEventListener("click", () => {
  const isMetric = tempUnit === "celsius";

  if (isMetric) {
    // Pasar a Imperial
    tempUnit = "fahrenheit";
    windUnit = "mph";
    precipUnit = "inch";
    switchSystemBtn.innerText = "Switch to Metric";
  } else {
    // Pasar a Métrico
    tempUnit = "celsius";
    windUnit = "kmh";
    precipUnit = "mm";
    switchSystemBtn.innerText = "Switch to Imperial";
  }

  //Guardar datos en LocalStorage
  localStorage.setItem("tempUnit", tempUnit);
  localStorage.setItem("windUnit", windUnit);
  localStorage.setItem("precipUnit", precipUnit);

  unitButtons.forEach((btn) => {
    const unit = btn.getAttribute("data-unit");

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

    if (unit === tempUnit || unit === windUnit || unit === precipUnit) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (currentLat && currentLong) {
    loadWeatherAndUI(currentLat, currentLong, currentCityName, currentCountryName);

    unitsDropdown.classList.add("hidden");
  }
});

// -- LÓGICA DE LA API --
//Función para obtener la latitud y longitud de una ciudad, para luego utilizar estos datos para recoger los datos meteorológicos.
async function handleSearch(event) {
  event.preventDefault();
  const cityName = searchInput.value.trim();

  if (!cityName) return;

  try {
    // Usamos el módulo importado
    const geoData = await fetchCoordinates(cityName, currentLang);

    if (geoData.results && geoData.results.length > 0) {
      searchError.classList.add("hidden");
      weatherContent.classList.remove("hidden");
      defaultSuggestionsContainer.classList.add("hidden");
      searchSuggestions.classList.add("hidden");

      const { latitude, longitude, name, country } = geoData.results[0];
      
      // Llamamos a la nueva función de clima
      await loadWeatherAndUI(latitude, longitude, name, country);
    } else {
      weatherContent.classList.add("hidden");
      searchError.classList.remove("hidden");
      searchSuggestions.classList.add("hidden");
      defaultSuggestionsContainer.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error cargando la ciudad introducida:", error);
    showApiError();
  }
}

//Función para recoger los datos meteorológicos necesarios usando la latitud y longitud.
async function loadWeatherAndUI(lat, long, cityName, countryName) {
  // Actualizamos el estado global
  currentLat = lat;
  currentLong = long;
  currentCityName = cityName;
  currentCountryName = countryName;

  try {
    // Empaquetamos las unidades para enviarlas al módulo
    const units = { tempUnit, windUnit, precipUnit };
    
    // Usamos el módulo importado
    const weatherData = await fetchWeather(lat, long, units);
    globalWeatherData = weatherData;

    // Actualizamos la interfaz
    searchError.classList.add("hidden");
    apiErrorContent.classList.add("hidden");
    weatherContent.classList.remove("hidden");

    updateUI(weatherData, cityName, countryName);
  } catch (error) {
    console.error("Critical error fetching weather data:", error);
    showApiError();
  }
}

//Función para actualizar la UI
function updateUI(weatherData, cityName, countryName) {
  updateCurrentWeather(weatherData, cityName, countryName);
  updateMetrics(weatherData);
  updateDailyForecast(weatherData);
  updateHourlyForecast(weatherData);
}

//Función para aplicar las clases 'active' correctas al cargar la página
function syncUnitsUI() {
  unitButtons.forEach((btn) => {
    const unit = btn.getAttribute("data-unit");
    if (unit === tempUnit || unit === windUnit || unit === precipUnit) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  //Actualizar el texto del botón principal según lo que haya guardado
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

//Función para actualizar los datos del clima actual
function updateCurrentWeather(weatherData, cityName, countryName) {
  //Actualizar ciudad y país
  if (countryName && cityName != countryName) {
    locationDisplay.innerText = `${cityName}, ${countryName}`;
  } else {
    locationDisplay.innerText = `${cityName}`;
  }

  //Actualizar fecha
  const date = formatDate(weatherData.current.time);
  dateDisplay.innerText = date;
  //Obtener código de interpretación de tiempo y actualizar imagen del tiempo actual
  const currentWeatherCode = weatherData.current.weather_code;
  const [condition, imagePath] = weatherCodeMap[currentWeatherCode] || [
    "Unknow",
    "assets/images/default.webp",
  ];

  weatherDisplay.src = imagePath;
  weatherDisplay.alt = condition;

  //Actualizar temperatura
  temperatureDisplay.innerText = `${Math.round(weatherData.current.temperature_2m)}º`;
}

//Función para actualizar los datos de métrica del clima actual.
function updateMetrics(weatherData) {
  //Actualizar sensación termica
  const apparent_temperature = weatherData.current.apparent_temperature;
  feelLikeDisplay.innerText = `${Math.round(apparent_temperature)}º`;
  //Actualizar humedad
  const relative_humidity_2m = weatherData.current.relative_humidity_2m;
  humidityDsiplay.innerText = `${relative_humidity_2m}%`;
  //Actualizar viento
  const wind_speed_10m = weatherData.current.wind_speed_10m;
  const windUnit = weatherData.current_units.wind_speed_10m;
  windDisplay.innerText = `${wind_speed_10m} ${windUnit}`;
  //Actualizar precipitación
  const precipitacion = weatherData.current.precipitation;
  const precipUnit = weatherData.current_units.precipitation;
  precipitationDisplay.innerText = `${precipitacion} ${precipUnit}`;
}

//Función para actualizar el clima diario
function updateDailyForecast(weatherData) {
  const dailyData = weatherData.daily;
  const dayCards = document.querySelectorAll(".day-card");

  dayCards.forEach((card, index) => {
    //Actualizar día
    const dayName = formatDate(dailyData.time[index], "short");
    card.querySelector(".day-name").innerText = dayName;

    //Actualizar imagen del tiempo
    const weatherCode = dailyData.weather_code[index];
    const [condition, imagePath] = weatherCodeMap[weatherCode] || [
      "Unknown",
      "assets/images/default.webp",
    ];
    card.querySelector(".day-icon").src = imagePath;
    card.querySelector(".day-icon").alt = condition;

    //Actualizar maximo  y mínimo
    const maxTemperature = dailyData.temperature_2m_max[index];
    const minTemperature = dailyData.temperature_2m_min[index];
    card.querySelector(".high").innerText = `${Math.round(maxTemperature)}º`;
    card.querySelector(".low").innerText = `${Math.round(minTemperature)}º`;
  });
}

// Función para actualizar el pronóstico por horas
function updateHourlyForecast(weatherData, targetDateString = null) {
  const currentData = weatherData.current;
  const hourlyData = weatherData.hourly;
  const dailyData = weatherData.daily;

  const dropdownButtons = document.querySelectorAll(
    "#days-dropdown .dropdown-item",
  );

  dailyData.time.forEach((dateString, index) => {
    if (dropdownButtons[index]) {
      const btn = dropdownButtons[index];
      const dayName = formatDate(dateString, "dayOnly");

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
        updateHourlyForecast(globalWeatherData, dateString);
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
      card.querySelector(".hourly-icon").src = imagePath;
      card.querySelector(".hourly-icon").alt = condition;

      const time = formatTime(hourlyData.time[apiIndex]);
      card.querySelector(".hourly-time").innerText = time;

      const temperature = Math.round(hourlyData.temperature_2m[apiIndex]);
      card.querySelector(".high").innerText = `${temperature}${tempUnit}`;
    }
  });
}

//Función para formatear la hora que devuelve la API
function formatTime(date) {
  const dateObj = new Date(date);

  const locale = currentLang === "es" ? "es-ES" : "en-US";

  const options = {
    hour: "numeric",
    hour12: currentLang === "en",
  };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

// Función para formatear la fecha (Dinámica según el idioma)
function formatDate(date, mode) {
  const dateObj = new Date(date);
  let options;

  if (mode === "short") {
    options = { weekday: "short" }; // "Mon" o "lun"
  } else if (mode === "dayOnly") {
    options = { weekday: "long" }; // "Monday" o "lunes"
  } else {
    options = { weekday: "long", day: "numeric", month: "long" }; // "Monday, March 16" o "lunes, 16 de marzo"
  }

  const locale = currentLang === "es" ? "es-ES" : "en-US";
  let dateFormatted = dateObj.toLocaleDateString(locale, options);

  return dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
}

//Función para obtener y mostrar las sugerencias de ciudades
async function fetchSuggestions(query) {
  try {
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=${currentLang}`;
    const response = await fetch(geoURL);
    const data = await response.json();

    searchSuggestions.innerHTML = "";
    searchError.classList.add("hidden");

    if (data.results && data.results.length > 0) {
      data.results.forEach((city) => {
        const li = document.createElement("li");
        li.className = "suggestion-item";
        const stateInfo = city.admin1 ? `${city.admin1}, ` : "";
        li.innerText = `${city.name}, ${stateInfo}${city.country}`;

        li.addEventListener("click", () => {
          searchInput.value = city.name;
          searchSuggestions.classList.add("hidden");
          defaultSuggestionsContainer.classList.add("hidden");
          loadWeatherAndUI(city.latitude, city.longitude, city.name, city.country);
        });

        searchSuggestions.appendChild(li);
      });

      searchSuggestions.classList.remove("hidden");
    } else {
      searchSuggestions.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error buscando sugerencias:", error);
  }
}

//Función para mostrar de manera predeterminada una ciudad al abrir la app
/* async function loadDefaultWeather(cityName) {
  try {
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=es`;
    const geoResponse = await fetch(geoURL);
    const geoData = await geoResponse.json();

    if (geoData.results && geoData.results.length > 0) {
      var latitude = geoData.results[0].latitude;
      var longitude = geoData.results[0].longitude;
      var name = geoData.results[0].name;
      var country = geoData.results[0].country;
      loadWeatherAndUI(latitude, longitude, name, country);
    }
  } catch (error) {
    console.error("Error cargando ciudad por defecto:", error);
    showApiError();
  }
} */

//Función para sugerir 5 ciudades aleatorias
function renderDefaultSuggestions() {
  suggestedCitiesList.innerHTML = "";

  const randomCities = [...predefinedCities]
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  randomCities.forEach((city) => {
    const btn = document.createElement("button");
    btn.className = "suggested-city-btn";
    btn.innerText = city.name;

    btn.addEventListener("click", () => {
      searchInput.value = city.name;
      clearBtn.classList.remove("hidden");
      defaultSuggestionsContainer.classList.add("hidden");
      loadWeatherAndUI(city.lat, city.long, city.name, city.country);
    });

    suggestedCitiesList.appendChild(btn);
  });
}

// Función mostrar error de conexión a la API
function showApiError() {
  searchSection.classList.add("hidden");
  weatherContent.classList.add("hidden");
  apiErrorContent.classList.remove("hidden");
}

// Función inicialización de la app / reconocer ubicación del usuario
function initApp() {
  syncUnitsUI();
  renderDefaultSuggestions();

  defaultSuggestionsContainer.classList.remove("hidden");

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        try {
          const reverseGeoURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`;
          const response = await fetch(reverseGeoURL);
          const data = await response.json();

          const cityName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Tu ubicación";
          const countryName = data.address.country || "";

          loadWeatherAndUI(lat, long, cityName, countryName);
        } catch (error) {
          console.error("Error al obtener el nombre de la ubicación:", error);
          loadWeatherAndUI(lat, long, "Tu ubicación actual", "");
        }
      },
      (error) => {
        console.warn("Cargando ciudad por defecto...");
        loadWeatherAndUI(40.4165, -3.7026, "Madrid", "Spain");
      },
    );
  } else {
    loadWeatherAndUI(40.4165, -3.7026, "Madrid", "Spain");
  }
}
