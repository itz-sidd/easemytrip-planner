import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lng, categories = '', radius = 5000, limit = 20 } = await req.json()
    
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude parameters are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const FOURSQUARE_API_KEY = Deno.env.get('FOURSQUARE_API_KEY')
    
    if (!FOURSQUARE_API_KEY) {
      // Return empty results if API key is not configured (graceful degradation)
      return new Response(
        JSON.stringify({ results: [], context: { geo_bounds: { circle: { center: { latitude: lat, longitude: lng }, radius } } } }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    let url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&radius=${radius}&limit=${limit}&fields=fsq_id,name,categories,location,geocodes,distance,rating,price,photos`
    
    if (categories) {
      url += `&categories=${categories}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in foursquare-search function:', error)
    // Return empty results on error for graceful degradation
    const { lat = 0, lng = 0, radius = 5000 } = await req.json().catch(() => ({}))
    return new Response(
      JSON.stringify({ results: [], context: { geo_bounds: { circle: { center: { latitude: lat, longitude: lng }, radius } } } }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})