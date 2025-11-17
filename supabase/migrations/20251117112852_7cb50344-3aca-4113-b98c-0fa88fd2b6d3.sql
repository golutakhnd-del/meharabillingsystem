-- Add UPDATE policy for invoices table
CREATE POLICY "Users can update their own invoices"
ON invoices
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);