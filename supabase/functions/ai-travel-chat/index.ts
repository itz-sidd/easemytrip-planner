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
  user_message?: string; // Add this for conversational messages
}

function createTravelGuidePrompt(preferences: TravelPreferences): string {
  // EaseMyTrip Knowledge Base
  const easeMyTripContext = `
You are an EaseMyTrip AI Assistant with comprehensive knowledge about EaseMyTrip services and the Indian travel market.

EASEMYTRIP SERVICES & FEATURES:
🛫 Flight Bookings:
- Domestic & International flights at lowest prices
- No convenience fees on domestic flights
- 25+ airline partners including IndiGo, SpiceJet, Air India, Vistara
- Easy cancellation and rescheduling options
- PNR status tracking

🏨 Hotel Bookings:
- 100,000+ hotels across India and worldwide
- Best price guarantee with exclusive deals
- Pay at hotel options available
- Free cancellation on select bookings
- Customer reviews and ratings

🚂 Railway Tickets:
- IRCTC authorized partner
- Book train tickets across India
- Real-time seat availability
- Quick PNR status check
- Waiting list predictions

🚌 Bus Bookings:
- 3000+ bus routes across India
- Top operators like RedBus, Travels Corporation
- Live bus tracking
- Flexible cancellation policies
- Premium and budget options

🌴 Holiday Packages:
- Domestic and international tour packages
- Customizable itineraries
- Group and family packages
- Honeymoon and adventure tours
- All-inclusive deals with flights, hotels, and activities

🚗 Cab Services:
- Airport transfers
- Outstation cabs
- Local city rides
- Professional drivers
- Flexible cancellation

🎯 Activities & Experiences:
- Theme parks and adventure activities
- Cultural experiences and tours
- Water sports and outdoor activities
- City tours and sightseeing

💼 Corporate Travel (EMT Desk):
- Dedicated travel manager for each corporate client
- Admin panel for expense tracking
- Travel policy management
- Employee benefits and exclusive discounts
- 24/7 support
- CO2 emission tracking
- Budget analysis and reporting

📱 Mobile App Features:
- Easy booking on mobile
- Instant confirmations
- Digital boarding passes
- Trip management
- Exclusive app-only deals

💳 Payment Options:
- Multiple payment gateways
- EMI options available
- Wallet payments
- Net banking and UPI
- International cards accepted

🎁 EaseMyTrip Benefits:
- Zero convenience fees on domestic flights
- 24/7 customer support
- Best price guarantee
- Instant refunds
- Trip insurance options
- Loyalty rewards program

CUSTOMER SUPPORT:
- 24/7 multilingual support
- Live chat assistance
- Phone support: 1-302-291-8066
- Email: support@easemytrip.us
- WhatsApp support available

POPULAR DESTINATIONS:
Domestic: Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, Jaipur, Goa
International: Dubai, Singapore, Thailand, Malaysia, UK, USA, Canada, Australia, Europe
`;

  // If there's a user message, create a conversational response
  if (preferences.user_message) {
    const userMessage = preferences.user_message.toLowerCase();
    
    // Handle greetings
    if (userMessage.includes('hey') || userMessage.includes('hello') || userMessage.includes('hi')) {
      return `${easeMyTripContext}

You are a friendly EaseMyTrip AI assistant. The user just greeted you with: "${preferences.user_message}"

Please respond in a warm, welcoming way and introduce yourself as their EaseMyTrip AI assistant. Mention the key services you can help with:
- Flight bookings (domestic & international) with zero convenience fees
- Hotel bookings with best price guarantee
- Train ticket bookings (IRCTC authorized)
- Bus bookings across India
- Holiday packages and tour planning
- Corporate travel solutions (EMT Desk)
- Cab services and activities

Keep your response conversational, friendly, and under 200 words. End by asking what they'd like help with today.`;
    }
    
    // Handle specific EaseMyTrip queries
    return `${easeMyTripContext}

You are an expert EaseMyTrip AI assistant. A user has asked: "${preferences.user_message}"

Please provide a helpful, informative response about EaseMyTrip services and travel. Use the extensive knowledge base above to give accurate information about:
- Booking processes and features
- Pricing and deals
- Service benefits and policies
- Available destinations and routes
- Corporate travel solutions
- Customer support options

Be conversational, helpful, and always relate back to how EaseMyTrip can solve their travel needs. If they're asking about specific bookings, guide them through the process and highlight EaseMyTrip's unique advantages.

Keep your response engaging and under 400 words.`;
  }

  // Enhanced travel guide prompt with EaseMyTrip focus
  return `${easeMyTripContext}

You are an expert EaseMyTrip travel advisor. Generate a comprehensive, personalized travel guide based on the user's preferences, always highlighting how EaseMyTrip services can help them achieve their travel goals.

User Preferences:
- Group Type: ${preferences.preferred_group_type || 'Not specified'}
- Budget Range: ₹${preferences.budget_range?.min || 0} - ₹${preferences.budget_range?.max || 100000}
- Hotel Category: ${preferences.preferred_hotel_category || 'Not specified'}
- Transport Preferences: ${preferences.transport_preferences?.join(', ') || 'Not specified'}
- Interests: ${preferences.interests?.join(', ') || 'Not specified'}
- Dietary Restrictions: ${preferences.dietary_restrictions?.join(', ') || 'None'}
- Accessibility Needs: ${preferences.accessibility_needs?.join(', ') || 'None'}

Create a comprehensive travel guide covering these sections:

## 🛫 Flight Booking with EaseMyTrip
- Zero convenience fees on domestic flights
- Best deals and exclusive offers
- Easy booking process and instant confirmations
- Flexible cancellation and rescheduling options

## 🏨 Hotel Recommendations via EaseMyTrip
- 100,000+ hotels with best price guarantee
- Category-specific recommendations based on their preference
- Pay at hotel options and free cancellation
- Customer reviews and ratings for informed decisions

## 🚂 Train Travel Solutions
- IRCTC authorized bookings through EaseMyTrip
- Real-time availability and PNR tracking
- Multiple class options and seat preferences
- Waiting list predictions and alternatives

## 💰 Budget Management & Deals
- EaseMyTrip's cost-saving features and zero fees
- Exclusive app deals and seasonal offers
- EMI options and flexible payment methods
- Group booking discounts for families/friends

## 📅 Perfect Timing & Seasonal Travel
- Best booking times for maximum savings
- Seasonal destination recommendations
- Festival and holiday travel planning
- Weather considerations and peak season advice

## 🍽️ Food & Local Experiences
- Restaurant recommendations and local cuisine
- Food tours and cultural experiences via EaseMyTrip Activities
- Dietary restriction accommodations
- Street food safety and local favorites

## 🗺️ Destination Exploration
- Popular EaseMyTrip destinations and hidden gems
- Activities and experiences bookable through EaseMyTrip
- Local transportation options and cab services
- Cultural attractions and adventure activities

## 👥 Group Travel Solutions
- EaseMyTrip's group booking benefits
- Corporate travel with EMT Desk (if applicable)
- Family package deals and customizations
- Group coordination and itinerary management

${preferences.accessibility_needs?.length ? '## ♿ Accessibility Support\n- EaseMyTrip\'s accessibility-friendly options\n- Recommended accessible accommodations and transport\n- Special assistance booking procedures' : ''}

## 📱 Using EaseMyTrip App & Services
- Mobile app features for seamless travel
- 24/7 customer support options
- Trip management and digital confirmations
- Loyalty rewards and repeat customer benefits

Always emphasize EaseMyTrip's unique value propositions and how their services make travel easier, cheaper, and more convenient. Include specific booking tips and highlight the zero convenience fee advantage.`;
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