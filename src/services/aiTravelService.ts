import { supabase } from "@/integrations/supabase/client";

export interface TravelPreferences {
  preferred_group_type?: string;
  budget_range?: { min: number; max: number };
  preferred_hotel_category?: string;
  transport_preferences?: string[];
  interests?: string[];
  dietary_restrictions?: string[];
  accessibility_needs?: string[];
}

export interface TravelGuide {
  id?: string;
  user_id?: string;
  preferences_snapshot: TravelPreferences;
  generated_guide: string;
  model_used: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export const aiTravelService = {
  async generatePersonalizedTravelGuide(preferences: TravelPreferences): Promise<{
    generatedGuide: string;
    title: string;
    model: string;
  }> {
    try {
      console.log('Calling ai-travel-chat function with preferences:', preferences);
      
      const { data, error } = await supabase.functions.invoke('ai-travel-chat', {
        body: {
          preferences,
          action: 'generate_guide'
        }
      });

      if (error) {
        console.error('Error calling ai-travel-chat function:', error);
        throw new Error(`Failed to generate travel guide: ${error.message}`);
      }

      if (!data || !data.generatedGuide) {
        throw new Error('Invalid response from AI service');
      }

      return {
        generatedGuide: data.generatedGuide,
        title: data.title,
        model: data.model
      };
    } catch (error) {
      console.error('Error in generatePersonalizedTravelGuide:', error);
      throw error;
    }
  },

  async saveGeneratedGuide(guide: Omit<TravelGuide, 'id' | 'created_at' | 'updated_at'>): Promise<TravelGuide> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_travel_guides')
        .insert({
          user_id: user.user.id,
          preferences_snapshot: guide.preferences_snapshot as any,
          generated_guide: guide.generated_guide,
          model_used: guide.model_used,
          title: guide.title
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving travel guide:', error);
        throw new Error(`Failed to save travel guide: ${error.message}`);
      }

      return data as TravelGuide;
    } catch (error) {
      console.error('Error in saveGeneratedGuide:', error);
      throw error;
    }
  },

  async getUserTravelGuides(): Promise<TravelGuide[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_travel_guides')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching travel guides:', error);
        throw new Error(`Failed to fetch travel guides: ${error.message}`);
      }

      return data as TravelGuide[];
    } catch (error) {
      console.error('Error in getUserTravelGuides:', error);
      throw error;
    }
  },

  async deleteGuide(guideId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_travel_guides')
        .delete()
        .eq('id', guideId);

      if (error) {
        console.error('Error deleting travel guide:', error);
        throw new Error(`Failed to delete travel guide: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteGuide:', error);
      throw error;
    }
  }
};