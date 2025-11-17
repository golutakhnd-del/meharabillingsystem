import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  created_at: string;
  total: number;
  gst_amount: number;
  subtotal: number;
  items: any;
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  company_gst: string | null;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error loading invoices",
        description: "Could not load invoice history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addInvoice = async (invoice: Omit<InvoiceRecord, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name,
          customer_email: invoice.customer_email,
          customer_phone: invoice.customer_phone,
          customer_address: invoice.customer_address,
          total: invoice.total,
          gst_amount: invoice.gst_amount,
          subtotal: invoice.subtotal,
          items: invoice.items,
          company_name: invoice.company_name,
          company_email: invoice.company_email,
          company_phone: invoice.company_phone,
          company_address: invoice.company_address,
          company_gst: invoice.company_gst,
        })
        .select()
        .single();

      if (error) throw error;

      setInvoices(prev => [data, ...prev]);
      toast({
        title: "Invoice saved!",
        description: "Your invoice has been saved to the database.",
      });
      
      return data;
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error saving invoice",
        description: "Could not save invoice. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
      toast({
        title: "Invoice deleted",
        description: "Invoice has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error deleting invoice",
        description: "Could not delete invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { invoices, loading, addInvoice, deleteInvoice, refreshInvoices: fetchInvoices };
}
