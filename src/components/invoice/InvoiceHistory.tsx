import { useState } from 'react';
import { History, Download, Eye, Trash2, Calendar, User, DollarSign } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
  const [invoiceHistory, setInvoiceHistory] = useLocalStorage<InvoiceHistoryRecord[]>('yugfmsereg-invoice-history', []);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceHistoryRecord | null>(null);

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoiceHistory(prev => prev.filter(invoice => invoice.id !== invoiceId));
  };

  const handleViewDetails = (invoice: InvoiceHistoryRecord) => {
    setSelectedInvoice(invoice);
    onViewInvoice?.(invoice);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <History className="w-6 h-6" />
          Invoice History
        </h2>
        <Badge variant="secondary" className="text-sm">
          {invoiceHistory.length} Invoices
        </Badge>
      </div>

      {invoiceHistory.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
          <p className="text-muted-foreground">
            Generate your first invoice to see it here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoiceHistory.map((invoice) => (
            <Card key={invoice.id} className="glass-card border-white/10 hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                      <Badge variant="outline" className="text-xs">
                        {new Date(invoice.date).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {invoice.customerName}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(invoice.total, invoice.currency)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {invoice.items.length} items
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                          <DialogTitle>Invoice Details - {invoice.invoiceNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold">Customer Details</h4>
                              <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                              <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Invoice Info</h4>
                              <p className="text-sm text-muted-foreground">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                              <p className="text-sm text-muted-foreground">Company: {invoice.companyName}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Items</h4>
                            <div className="space-y-2">
                              {invoice.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                  <span className="text-sm">{item.name}</span>
                                  <span className="text-sm">
                                    {item.quantity} × {formatCurrency(item.price, invoice.currency)} = {formatCurrency(item.quantity * item.price, invoice.currency)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-1 pt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>GST:</span>
                              <span>{formatCurrency(invoice.gstAmount, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Total:</span>
                              <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete invoice {invoice.invoiceNumber}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
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