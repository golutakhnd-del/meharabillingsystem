-- Add CHECK constraints for input validation

-- customers table constraints
ALTER TABLE public.customers 
  ADD CONSTRAINT valid_email CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  ADD CONSTRAINT valid_phone CHECK (phone IS NULL OR (length(phone) >= 10 AND length(phone) <= 15)),
  ADD CONSTRAINT valid_gst CHECK (gst IS NULL OR length(gst) = 15),
  ADD CONSTRAINT valid_name_length CHECK (length(name) <= 200);

-- products table constraints
ALTER TABLE public.products
  ADD CONSTRAINT valid_price CHECK (price >= 0 AND price <= 999999.99),
  ADD CONSTRAINT valid_stock CHECK (stock >= 0),
  ADD CONSTRAINT valid_name_length CHECK (length(name) > 0 AND length(name) <= 200),
  ADD CONSTRAINT valid_barcode CHECK (barcode IS NULL OR length(barcode) <= 50);

-- invoices table constraints
ALTER TABLE public.invoices
  ADD CONSTRAINT valid_subtotal CHECK (subtotal >= 0),
  ADD CONSTRAINT valid_gst_amount CHECK (gst_amount >= 0),
  ADD CONSTRAINT valid_total CHECK (total >= 0),
  ADD CONSTRAINT valid_customer_email CHECK (customer_email IS NULL OR customer_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- company_settings table constraints
ALTER TABLE public.company_settings
  ADD CONSTRAINT valid_company_email CHECK (company_email IS NULL OR company_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  ADD CONSTRAINT valid_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
  ADD CONSTRAINT valid_gst_rate CHECK (gst_rate >= 0 AND gst_rate <= 100);