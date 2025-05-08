"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, MapPin, Ruler, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentTable } from "../payments/payment-table";
import { Skeleton } from "@/components/ui/skeleton";

type Property = {
  id: string;
  status: string;
  parcel_id: string;
  ppin: string;
  lot_size: string;
  lot_sf: string;
  lot_acres: string;
  street_number: string;
  street_name: string;
  cross_streets: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  gps_coordinates: string;
  google_maps_link: string;
  assigned_at: string;
};

type TaxDocument = {
  id: string;
  file_name: string;
  tax_year: string | null;
  uploaded_at: string;
  file_url: string;
};

type Payment = {
  id: string;
  customer_id: string;
  customer_name: string;
  parcel_id: string;
  amount_due: number;
  amount_paid: number;
  balance: number;
  date: string;
  paid_date: string | null;
  method: string;
  status: string;
  notes?: string;
};

type APIResponse = {
  payments: Payment[];
  taxDocuments: TaxDocument[];
};

type UserPropertyListProps = {
  properties: Property[];
};

const statusBadgeMap: Record<string, string> = {
  available: "bg-green-500",
  financing: "bg-blue-500",
  "loan in default": "bg-red-500",
  sold: "bg-gray-500"
};

export function UserPropertyList({ properties }: UserPropertyListProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(properties[0]?.id || null);
  const [data, setData] = useState<{ payments: Payment[]; documents: TaxDocument[] }>({ payments: [], documents: [] });
  const [loading, setLoading] = useState({ payments: false, documents: false });
  const [error, setError] = useState<string | null>(null);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) || null;

  useEffect(() => {
    if (!selectedProperty) {
      setData({ payments: [], documents: [] });
      return;
    }

    const fetchData = async () => {
      setLoading({ payments: true, documents: true });
      setError(null);

      try {
        const res = await fetch(`/api/properties/${selectedProperty.id}`);
        if (!res.ok) throw new Error("Failed to fetch property data");
        
        const { payments = [], taxDocuments = [] }: APIResponse = await res.json();
        console.log(payments)
        setData({
          payments: payments.map(p => ({
            ...p,
            paid_date: p.paid_date || null,
            method: p.method ? p.method.replace("_", " ") : "Unknown",
            customer_name: p.customer_name || 'N/A'
          })),
          documents: taxDocuments
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading({ payments: false, documents: false });
      }
    };

    fetchData();
  }, [selectedProperty]);

  const getStatusBadge = (status: string) => (
    <Badge className={statusBadgeMap[status.toLowerCase()] || ""}>
      {status}
    </Badge>
  );

  const getAddress = ({ street_number, street_name, city, state, zip }: Property) => {
    const street = [street_number, street_name].filter(Boolean).join(" ");
    const cityState = [city, state, zip].filter(Boolean).join(", ");
    return [street, cityState].filter(Boolean).join(", ") || "No address provided";
  };

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Properties</CardTitle>
          <CardDescription>You don't have any properties assigned to you yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const renderPropertyDetails = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Location
          </h3>
          <div className="mt-1 text-sm">
            <p>{getAddress(selectedProperty!)}</p>
            {selectedProperty?.county && <p>County: {selectedProperty.county}</p>}
            {selectedProperty?.cross_streets && <p>Cross Streets: {selectedProperty.cross_streets}</p>}
          </div>
        </div>
        {selectedProperty?.google_maps_link && (
          <a href={selectedProperty.google_maps_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
            View on Google Maps
          </a>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Ruler className="h-4 w-4" /> Lot Information
          </h3>
          <div className="mt-1 text-sm">
            {selectedProperty?.lot_size && <p>Size: {selectedProperty.lot_size}</p>}
            {selectedProperty?.lot_sf && <p>Square Feet: {selectedProperty.lot_sf}</p>}
            {selectedProperty?.lot_acres && <p>Acres: {selectedProperty.lot_acres}</p>}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" /> Property Identifiers
          </h3>
          <div className="mt-1 text-sm">
            <p>Parcel ID: {selectedProperty?.parcel_id}</p>
            {selectedProperty?.ppin && <p>PPIN: {selectedProperty.ppin}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">File Name</th>
            <th className="text-left p-2">Tax Year</th>
            <th className="text-left p-2">Uploaded</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.documents.map((doc) => (
            <tr key={doc.id}>
              <td className="p-2">{doc.file_name}</td>
              <td className="p-2">{doc.tax_year || "N/A"}</td>
              <td className="p-2">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
              <td className="p-2">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Download
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>My Properties</CardTitle>
            <CardDescription>Select a property to view details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {properties.map((property) => (
              <Button
                key={property.id}
                variant={selectedPropertyId === property.id ? "default" : "outline"}
                className="w-full justify-start text-left"
                onClick={() => setSelectedPropertyId(property.id)}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building className="h-4 w-4 shrink-0" />
                  <div>
                    <div className="font-medium">{property.parcel_id}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {getAddress(property)}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        {selectedProperty && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProperty.parcel_id}</CardTitle>
                  <CardDescription>{getAddress(selectedProperty)}</CardDescription>
                </div>
                {getStatusBadge(selectedProperty.status)}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Property Details</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="documents">Tax Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  {renderPropertyDetails()}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Payment History</h3>
                  </div>
                  {loading.payments ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : (
                    <PaymentTable payments={data.payments} readOnly />
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <h3 className="text-sm font-medium">Tax Documents</h3>
                  </div>
                  {loading.documents ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : data.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents found for this property.</p>
                  ) : (
                    renderDocumentsTable()
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}