const CircuitBreaker = require('opossum');

// Almacén en memoria para el Fallback (respaldo ante caída de Open-Meteo)
const weatherCache = new Map();

// Traducción de códigos WMO de Open-Meteo a español
const getConditionText = (code) => {
  if (code === 0) return 'Despejado';
  if (code >= 1 && code <= 3) return 'Parcialmente nublado';
  if (code === 45 || code === 48) return 'Niebla';
  if (code >= 51 && code <= 67) return 'Llovizna / Lluvia ligera';
  if (code >= 71 && code <= 77) return 'Nieve / Granizo';
  if (code >= 80 && code <= 82) return 'Chubascos';
  if (code >= 95) return 'Tormenta eléctrica';
  return 'Nublado';
};

// 1. Función protegida que realiza la petición externa a Open-Meteo
async function fetchWeatherFromExternalAPI(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FLa_Paz&forecast_days=4`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo respondió con estado HTTP ${response.status}`);
  }

  const data = await response.json();
  const currentCode = data.current.weather_code;
  const minToday = Math.round(data.daily.temperature_2m_min[0]);
  const maxToday = Math.round(data.daily.temperature_2m_max[0]);

  // Evaluación automática de alerta agrícola (RF-007)
  let alertLevel = 'normal';
  let alertTitle = 'Condiciones climáticas estables';
  let alertMessage = 'No se prevén heladas ni eventos extremos para las próximas horas en esta parcela.';

  if (minToday <= 3) {
    alertLevel = 'danger';
    alertTitle = '⚠️ Alerta de Helada Próxima';
    alertMessage = `Temperatura mínima prevista de ${minToday}°C. Se recomienda activar protección térmica o riego preventivo.`;
  } else if (currentCode >= 80 || data.current.wind_speed_10m > 35) {
    alertLevel = 'warning';
    alertTitle = '🌧️ Alerta por Lluvias / Viento Fuerte';
    alertMessage = 'Se pronostican precipitaciones intensas o ráfagas. Asegure cubiertas de invernadero.';
  }

  const forecast = data.daily.time.map((date, idx) => ({
    date,
    condition: getConditionText(data.daily.weather_code[idx]),
    min: Math.round(data.daily.temperature_2m_min[idx]),
    max: Math.round(data.daily.temperature_2m_max[idx])
  }));

  const payload = {
    latitude: Number(lat),
    longitude: Number(lon),
    temp: Math.round(data.current.temperature_2m),
    condition: getConditionText(currentCode),
    min: minToday,
    max: maxToday,
    humidity: data.current.relative_humidity_2m,
    wind: Math.round(data.current.wind_speed_10m),
    alert: {
      level: alertLevel,
      title: alertTitle,
      message: alertMessage
    },
    forecast,
    _architecture: {
      pattern: 'Circuit Breaker (Opossum)',
      circuitState: 'CLOSED',
      dataSource: 'LIVE_OPEN_METEO',
      cachedAt: new Date().toISOString()
    }
  };

  // Guardar copia fresca en caché para uso en caso de contingencia
  weatherCache.set(`${lat},${lon}`, payload);
  return payload;
}

// 2. Configuración del Circuit Breaker
const breakerOptions = {
  timeout: 2500,                // Si Open-Meteo tarda más de 2.5s, aborta y cuenta como fallo
  errorThresholdPercentage: 50, // Si >= 50% de peticiones fallan, abre el circuito
  resetTimeout: 15000           // Tras 15s en OPEN, pasa a HALF-OPEN para probar reconexión
};

const weatherBreaker = new CircuitBreaker(fetchWeatherFromExternalAPI, breakerOptions);

// Eventos observables en consola para auditoría y demostración en vivo
weatherBreaker.on('open', () => {
  console.warn('🔴 [CIRCUIT BREAKER - OPEN] Fallo detectado en Open-Meteo. Cortando llamadas externas y activando Fallback.');
});
weatherBreaker.on('halfOpen', () => {
  console.info('🟡 [CIRCUIT BREAKER - HALF-OPEN] Tiempo de espera cumplido. Probando reconexión con Open-Meteo...');
});
weatherBreaker.on('close', () => {
  console.info('🟢 [CIRCUIT BREAKER - CLOSED] Servicio Open-Meteo restablecido. Operación normal.');
});

// 3. Estrategia Fallback (Degradación elegante con 0% de caída)
weatherBreaker.fallback((lat, lon) => {
  const cacheKey = `${lat},${lon}`;
  const cachedData = weatherCache.get(cacheKey);
  const currentState = weatherBreaker.opened ? 'OPEN' : 'HALF_OPEN_FALLBACK';

  if (cachedData) {
    return {
      ...cachedData,
      _architecture: {
        pattern: 'Circuit Breaker (Opossum)',
        circuitState: currentState,
        dataSource: 'CACHE_FALLBACK',
        cachedAt: cachedData._architecture.cachedAt,
        note: 'Servicio externo no disponible; sirviendo último pronóstico validado.'
      }
    };
  }

  // Fallback de contingencia si nunca hubo caché previa en memoria (Pairumani / Vinto)
  const today = new Date().toISOString().split('T')[0];
  return {
    latitude: Number(lat),
    longitude: Number(lon),
    temp: 15,
    condition: 'Parcialmente nublado (Respaldo)',
    min: 11,
    max: 24,
    humidity: 58,
    wind: 5,
    alert: {
      level: 'normal',
      title: 'Modo Contingencia Activo',
      message: 'Mostrando valores históricos referenciales de Pairumani / Vinto por indisponibilidad temporal del proveedor climático.'
    },
    forecast: [
      { date: today, condition: 'Parcialmente nublado', min: 11, max: 24 }
    ],
    _architecture: {
      pattern: 'Circuit Breaker (Opossum)',
      circuitState: currentState,
      dataSource: 'STATIC_FALLBACK',
      note: 'Sin caché previa; sirviendo línea base climática de Pairumani / Vinto.'
    }
  };
});

module.exports = { weatherBreaker };