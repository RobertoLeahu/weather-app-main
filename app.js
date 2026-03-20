//Códigos de interpretación de tiempo
const weatherCodeMap = {
  0: ["Cielo despejado", "assets/images/icon-sunny.webp"],
  1: ["Mayormente despejado", "assets/images/icon-sunny.webp"],
  2: ["Parcialmente nublado", "assets/images/icon-partly-cloudy.webp"],
  3: ["Cubierto", "assets/images/icon-partly-cloudy.webp"],
  45: ["Niebla", "assets/images/icon-partly-cloudy.webp"],
  48: ["Niebla de escarcha", "assets/images/icon-fog.webp"],
  51: ["Llovizna ligera", "assets/images/icon-drizzle.webp"],
  53: ["Llovizna moderada", "assets/images/icon-drizzle.webp"],
  55: ["Llovizna densa", "assets/images/icon-drizzle.webp"],
  56: ["Llovizna helada ligera", "assets/images/icon-drizzle.webp"],
  57: ["Llovizna helada densa", "assets/images/icon-drizzle.webp"],
  61: ["Lluvia ligera", "assets/images/icon-rain.webp"],
  63: ["Lluvia moderada", "assets/images/icon-rain.webp"],
  65: ["Lluvia intensa", "assets/images/icon-rain.webp"],
  66: ["Lluvia helada ligera", "assets/images/icon-rain.webp"],
  67: ["Lluvia helada densa", "assets/images/icon-rain.webp"],
  71: ["Nieve ligera", "assets/images/icon-snow.webp"],
  73: ["Nieve moderada", "assets/images/icon-snow.webp"],
  75: ["Nieve intensa", "assets/images/icon-snow.webp"],
  77: ["Granos de nieve", "assets/images/icon-snow.webp"],
  80: ["Lluvias ligeras", "assets/images/icon-rain.webp"],
  81: ["Lluvias moderadas", "assets/images/icon-rain.webp"],
  82: ["Lluvias fuertes", "assets/images/icon-rain.webp"],
  85: ["Luz de nieve ligera", "assets/images/icon-snow.webp"],
  86: ["Nevadas fuertes", "assets/images/icon-snow.webp"],
  95: ["Tormenta eléctrica", "assets/images/icon-storm.webp"],
  96: [
    "Tormenta eléctrica con granizo ligero",
    "assets/images/icon-storm.webp",
  ],
  99: [
    "Tormenta eléctrica con granizo fuerte",
    "assets/images/icon-storm.webp",
  ],
};

//Ciudad predeterminada al abrir la app
const DEFAULT_CITY = "Madrid";
document.addEventListener("DOMContentLoaded", loadDefaultWeather(DEFAULT_CITY));

//Estado global en memoria de la app
let currentLat, currentLong, currentCityName, currentCountryName;
let tempUnit = "celsius";
let windUnit = "kmh";
let precipUnit = "mm";

// -- ELEMENTOS DEL DOM --
//Elementos buscador
const searchFrom = document.querySelector(".search-form");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
searchFrom.addEventListener("submit", getLatAndLong);

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

//Eventos abrir/cerrar menús desplegables
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
const unitButtons = document.querySelectorAll('#units-dropdown .dropdown-item');

unitButtons.forEach(button => {
  button.addEventListener('click', () => {
    
    // 1. CAMBIO VISUAL (Mover la clase 'active')
    // Buscamos la sección contenedora (ej: Temperatura) para no quitarle el 'active' a la sección de viento o de precipitación
    const section = button.closest('.dropdown-section');
    section.querySelectorAll('.dropdown-item').forEach(btn => btn.classList.remove('active'));
    
    // Le ponemos el 'active' al botón que acabamos de pulsar
    button.classList.add('active');

    // 2. ACTUALIZAR LA MEMORIA GLOBAL
    const selectedUnit = button.getAttribute('data-unit');

    if (selectedUnit === 'celsius' || selectedUnit === 'fahrenheit') {
      tempUnit = selectedUnit;
    } else if (selectedUnit === 'kmh' || selectedUnit === 'mph') {
      windUnit = selectedUnit;
    } else if (selectedUnit === 'mm' || selectedUnit === 'inch') {
      precipUnit = selectedUnit;
    }

    // 3. RECARGAR LOS DATOS
    // Si ya hay una ciudad cargada en la memoria, volvems a pedir los datos
    if (currentLat && currentLong) {
      getWeather(currentLat, currentLong, currentCityName, currentCountryName);
      
      unitsDropdown.classList.add('hidden'); 
    }
  });
});

// -- LÓGICA DEL BOTÓN Switch to Imperial / Metric --
const switchSystemBtn = document.getElementById("switch-system-btn");

