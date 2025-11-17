import { useState } from 'react';
import { History, Eye, Trash2, Calendar, User, DollarSign } from 'lucide-react';
import { useInvoices, InvoiceRecord } from '@/hooks/useInvoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export interface InvoiceHistoryRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  companyName: string;
  gstAmount: number;
  subtotal: number;
}

interface InvoiceHistoryProps {
  onViewInvoice?: (invoice: InvoiceHistoryRecord) => void;
}

export default function InvoiceHistory({ onViewInvoice }: InvoiceHistoryProps) {
  const { invoices, loading, deleteInvoice } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const handleDeleteInvoice = (invoiceId: string) => {
    deleteInvoice(invoiceId);
  };

  const handleViewDetails = (invoice: InvoiceRecord) => {
    setSelectedInvoice(invoice);
    // Convert to legacy format if needed
    const legacyInvoice: InvoiceHistoryRecord = {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email || '',
      date: invoice.created_at,
      total: Number(invoice.total),
      currency: '₹',
      items: invoice.items,
      companyName: invoice.company_name || '',
      gstAmount: Number(invoice.gst_amount),
      subtotal: Number(invoice.subtotal),
    };
    onViewInvoice?.(legacyInvoice);
  };

  const formatCurrency = (amount: number, currency: string = '₹') => {
    return `${currency}${Number(amount).toLocaleString()}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <History className="w-6 h-6" />
          Invoice History
        </h2>
        <Badge variant="secondary" className="text-sm">
          {invoices.length} Invoices
        </Badge>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
          <p className="text-muted-foreground">
            Generate your first invoice to see it here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="glass-card border-white/10 hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                      <Badge variant="outline" className="text-xs">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {invoice.customer_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(Number(invoice.total))}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {invoice.items?.length || 0} items
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(invoice)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="gradient-text">
                            Invoice Details - {selectedInvoice?.invoice_number}
                          </DialogTitle>
                        </DialogHeader>
                        
                        {selectedInvoice && (
                          <div className="space-y-6">
                            {/* Company Details */}
                            <div className="space-y-2">
                              <h3 className="font-semibold text-sm text-muted-foreground">Company</h3>
                              <div className="text-sm space-y-1">
                                <p className="font-medium">{selectedInvoice.company_name}</p>
                                {selectedInvoice.company_email && <p>{selectedInvoice.company_email}</p>}
                                {selectedInvoice.company_phone && <p>{selectedInvoice.company_phone}</p>}
                                {selectedInvoice.company_address && <p>{selectedInvoice.company_address}</p>}
                                {selectedInvoice.company_gst && <p>GST: {selectedInvoice.company_gst}</p>}
                              </div>
                            </div>

                            {/* Customer Details */}
                            <div className="space-y-2">
                              <h3 className="font-semibold text-sm text-muted-foreground">Customer</h3>
                              <div className="text-sm space-y-1">
                                <p className="font-medium">{selectedInvoice.customer_name}</p>
                                {selectedInvoice.customer_email && <p>{selectedInvoice.customer_email}</p>}
                                {selectedInvoice.customer_phone && <p>{selectedInvoice.customer_phone}</p>}
                                {selectedInvoice.customer_address && <p>{selectedInvoice.customer_address}</p>}
                              </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-sm text-muted-foreground">Items</h3>
                              <div className="space-y-2">
                                {selectedInvoice.items?.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Quantity: {item.quantity} × {formatCurrency(item.price)}
                                      </p>
                                    </div>
                                    <p className="font-semibold">
                                      {formatCurrency(item.quantity * item.price)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Totals */}
                            <div className="space-y-2 pt-4 border-t">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(Number(selectedInvoice.subtotal))}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>GST:</span>
                                <span>{formatCurrency(Number(selectedInvoice.gst_amount))}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold pt-2">
                                <span>Total:</span>
                                <span className="gradient-text">{formatCurrency(Number(selectedInvoice.total))}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete invoice {invoice.invoice_number}? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteInvoice(invoice.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
