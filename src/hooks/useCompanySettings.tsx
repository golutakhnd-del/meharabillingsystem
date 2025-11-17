import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanySettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_gst: string;
  currency: string;
  invoice_prefix: string;
  tax_rate: number;
  gst_rate: number;
}

const defaultSettings: CompanySettings = {
  company_name: 'YUGFMSEREG',
  company_address: 'Your Business Address',
  company_phone: '+91 98765 43210',
  company_email: 'contact@yugfmsereg.com',
  company_gst: 'GST123456789',
  currency: '₹',
  invoice_prefix: 'YUG',
  tax_rate: 18,
  gst_rate: 18,
};

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          company_name: data.company_name || defaultSettings.company_name,
          company_address: data.company_address || defaultSettings.company_address,
          company_phone: data.company_phone || defaultSettings.company_phone,
          company_email: data.company_email || defaultSettings.company_email,
          company_gst: data.company_gst || defaultSettings.company_gst,
          currency: data.currency,
          invoice_prefix: data.invoice_prefix,
          tax_rate: Number(data.tax_rate),
          gst_rate: Number(data.gst_rate),
        });
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      toast({
        title: "Error loading settings",
        description: "Could not load company settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<CompanySettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updatedSettings = { ...settings, ...newSettings };

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          user_id: user.id,
          company_name: updatedSettings.company_name,
          company_address: updatedSettings.company_address,
          company_phone: updatedSettings.company_phone,
          company_email: updatedSettings.company_email,
          company_gst: updatedSettings.company_gst,
          currency: updatedSettings.currency,
          invoice_prefix: updatedSettings.invoice_prefix,
          tax_rate: updatedSettings.tax_rate,
          gst_rate: updatedSettings.gst_rate,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setSettings(updatedSettings);
      toast({
        title: "Settings saved!",
        description: "Your company settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving company settings:', error);
      toast({
        title: "Error saving settings",
        description: "Could not save company settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { settings, loading, saveSettings, setSettings };
}
