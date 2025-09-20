import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TravelPreferences {
  preferred_group_type?: string;
  budget_range?: { min: number; max: number };
  preferred_hotel_category?: string;
  transport_preferences?: string[];
  interests?: string[];
  dietary_restrictions?: string[];
  accessibility_needs?: string[];
}

function createTravelGuidePrompt(preferences: TravelPreferences): string {
  return `You are an expert travel advisor. Generate a comprehensive, personalized travel guide based on the user's preferences. 

User Preferences:
- Group Type: ${preferences.preferred_group_type || 'Not specified'}
- Budget Range: $${preferences.budget_range?.min || 0} - $${preferences.budget_range?.max || 10000}
- Hotel Category: ${preferences.preferred_hotel_category || 'Not specified'}
- Transport Preferences: ${preferences.transport_preferences?.join(', ') || 'Not specified'}
- Interests: ${preferences.interests?.join(', ') || 'Not specified'}
- Dietary Restrictions: ${preferences.dietary_restrictions?.join(', ') || 'None'}
- Accessibility Needs: ${preferences.accessibility_needs?.join(', ') || 'None'}

Create a comprehensive travel guide covering these sections:

## 🛫 Flight Booking Strategies
- Best booking times and price tracking tips
- Airline recommendations based on their budget and preferences
- Seasonal pricing insights

## 🏨 Hotel Selection Guide
- Category-specific advice based on their hotel preference
- Best booking platforms and timing
- Location selection tips

## 💰 Budget Management
- Expense tracking strategies
- Cost-saving tips specific to their budget range
- Currency considerations and money-saving apps

## 📅 Perfect Timing
- Best travel seasons and weather patterns
- Crowd level considerations
- Local events and festivals to consider

## 🍽️ Food Discovery
- Restaurant finding strategies
- Local cuisine recommendations
- Dietary restriction accommodation tips

## 🌤️ Weather Insights
- Climate considerations for different seasons
- Packing suggestions based on weather
- Activity planning around weather patterns

## 🗺️ Area Exploration
- Hidden gems and off-the-beaten-path suggestions
- Popular attractions based on their interests
- Local transportation tips

## 👥 Group Travel Tips
- Specific advice for their group type
- Group booking strategies
- Activity recommendations for groups

${preferences.accessibility_needs?.length ? '## ♿ Accessibility Accommodations\n- Specific tips for accessible travel\n- Recommended services and resources' : ''}

Make each section detailed, actionable, and personalized to their specific preferences. Use a friendly, helpful tone and include specific tips they can immediately implement.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Travel Chat function called');
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found');
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { preferences, action = 'generate_guide' } = await req.json();
    console.log('Request data:', { preferences, action });

    if (action === 'generate_guide') {
      const prompt = createTravelGuidePrompt(preferences);
      console.log('Generated prompt for Gemini');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', response.status, errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini response received');

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Unexpected Gemini response structure:', data);
        throw new Error('Invalid response from Gemini API');
      }

      const generatedGuide = data.candidates[0].content.parts[0].text;
      
      // Generate a title based on preferences
      const title = `Travel Guide for ${preferences.preferred_group_type || 'Traveler'} - Budget $${preferences.budget_range?.min || 0}-${preferences.budget_range?.max || 10000}`;

      return new Response(JSON.stringify({ 
        generatedGuide,
        title,
        model: 'gemini-1.5-flash-latest'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-travel-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});