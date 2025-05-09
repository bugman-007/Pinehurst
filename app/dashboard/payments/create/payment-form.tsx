"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Customer {
  id: string;
  name: string;
}

interface Property {
  id: string;
  parcel_id: string;
  street_number: string;
  street_name: string;
  city: string;
  state: string;
}

export function PaymentForm() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [parcelId, setParcelId] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [amountDue, setAmountDue] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidDate, setPaidDate] = useState("");
  const [method, setMethod] = useState("credit_card");
  const [status, setStatus] = useState("not_paid");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [notes, setNotes] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/users?role=customer");
        if (!response.ok) throw new Error("Failed to fetch customers");

        const data = await response.json();
        setCustomers(data.users);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoadingProperties(true);
        const response = await fetch("/api/properties");
        if (!response.ok) throw new Error("Failed to fetch properties");

        const data = await response.json();
        setProperties(data.properties);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load properties",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [toast]);

  // Calculate balance when amount due or paid changes
  useEffect(() => {
    if (amountDue && amountPaid) {
      const due = Number.parseFloat(amountDue);
      const paid = Number.parseFloat(amountPaid);
      const calculatedBalance = Math.max(0, due - paid);

      setBalance(calculatedBalance.toFixed(2));
    }
  }, [amountDue, amountPaid]);

  // Update property selection when parcel ID changes
  useEffect(() => {
    if (parcelId) {
      const property = properties.find((p) => p.parcel_id === parcelId);
      setSelectedProperty(property || null);
    } else {
      setSelectedProperty(null);
    }
  }, [parcelId, properties]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (!amountDue || !amountPaid) {
      toast({
        title: "Error",
        description: "Please enter starting balance and amount paid",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log(`fffffffffffffffffffffffffffffffffff`, status)
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          parcel_id: parcelId,
          amount_due: Number.parseFloat(amountDue),
          amount_paid: Number.parseFloat(amountPaid),
          balance: Number.parseFloat(balance),
          date,
          paid_date: status === "paid" ? paidDate : null,
          method,
          status,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create payment");
      }

      toast({
        title: "Success",
        description: "Payment created successfully",
      });

      router.push("/dashboard/payments");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyAddress = (property: Property) => {
    const parts = [];
    if (property.street_number) parts.push(property.street_number);
    if (property.street_name) parts.push(property.street_name);

    const streetAddress = parts.join(" ");

    const cityStateZip = [property.city, property.state]
      .filter(Boolean)
      .join(", ");

    return (
      [streetAddress, cityStateZip].filter(Boolean).join(", ") ||
      "No address provided"
    );
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create New Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label html For="customer">
              Customer
            </Label>
            <Select
              value={customerId}
              onValueChange={(id) => {
                setCustomerId(id);
              }}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parcel_id">Property</Label>
            <Select
              value={parcelId}
              onValueChange={setParcelId}
              disabled={isLoadingProperties}
            >
              <SelectTrigger id="parcel_id">
                <SelectValue placeholder="Select property by Parcel ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.parcel_id}>
                    {property.parcel_id} - {getPropertyAddress(property)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProperty && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected property: {getPropertyAddress(selectedProperty)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount_due">Starting Balance</Label>
              <Input
                id="amount_due"
                type="number"
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount_paid">Amount Paid</Label>
              <Input
                id="amount_paid"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="balance">Ending Balance</Label>
              <Input
                id="balance"
                value={balance}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="not_paid">Not Paid</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Due Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_date">
                Paid Date {status !== "paid" && "(Only for paid status)"}
              </Label>
              <Input
                id="paid_date"
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                disabled={status !== "paid"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="zelle">Zelle</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
                <SelectItem value="cash_app">Cash App</SelectItem>
                <SelectItem value="money_order">Money Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes (optional)"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Payment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
