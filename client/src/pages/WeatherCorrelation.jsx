import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Brain,
  Cloud,
  CloudRain,
  CloudSnow,
  Droplets,
  Heart,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wind,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5 * 60 * 1000,
};

const WeatherCorrelation = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [correlations, setCorrelations] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [location, setLocation] = useState('Detecting your location...');
  const [currentWeatherLoading, setCurrentWeatherLoading] = useState(true);
  const [currentWeatherError, setCurrentWeatherError] = useState('');

  useEffect(() => {
    generateMockData();
    loadCurrentLocationWeather();
  }, []);

  const generateMockData = () => {
    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
    const data = [];

    for (let i = 89; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const weatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      const temperature = Math.round(Math.random() * 40) + 40;
      const humidity = Math.round(Math.random() * 60) + 30;
      const pressure = Math.round(Math.random() * 50) + 980;

      let moodBase = 5;
      if (weatherType === 'sunny') moodBase += 1.5;
      if (weatherType === 'rainy') moodBase -= 1;
      if (weatherType === 'snowy') moodBase -= 0.5;
      if (weatherType === 'cloudy') moodBase -= 0.3;
      if (temperature > 70) moodBase += 0.5;
      if (temperature < 50) moodBase -= 0.5;

      const moodScore = Math.max(1, Math.min(10, moodBase + (Math.random() - 0.5) * 2));
      const stressLevel = Math.max(1, Math.min(10, 8 - moodBase + (Math.random() - 0.5) * 2));

      data.push({
        date: date.toISOString().split('T')[0],
        weather: weatherType,
        temperature,
        humidity,
        pressure,
        moodScore: Math.round(moodScore * 10) / 10,
        stressLevel: Math.round(stressLevel * 10) / 10,
        energy: Math.round(
          Math.max(1, Math.min(10, moodBase + 1 + (Math.random() - 0.5) * 2)) * 10,
        ) / 10,
      });
    }

    setWeatherData(data);
    calculateCorrelations(data);
    setLoading(false);
  };

  const loadCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      setLocation('Current location unavailable');
      setCurrentWeatherError('Geolocation is not supported in this browser.');
      setCurrentWeatherLoading(false);
      return;
    }

    setCurrentWeatherLoading(true);
    setCurrentWeatherError('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation(formatCoordinates(latitude, longitude));

        try {
          const [weatherResponse, locationResponse] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,surface_pressure,weather_code,wind_speed_10m&temperature_unit=fahrenheit&timezone=auto`,
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            ),
          ]);

          if (!weatherResponse.ok) {
            throw new Error('Unable to fetch live weather');
          }

          const weatherJson = await weatherResponse.json();
          const locationJson = locationResponse.ok ? await locationResponse.json() : null;
          const current = weatherJson.current;

          setCurrentWeather({
            weather: mapWeatherCode(current.weather_code, current.wind_speed_10m),
            temperature: Math.round(current.temperature_2m),
            humidity: Math.round(current.relative_humidity_2m),
            pressure: Math.round(current.surface_pressure),
            windSpeed: Math.round(current.wind_speed_10m),
            updatedAt: current.time,
          });

          if (locationJson) {
            setLocation(formatLocation(locationJson, latitude, longitude));
          }
        } catch (error) {
          console.error('Error loading live weather:', error);
          setCurrentWeatherError('Unable to fetch live weather right now.');
        } finally {
          setCurrentWeatherLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocation('Current location unavailable');
        setCurrentWeatherError('Allow location access to see live weather for your area.');
        setCurrentWeatherLoading(false);
      },
      GEO_OPTIONS,
    );
  };

  const calculateCorrelations = (data) => {
    const tempMoodCorr = calculateCorrelation(
      data.map((day) => day.temperature),
      data.map((day) => day.moodScore),
    );
    const humidityStressCorr = calculateCorrelation(
      data.map((day) => day.humidity),
      data.map((day) => day.stressLevel),
    );
    const pressureEnergyCorr = calculateCorrelation(
      data.map((day) => day.pressure),
      data.map((day) => day.energy),
    );

    const weatherMoodAvg = {};
    ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'].forEach((weather) => {
      const weatherDays = data.filter((day) => day.weather === weather);
      if (weatherDays.length > 0) {
        const avgMood =
          weatherDays.reduce((sum, day) => sum + day.moodScore, 0) / weatherDays.length;
        const avgStress =
          weatherDays.reduce((sum, day) => sum + day.stressLevel, 0) / weatherDays.length;

        weatherMoodAvg[weather] = {
          mood: Math.round(avgMood * 10) / 10,
          stress: Math.round(avgStress * 10) / 10,
        };
      }
    });

    setCorrelations({
      temperatureMood: tempMoodCorr,
      humidityStress: humidityStressCorr,
      pressureEnergy: pressureEnergyCorr,
      weatherMoodAvg,
    });
  };

  const calculateCorrelation = (x, y) => {
    if (!x.length || x.length !== y.length) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, value, index) => total + value * y[index], 0);
    const sumX2 = x.reduce((total, value) => total + value * value, 0);
    const sumY2 = y.reduce((total, value) => total + value * value, 0);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (!denominator) return 0;

    return Math.round((((n * sumXY - sumX * sumY) / denominator) * 100)) / 100;
  };

  const mapWeatherCode = (weatherCode, windSpeed = 0) => {
    if (windSpeed >= 25) return 'windy';
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return 'snowy';
    if (
      [
        51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
      ].includes(weatherCode)
    ) {
      return 'rainy';
    }
    if ([1].includes(weatherCode)) return 'sunny';
    if ([2, 3, 45, 48].includes(weatherCode)) return 'cloudy';
    return 'sunny';
  };

  const formatCoordinates = (latitude, longitude) =>
    `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

  const formatLocation = (locationData, latitude, longitude) => {
    const address = locationData.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.county ||
      'Current location';
    const region = address.state || address.region;

    if (city && region) return `${city}, ${region}`;
    if (city) return city;

    return formatCoordinates(latitude, longitude);
  };

  const formatWeatherLabel = (weather) => {
    const labels = {
      sunny: 'clear',
      cloudy: 'cloudy',
      rainy: 'rainy',
      snowy: 'snowy',
      windy: 'windy',
    };

    return labels[weather] || weather;
  };

  const getWeatherIcon = (weather, className = 'w-6 h-6') => {
    const icons = {
      sunny: <Thermometer className={`${className} text-yellow-500`} />,
      cloudy: <Cloud className={`${className} text-gray-500`} />,
      rainy: <CloudRain className={`${className} text-blue-500`} />,
      snowy: <CloudSnow className={`${className} text-cyan-500`} />,
      windy: <Wind className={`${className} text-teal-500`} />,
    };

    return icons[weather] || icons.cloudy;
  };

  const getCorrelationColor = (correlation) => {
    if (correlation > 0.3) return 'text-green-600';
    if (correlation < -0.3) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCorrelationIcon = (correlation) => {
    if (correlation > 0.3) return <TrendingUp className="w-4 h-4" />;
    if (correlation < -0.3) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const getFilteredData = () => {
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
    return weatherData.slice(-days);
  };

  const getScatterData = () =>
    getFilteredData().map((day) => ({
      x: day.temperature,
      y: day.moodScore,
      weather: day.weather,
    }));

  const bestWeatherType =
    correlations?.weatherMoodAvg &&
    Object.entries(correlations.weatherMoodAvg).reduce((best, current) =>
      best[1].mood > current[1].mood ? best : current,
    )[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Cloud className="w-8 h-8 text-blue-500" />
            Weather & Mood Correlation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover how weather patterns affect your mental wellness
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadCurrentLocationWeather} className="btn-secondary">
            Refresh current weather
          </button>
          <select
            value={selectedPeriod}
            onChange={(event) => setSelectedPeriod(event.target.value)}
            className="input-field"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>
      </div>

      {currentWeatherLoading && !currentWeather ? (
        <div className="glass-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <div>
              <h3 className="text-lg font-semibold">Loading current weather</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Getting your location and the latest conditions for your area.
              </p>
            </div>
          </div>
        </div>
      ) : currentWeather ? (
        <div className="glass-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Today's Weather</h3>
              <div className="flex items-center gap-4">
                {getWeatherIcon(currentWeather.weather, 'w-10 h-10')}
                <div>
                  <p className="text-2xl font-bold capitalize">
                    {formatWeatherLabel(currentWeather.weather)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{location}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Updated{' '}
                    {new Date(currentWeather.updatedAt).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <Thermometer className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <p className="text-lg font-semibold">{currentWeather.temperature} F</p>
                <p className="text-xs text-gray-600">Temperature</p>
              </div>
              <div>
                <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-semibold">{currentWeather.humidity}%</p>
                <p className="text-xs text-gray-600">Humidity</p>
              </div>
              <div>
                <BarChart3 className="w-5 h-5 mx-auto mb-1 text-sky-500" />
                <p className="text-lg font-semibold">{currentWeather.pressure}</p>
                <p className="text-xs text-gray-600">Pressure</p>
              </div>
              <div>
                <Wind className="w-5 h-5 mx-auto mb-1 text-teal-500" />
                <p className="text-lg font-semibold">{currentWeather.windSpeed}</p>
                <p className="text-xs text-gray-600">Wind</p>
              </div>
            </div>
          </div>
          {currentWeatherError && (
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-4">{currentWeatherError}</p>
          )}
        </div>
      ) : (
        <div className="glass-card p-6 border border-amber-200 dark:border-amber-800">
          <h3 className="text-lg font-semibold">Current weather unavailable</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {currentWeatherError || 'We could not determine your current location.'}
          </p>
        </div>
      )}

      {correlations && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Temperature vs Mood</h4>
              <div className={`flex items-center gap-1 ${getCorrelationColor(correlations.temperatureMood)}`}>
                {getCorrelationIcon(correlations.temperatureMood)}
                <span className="font-medium">{correlations.temperatureMood}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {correlations.temperatureMood > 0.3
                ? 'Higher temperatures improve your mood'
                : correlations.temperatureMood < -0.3
                  ? 'Higher temperatures lower your mood'
                  : 'No strong correlation found'}
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Humidity vs Stress</h4>
              <div className={`flex items-center gap-1 ${getCorrelationColor(correlations.humidityStress)}`}>
                {getCorrelationIcon(correlations.humidityStress)}
                <span className="font-medium">{correlations.humidityStress}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {correlations.humidityStress > 0.3
                ? 'Higher humidity increases stress'
                : correlations.humidityStress < -0.3
                  ? 'Higher humidity reduces stress'
                  : 'No strong correlation found'}
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Pressure vs Energy</h4>
              <div className={`flex items-center gap-1 ${getCorrelationColor(correlations.pressureEnergy)}`}>
                {getCorrelationIcon(correlations.pressureEnergy)}
                <span className="font-medium">{correlations.pressureEnergy}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {correlations.pressureEnergy > 0.3
                ? 'Higher pressure increases energy'
                : correlations.pressureEnergy < -0.3
                  ? 'Higher pressure reduces energy'
                  : 'No strong correlation found'}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Weather & Mood Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getFilteredData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                    value,
                    name === 'moodScore' ? 'Mood Score' : name === 'temperature' ? 'Temperature (F)' : name,
                  ]}
                />
                <Line type="monotone" dataKey="moodScore" stroke="#8b5cf6" strokeWidth={2} name="moodScore" />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="temperature" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Temperature vs Mood Scatter</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={getScatterData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="x" name="Temperature" unit="F" stroke="#9ca3af" />
                <YAxis dataKey="y" name="Mood Score" domain={[0, 10]} stroke="#9ca3af" />
                <Tooltip formatter={(value, name) => [value, name === 'x' ? 'Temperature (F)' : 'Mood Score']} />
                <Scatter dataKey="y" fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {correlations?.weatherMoodAvg && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Average Mood by Weather Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(correlations.weatherMoodAvg).map(([weather, data]) => (
              <motion.div
                key={weather}
                className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex justify-center mb-2">{getWeatherIcon(weather)}</div>
                <p className="font-medium capitalize mb-1">{weather}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span className="text-sm font-semibold">{data.mood}/10</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Brain className="w-3 h-3 text-purple-500" />
                    <span className="text-sm text-gray-600">{data.stress}/10 stress</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Personalized Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-purple-700 dark:text-purple-300">Your Weather Patterns</h4>
            <div className="space-y-2">
              {correlations?.temperatureMood > 0.3 && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your mood improves with warmer temperatures. Consider outdoor activities on sunny days.
                </p>
              )}
              {correlations?.humidityStress > 0.3 && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  High humidity increases your stress. Indoor activities on humid days may help.
                </p>
              )}
              {bestWeatherType && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your best moods occur during {bestWeatherType} weather.
                </p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-pink-700 dark:text-pink-300">Recommendations</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Plan physical activities for weather types that boost your mood.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Use mindfulness techniques during weather that increases stress.
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Continue tracking to discover more patterns over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Weather</th>
                <th className="text-left py-2">Temp</th>
                <th className="text-left py-2">Humidity</th>
                <th className="text-left py-2">Mood</th>
                <th className="text-left py-2">Stress</th>
                <th className="text-left py-2">Energy</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredData()
                .slice(-10)
                .reverse()
                .map((day, index) => (
                  <motion.tr
                    key={day.date}
                    className="border-b border-gray-100 dark:border-gray-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-2">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(day.weather)}
                        <span className="capitalize">{day.weather}</span>
                      </div>
                    </td>
                    <td className="py-2">{day.temperature} F</td>
                    <td className="py-2">{day.humidity}%</td>
                    <td className="py-2">
                      <span
                        className={`font-medium ${
                          day.moodScore >= 7
                            ? 'text-green-600'
                            : day.moodScore >= 5
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {day.moodScore}/10
                      </span>
                    </td>
                    <td className="py-2">{day.stressLevel}/10</td>
                    <td className="py-2">{day.energy}/10</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeatherCorrelation;
