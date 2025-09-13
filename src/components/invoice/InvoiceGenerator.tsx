import { useState } from 'react';
import { Plus, Minus, Download, Send, User, Building } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/components/products/ProductCard';
import { InvoiceHistoryRecord } from './InvoiceHistory';
import jsPDF from 'jspdf';

interface InvoiceItem {
  product: Product;
  quantity: number;
}

interface InvoiceGeneratorProps {
  selectedProducts: Product[];
  onClear: () => void;
  onUpdateStock: (productId: string, quantity: number) => void;
}

export default function InvoiceGenerator({ selectedProducts, onClear, onUpdateStock }: InvoiceGeneratorProps) {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(
    selectedProducts.map(product => ({ product, quantity: 1 }))
  );
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  const [companyDetails, setCompanyDetails] = useLocalStorage('company-details', {
    name: 'YUGFMSEREG',
    address: 'Your Business Address',
    phone: '+91 98765 43210',
    email: 'contact@yugfmsereg.com',
    gst: 'GST123456789'
  });
  const [invoiceSettings, setInvoiceSettings] = useLocalStorage('invoice-settings', {
    taxRate: 18,
    currency: '₹',
    invoicePrefix: 'YUG',
    gstRate: 18
  });
  const [savedCustomers, setSavedCustomers] = useLocalStorage('saved-customers', []);
  const [invoiceHistory, setInvoiceHistory] = useLocalStorage<InvoiceHistoryRecord[]>('yugfmsereg-invoice-history', []);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const updateQuantity = (productId: string, change: number) => {
    setInvoiceItems(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setInvoiceItems(items => items.filter(item => item.product.id !== productId));
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const gst = subtotal * (invoiceSettings.gstRate / 100);
  const total = subtotal + gst;

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${invoiceSettings.invoicePrefix}-${timestamp}-${random}`;
  };

  const generatePDF = () => {
    const uniqueInvoiceId = `YFG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const doc = new jsPDF();
    
    // Add gradient background effect
    doc.setFillColor(25, 25, 112);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Add white overlay with opacity
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 10, 190, 277, 'F');
    
    // Add shadow effect border
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 180, 267);

    // Company Header with 3D styling
    doc.setFillColor(25, 25, 112);
    doc.rect(20, 20, 170, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('YUGFMSEREG INVOICE', 25, 35);
    doc.setFontSize(10);
    doc.text('Professional Billing Solution', 25, 45);
    
    // Company Details
    doc.setTextColor(25, 25, 112);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(companyDetails.name, 20, 70);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(companyDetails.address, 20, 80);
    doc.text(`Phone: ${companyDetails.phone}`, 20, 90);
    doc.text(`Email: ${companyDetails.email}`, 20, 100);
    doc.text(`GST: ${companyDetails.gst}`, 20, 110);
    
    // Invoice Details with unique ID
    doc.setFillColor(240, 240, 240);
    doc.rect(130, 65, 60, 50, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(130, 65, 60, 50);
    doc.setTextColor(25, 25, 112);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE ID:', 135, 75);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(uniqueInvoiceId, 135, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 135, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString(), 135, 105);

    // Customer Details with 3D styling
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 125, 170, 50, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 125, 170, 50);
    
    doc.setTextColor(25, 25, 112);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 25, 135);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(customerDetails.name, 25, 145);
    doc.text(customerDetails.email, 25, 155);
    doc.text(customerDetails.address, 25, 165);
    doc.text(customerDetails.phone, 25, 175);

    // Items Header
    let yPos = 155;
    doc.text('Items:', 20, yPos);
    doc.text('Qty', 120, yPos);
    doc.text('Rate', 140, yPos);
    doc.text('Amount', 170, yPos);
    yPos += 10;

    // Items
    invoiceItems.forEach(item => {
      doc.text(item.product.name, 20, yPos);
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text(`${invoiceSettings.currency}${item.product.price.toFixed(2)}`, 140, yPos);
      doc.text(`${invoiceSettings.currency}${(item.product.price * item.quantity).toFixed(2)}`, 170, yPos);
      yPos += 10;
    });

    // Totals
    yPos += 10;
    doc.text(`Subtotal: ${invoiceSettings.currency}${subtotal.toFixed(2)}`, 120, yPos);
    doc.text(`GST (${invoiceSettings.gstRate}%): ${invoiceSettings.currency}${gst.toFixed(2)}`, 120, yPos + 10);
    doc.setFontSize(14);
    doc.text(`Total: ${invoiceSettings.currency}${total.toFixed(2)}`, 120, yPos + 25);

    // Save to invoice history
    const invoiceRecord: InvoiceHistoryRecord = {
      id: uniqueInvoiceId,
      invoiceNumber: uniqueInvoiceId,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      date: new Date().toISOString(),
      total: total,
      currency: invoiceSettings.currency,
      items: invoiceItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      companyName: companyDetails.name,
      gstAmount: gst,
      subtotal: subtotal
    };
    
    setInvoiceHistory(prev => [invoiceRecord, ...prev]);
    
    // Reduce stock for each item
    invoiceItems.forEach(item => {
      onUpdateStock(item.product.id, item.quantity);
    });

    doc.save(`${uniqueInvoiceId}.pdf`);
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="gradient-text">Invoice Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Details
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyDetails.name}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, name: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="companyGst">GST Number</Label>
              <Input
                id="companyGst"
                value={companyDetails.gst}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, gst: e.target.value }))}
                className="bg-surface-glass border-white/10"
                placeholder="GST123456789"
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Company Email</Label>
              <Input
                id="companyEmail"
                value={companyDetails.email}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, email: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">Company Phone</Label>
              <Input
                id="companyPhone"
                value={companyDetails.phone}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="companyAddress">Company Address</Label>
              <Input
                id="companyAddress"
                value={companyDetails.address}
                onChange={(e) => setCompanyDetails(prev => ({ ...prev, address: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Invoice Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Invoice Settings</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="gstRate">GST Rate (%)</Label>
              <Input
                id="gstRate"
                type="number"
                value={invoiceSettings.gstRate}
                onChange={(e) => setInvoiceSettings(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={invoiceSettings.currency}
                onChange={(e) => setInvoiceSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                value={invoiceSettings.invoicePrefix}
                onChange={(e) => setInvoiceSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Customer Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Details
            </h3>
            <div className="flex gap-2">
              {savedCustomers.length > 0 && (
                <select 
                  className="bg-surface-glass border border-white/10 rounded px-3 py-1 text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      const customer = savedCustomers.find(c => c.id === e.target.value);
                      if (customer) setCustomerDetails(customer);
                    }
                  }}
                >
                  <option value="">Select saved customer</option>
                  {savedCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (customerDetails.name) {
                    const newCustomer = { ...customerDetails, id: Date.now().toString() };
                    setSavedCustomers(prev => [...prev.filter(c => c.name !== customerDetails.name), newCustomer]);
                  }
                }}
              >
                Save Customer
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="customerAddress">Address</Label>
              <Input
                id="customerAddress"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                className="bg-surface-glass border-white/10"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Invoice Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Items</h3>
          {invoiceItems.map(item => (
            <div key={item.product.id} className="flex items-center justify-between p-4 bg-surface-glass rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{item.product.name}</h4>
                <p className="text-sm text-muted-foreground">{invoiceSettings.currency}{item.product.price} each</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.product.id, -1)}
                  className="h-8 w-8"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.product.id, 1)}
                  className="h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="w-20 text-right font-medium">
                  {invoiceSettings.currency}{(item.product.price * item.quantity).toFixed(2)}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.product.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{invoiceSettings.currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST ({invoiceSettings.gstRate}%):</span>
            <span>{invoiceSettings.currency}{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span className="text-primary">{invoiceSettings.currency}{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button onClick={generatePDF} className="flex-1 bg-gradient-primary">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={onClear} className="flex-1">
            Clear Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}