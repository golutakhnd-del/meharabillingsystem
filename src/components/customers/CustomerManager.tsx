import { useState } from 'react';
import { Plus, User, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { useSecureLocalStorage } from '@/hooks/useSecureLocalStorage';
import { useSecureValidation, validators, sanitizers } from '@/lib/security';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SecureForm } from '@/components/common/SecureForm';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst?: string;
  isPrime?: boolean;
}

export default function CustomerManager() {
  const [customers, setCustomers] = useSecureLocalStorage<Customer[]>('saved-customers', [], true);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { validateAndSanitize } = useSecureValidation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gst: '',
    isPrime: false
  });

  const handleSubmit = (data: any) => {
    // Validate and sanitize all inputs
    const nameValidation = validateAndSanitize('name', data.name, validators.name, sanitizers.text);
    const emailValidation = validateAndSanitize('email', data.email, validators.email, sanitizers.text, 'Please enter a valid email address');
    const phoneValidation = validateAndSanitize('phone', data.phone, validators.indianPhone, sanitizers.phone, 'Please enter a valid Indian phone number (+91XXXXXXXXXX or 10 digits)');
    const gstValidation = data.gst ? validateAndSanitize('GST', data.gst, validators.gstNumber, sanitizers.gst, 'Please enter a valid 15-character GST number') : { isValid: true, value: '' };

    if (!nameValidation.isValid || !emailValidation.isValid || !phoneValidation.isValid || !gstValidation.isValid) {
      return;
    }

    const sanitizedData = {
      name: nameValidation.value,
      email: emailValidation.value,
      phone: phoneValidation.value,
      address: sanitizers.text(data.address || ''),
      gst: gstValidation.value,
      isPrime: Boolean(data.isPrime)
    };

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => 
        c.id === editingCustomer.id 
          ? { ...sanitizedData, id: editingCustomer.id }
          : c
      ));
    } else {
      const newCustomer: Customer = {
        ...sanitizedData,
        id: Date.now().toString()
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gst: '',
      isPrime: false
    });
    setIsAddingCustomer(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      gst: customer.gst || '',
      isPrime: customer.isPrime || false
    });
    setEditingCustomer(customer);
    setIsAddingCustomer(true);
  };

  const handleDelete = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Customer Management</h2>
        <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="gradient-text">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <SecureForm onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  name="name"
                  id="name"
                  defaultValue={formData.name}
                  className="bg-surface-glass border-white/10"
                  placeholder="Enter full name"
                  maxLength={100}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    defaultValue={formData.email}
                    className="bg-surface-glass border-white/10"
                    placeholder="example@domain.com"
                    maxLength={254}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    name="phone"
                    id="phone"
                    defaultValue={formData.phone}
                    className="bg-surface-glass border-white/10"
                    placeholder="+91 98765 43210"
                    maxLength={15}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  name="address"
                  id="address"
                  defaultValue={formData.address}
                  className="bg-surface-glass border-white/10"
                  placeholder="Enter complete address"
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gst">GST Number (Optional)</Label>
                  <Input
                    name="gst"
                    id="gst"
                    defaultValue={formData.gst}
                    className="bg-surface-glass border-white/10"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    name="isPrime"
                    id="isPrime"
                    defaultChecked={formData.isPrime}
                    className="rounded"
                  />
                  <Label htmlFor="isPrime">Prime Customer</Label>
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary">
                  {editingCustomer ? 'Update' : 'Save'} Customer
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </SecureForm>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <Card key={customer.id} className="glass-card border-white/10 hover:shadow-elegant transition-all duration-300 transform hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {customer.name}
                </CardTitle>
                {customer.isPrime && (
                  <Badge className="bg-gradient-primary text-white">
                    Prime
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {customer.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {customer.phone}
              </div>
              {customer.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {customer.address}
                </div>
              )}
              {customer.gst && (
                <div className="text-sm">
                  <span className="font-medium">GST:</span> {customer.gst}
                </div>
              )}
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(customer)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(customer.id)}
                  className="flex-1 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No customers found</h3>
          <p className="text-muted-foreground">
            Add your first customer to get started
          </p>
        </div>
      )}
    </div>
  );
}