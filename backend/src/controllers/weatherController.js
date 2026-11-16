// @desc    Obtener clima actual y pronóstico por coordenadas (Open-Meteo)
// @route   GET /api/weather?lat=-17.3385&lon=-66.3198
const getWeatherByCoords = async (req, res) => {
  try {
    const lat = req.query.lat || -17.3385;
    const lon = req.query.lon || -66.3198;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FLa_Paz&forecast_days=4`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al consultar servicio meteorológico');
    }

    const data = await response.json();

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

    const currentCode = data.current.weather_code;
    const minToday = Math.round(data.daily.temperature_2m_min[0]);
    const maxToday = Math.round(data.daily.temperature_2m_max[0]);

    // Evaluación automática de alerta agrícola (RF-007 apoyo)
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

    res.json({
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
      forecast
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWeatherByCoords };