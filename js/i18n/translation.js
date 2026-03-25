// Diccionario i18n con todos los textos estáticos de la aplicación
export const translations = {
  en: {
    app_title: "Weather app",
    lang_en: "English",
    lang_es: "Español",
    units_button: "Units",
    switch_imperial: "Switch to Imperial",
    label_temperature: "Temperature",
    unit_celsius: "Celsius (°C)",
    unit_fahrenheit: "Fahrenheit (°F)",
    label_wind_speed: "Wind Speed",
    unit_kmh: "km/h",
    unit_mph: "mph",
    label_precipitation: "Precipitation",
    unit_mm: "Millimeters (mm)",
    unit_inch: "Inches (in)",
    search_title: "How's the sky looking today?",
    search_placeholder: "Search for a place...",
    search_button: "Search",
    search_error: "No search result found!",
    suggested_cities: "Suggested Cities",
    error_title: "Something went wrong",
    error_description:
      "We couldn't connect to the server (API error). Please try again in a few moments.",
    retry_button: "Retry",
    metric_feels_like: "Feel like",
    metric_humidity: "Humidity",
    metric_wind: "Wind",
    metric_precipitation: "Precipitation",
    daily_forecast_title: "Daily Forecast",
    hourly_forecast_title: "Hourly forecast",
    today: "Today",
    Today: "Today",
  },
  es: {
    app_title: "App del Tiempo",
    lang_en: "English",
    lang_es: "Español",
    units_button: "Unidades",
    switch_imperial: "Cambiar a Imperial",
    label_temperature: "Temperatura",
    unit_celsius: "Celsius (°C)",
    unit_fahrenheit: "Fahrenheit (°F)",
    label_wind_speed: "Velocidad del viento",
    unit_kmh: "km/h",
    unit_mph: "mph",
    label_precipitation: "Precipitación",
    unit_mm: "Milímetros (mm)",
    unit_inch: "Pulgadas (in)",
    search_title: "¿Cómo está el cielo hoy?",
    search_placeholder: "Busca un lugar...",
    search_button: "Buscar",
    search_error: "¡No se encontraron resultados!",
    suggested_cities: "Ciudades sugeridas",
    error_title: "Algo salió mal",
    error_description:
      "No pudimos conectar con el servidor. Por favor, inténtalo de nuevo en unos momentos.",
    retry_button: "Reintentar",
    metric_feels_like: "Sensación",
    metric_humidity: "Humedad",
    metric_wind: "Viento",
    metric_precipitation: "Precipitación",
    daily_forecast_title: "Pronóstico Diario",
    hourly_forecast_title: "Pronóstico por Horas",
    today: "Hoy",
    Today: "Hoy",
  },
};

// Variable global que guarda el idioma actual basándose en LocalStorage o en el idioma del navegador
export let currentLang =
  localStorage.getItem("app_lang") ||
  (navigator.language.startsWith("es") ? "es" : "en");

// Función para aplicar el idioma seleccionado en toda la interfaz, guardar la preferencia del usuario y actualizar los textos estáticos del DOM.
export function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("app_lang", lang);
  document.getElementById("current-lang-text").innerText = lang.toUpperCase();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });

  const searchInput = document.getElementById("search-input");
  if (searchInput && translations[lang].search_placeholder) {
    searchInput.placeholder = translations[lang].search_placeholder;
  }

  document.querySelectorAll(".lang-item").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });
}
