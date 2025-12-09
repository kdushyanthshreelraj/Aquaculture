import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, waterType, pondLength, pondWidth } = await req.json();
    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');

    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    console.log('Fetching historical weather data for location:', location);

    // First, get coordinates for the location
    const geoResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!geoResponse.ok) {
      const errorData = await geoResponse.json();
      console.error('OpenWeather API error:', errorData);
      throw new Error(`Failed to fetch location data: ${errorData.message || 'Invalid location or API key'}`);
    }

    const geoData = await geoResponse.json();
    const lat = geoData.coord.lat;
    const lon = geoData.coord.lon;

    // Fetch 7-day historical weather data using One Call API
    const currentTime = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = currentTime - (7 * 24 * 60 * 60);
    
    const historicalResponse = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${sevenDaysAgo}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    let temperature = geoData.main.temp; // Fallback to current temp
    
    if (historicalResponse.ok) {
      const historicalData = await historicalResponse.json();
      // Calculate average temperature from historical data
      const temps = historicalData.data || [];
      if (temps.length > 0) {
        const avgTemp = temps.reduce((sum: number, item: any) => sum + item.temp, 0) / temps.length;
        temperature = avgTemp;
      }
    } else {
      console.log('Using current temperature as historical data unavailable');
    }

    console.log('Average temperature (7-day):', temperature, 'Water type:', waterType);

    // Species detection logic based on temperature and water type
    let species = '';
    const pondArea = pondLength * pondWidth;

    if (waterType === 'freshwater') {
      if (temperature >= 20 && temperature <= 35) {
        // Optimal for most Indian carp species
        if (pondArea > 200) {
          species = 'Catla'; // Larger ponds, warm water
        } else if (pondArea > 100) {
          species = 'Rohu'; // Medium ponds
        } else {
          species = 'Mrigal'; // Smaller ponds
        }
      } else if (temperature >= 25 && temperature <= 32) {
        species = 'Tilapia'; // Thrives in warm freshwater
      } else if (temperature < 20) {
        species = 'Rohu'; // More tolerant to cooler water
      } else {
        species = 'Pangasius'; // Can handle various conditions
      }
    } else if (waterType === 'brackish') {
      if (temperature >= 25 && temperature <= 30) {
        species = 'Tilapia'; // Adaptable to brackish water
      } else {
        species = 'Pangasius'; // Can tolerate brackish conditions
      }
    } else {
      // saltwater - default to most adaptable
      species = 'Tilapia';
    }

    console.log('Detected species:', species);

    return new Response(
      JSON.stringify({
        temperature,
        species,
        location,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in detect-fish-species:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});