switchSystemBtn.addEventListener("click", () => {
  // 1. Averiguar en qué sistema estamos (si la temperatura es celsius, asumimos Métrico)
  const isMetric = tempUnit === "celsius";

  // 2. Cambiar todas las variables de golpe y el texto del botón
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

  // 3. Actualizamos visualmente los botones pequeños (los "checks")
  unitButtons.forEach((btn) => {
    const unit = btn.getAttribute("data-unit");

    if (tempUnit === "celsius" && windUnit === "kmh" && precipUnit === "mm") {
      switchSystemBtn.innerText = "Switch to Imperial";
    } else if (tempUnit === "fahrenheit" && windUnit === "mph" && precipUnit === "inch") {
      switchSystemBtn.innerText = "Switch to Metric";
    } else {
      // Si hay una mezcla rara (ej: Celsius y mph), ponemos un texto neutro
      switchSystemBtn.innerText = "Mixed System"; 
    }

    // Si el botón coincide con alguna de nuestras nuevas unidades, le ponemos 'active'
    if (unit === tempUnit || unit === windUnit || unit === precipUnit) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // 4. Recargar los datos con la API
  if (currentLat && currentLong) {
    getWeather(currentLat, currentLong, currentCityName, currentCountryName);
    
    // Cerramos el menú para que la experiencia sea fluida
    unitsDropdown.classList.add("hidden");
  }
});

// -- LÓGICA DE LA API --
//Función para obtener la latitud y longitud de una ciudad, para luego utilizar estos datos para recoger los datos meteorológicos.
async function getLatAndLong(event) {
  try {
    //Evitar recargar la página
    event.preventDefault();
    const cityName = searchInput.value.trim();

    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=es`;
    const geoResponse = await fetch(geoURL);
    const geoData = await geoResponse.json();

    if (geoData.results && geoData.results.length) {
      const currentLat = geoData.results[0].latitude;
      const currentLong = geoData.results[0].longitude;
      const currentCityName = geoData.results[0].name;
      const currentCountryName = geoData.results[0].country;
      getWeather(currentLat, currentLong, currentCityName, currentCountryName);
    }
  } catch (error) {
    console.error("Error cargando la ciudad introducida:", error);
  }
}

//Función para recoger los datos meteorológicos necesarios usando la latitud y longitud.
async function getWeather(lat, long, cityName, countryName) {
  try {
    currentLat = lat;
    currentLong = long;
    currentCityName = cityName;
    currentCountryName = countryName;

    const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&precipitation_unit=${precipUnit}`;
    const weatherResponse = await fetch(weatherURL);
    const weatherData = await weatherResponse.json();

    if (weatherData.error) {
      console.error("La API devolvió un error:", weatherData.reason);
      return;
    }

    if (weatherData.current && weatherData.daily) {
      updateUI(weatherData, cityName, countryName);
    }
  } catch (error) {
    console.error(`Error cargando los datos de ${cityName}`, error);
  }
}

//Función para actualizar la UI
function updateUI(weatherData, cityName, countryName) {
  updateCurrentWeather(weatherData, cityName, countryName);
  updateMetrics(weatherData);
  updateDailyForecast(weatherData);
  updateHourlyForecast(weatherData);
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
function updateHourlyForecast(weatherData) {
  const currentData = weatherData.current;
  const hourlyData = weatherData.hourly;
  const currentTimeString = currentData.time;
  const currentHourString = currentTimeString.split(":")[0] + ":00";
  console.log(currentData);
  console.log(hourlyData);

  const day = formatDate(currentData.time, "dayOnly");
  document.querySelector("#hourly-selected-day").innerText = day;

  const startIndex = hourlyData.time.indexOf(currentHourString);

  if (startIndex === -1) {
    console.error("No se encontró la hora actual en el pronóstico.");
    return;
  }

  const hourlyList = document.querySelectorAll(".hourly-card");

  hourlyList.forEach((card, index) => {
    //Indice de la hora + indice del contador
    let apiIndex = startIndex + index;

    //Comprobar que existen datos
    if (hourlyData.time[apiIndex]) {
      // Obtener código y actualizar imagen de clima
      const [condition, imagePath] = weatherCodeMap[
        hourlyData.weather_code[apiIndex]
      ] || ["Unknown", "assets/images/icon-partly-cloudy.webp"];

      card.querySelector(".hourly-icon").src = imagePath;
      card.querySelector(".hourly-icon").alt = condition;

      // Actualizar hora
      const time = formatTime(hourlyData.time[apiIndex]);
      card.querySelector(".hourly-time").innerText = time;

      // Actualizar la temperatura
      const temperature = Math.round(hourlyData.temperature_2m[apiIndex]);
      card.querySelector(".high").innerText = `${temperature}º`;
    }
  });
}

//Función para formatear la hora que devuelve la API
function formatTime(date) {
  const dateObj = new Date(date);
  const options = { hour: "numeric", hour12: true };

  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

//Función para formatear la fecha que devuelve la API
function formatDate(date, mode) {
  const dateObj = new Date(date);
  let options;

  if (mode === "short") {
    options = { weekday: "short" }; // "Mon"
  } else if (mode === "dayOnly") {
    options = { weekday: "long" }; // Monday
  } else {
    options = { weekday: "long", day: "numeric", month: "long" }; // "Monday, March 16"
  }

  let dateFormatted = dateObj.toLocaleDateString("en-US", options);
  return dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
}

//Función para mostrar de manera predeterminada una ciudad al abrir la app
async function loadDefaultWeather(cityName) {
  try {
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=es`;
    const geoResponse = await fetch(geoURL);
    const geoData = await geoResponse.json();

    if (geoData.results && geoData.results.length > 0) {
      var latitude = geoData.results[0].latitude;
      var longitude = geoData.results[0].longitude;
      var name = geoData.results[0].name;
      var country = geoData.results[0].country;
      getWeather(latitude, longitude, name, country);
    }
  } catch (error) {
    console.error("Error cargando ciudad por defecto:", error);
  }
}
