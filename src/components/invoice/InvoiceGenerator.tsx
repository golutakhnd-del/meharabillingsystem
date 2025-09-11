import { useState } from 'react';
import { Plus, Minus, Download, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/components/products/ProductCard';
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
  const [companyDetails, setCompanyDetails] = useState({
    name: 'BillCraft Pro',
    address: 'Your Business Address',
    phone: '+91 98765 43210',
    email: 'contact@billcraft.com'
  });
  const [invoiceSettings, setInvoiceSettings] = useState({
    taxRate: 18,
    currency: '₹',
    invoicePrefix: 'INV'
  });

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
  const tax = subtotal * (invoiceSettings.taxRate / 100);
  const total = subtotal + tax;

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${invoiceSettings.invoicePrefix}-${timestamp}-${random}`;
  };

  const generatePDF = () => {
    const invoiceNumber = generateInvoiceNumber();
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 20, 20);
    doc.setFontSize(12);
    doc.text(companyDetails.name, 20, 35);
    doc.text(companyDetails.address, 20, 45);
    doc.text(companyDetails.phone, 20, 55);
    doc.text(companyDetails.email, 20, 65);
    
    doc.text(`Invoice #: ${invoiceNumber}`, 150, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);

    // Customer Details
    doc.text('Bill To:', 20, 85);
    doc.text(customerDetails.name, 20, 95);
    doc.text(customerDetails.email, 20, 105);
    doc.text(customerDetails.address, 20, 115);
    doc.text(customerDetails.phone, 20, 125);

    // Items Header
    let yPos = 145;
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
    doc.text(`Tax (${invoiceSettings.taxRate}%): ${invoiceSettings.currency}${tax.toFixed(2)}`, 120, yPos + 10);
    doc.setFontSize(14);
    doc.text(`Total: ${invoiceSettings.currency}${total.toFixed(2)}`, 120, yPos + 25);

    // Reduce stock for each item
    invoiceItems.forEach(item => {
      onUpdateStock(item.product.id, item.quantity);
    });

    doc.save(`${invoiceNumber}.pdf`);
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="gradient-text">Invoice Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Company Details</h3>
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
            <div>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={invoiceSettings.taxRate}
                onChange={(e) => setInvoiceSettings(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
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
          <h3 className="text-lg font-semibold">Customer Details</h3>
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
            <span>Tax ({invoiceSettings.taxRate}%):</span>
            <span>{invoiceSettings.currency}{tax.toFixed(2)}</span>
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