//Función para formatear la hora que devuelve la API
export function formatTime(date, currentLang) {
  const dateObj = new Date(date);
  const locale = currentLang === "es" ? "es-ES" : "en-US";

  const options = {
    hour: "numeric",
    hour12: currentLang === "en",
  };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

// Función para formatear la fecha (Dinámica según el idioma)
export function formatDate(date, mode, currentLang) {
  const dateObj = new Date(date);
  let options;

  if (mode === "short") {
    options = { weekday: "short" };
  } else if (mode === "dayOnly") {
    options = { weekday: "long" };
  } else {
    options = { weekday: "long", day: "numeric", month: "long" };
  }

  const locale = currentLang === "es" ? "es-ES" : "en-US";
  let dateFormatted = dateObj.toLocaleDateString(locale, options);

  return dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
}
