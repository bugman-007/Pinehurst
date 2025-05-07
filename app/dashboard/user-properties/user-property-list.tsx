"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, MapPin, Ruler, FileText, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PaymentTable } from "../payments/payment-table";

interface Property {
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
}

interface TaxDocument {
  id: string;
  file_name: string;
  tax_year: string | null;
  uploaded_at: string;
  file_url: string;
}

interface UserPropertyListProps {
  properties: Property[];
}

export function UserPropertyList({ properties }: UserPropertyListProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    properties.length > 0 ? properties[0].id : null
  );

  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) || null;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errorDocs, setErrorDocs] = useState(null);

  useEffect(() => {
    if (!selectedProperty) {
      setPayments([]);
      setDocuments([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/properties/${selectedProperty.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch payments");
        return res.json();
      })
      .then((data) => {
        setPayments(data.payments || []);
        setDocuments(data.taxDocuments || []);
      })
      .catch((err) => {
        setError(err.message);
        setErrorDocs(err.message);
      })
      .finally(() => {
        setLoading(false);
        setLoadingDocs(false);
      });
  }, [selectedProperty]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "financing":
        return <Badge className="bg-blue-500">Financing</Badge>;
      case "loan in default":
        return <Badge className="bg-red-500">Loan in Default</Badge>;
      case "sold":
        return <Badge className="bg-gray-500">Sold</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getAddress = (property: Property) => {
    const parts = [];
    if (property.street_number) parts.push(property.street_number);
    if (property.street_name) parts.push(property.street_name);

    const streetAddress = parts.join(" ");

    const cityStateZip = [property.city, property.state, property.zip]
      .filter(Boolean)
      .join(", ");

    return (
      [streetAddress, cityStateZip].filter(Boolean).join(", ") ||
      "No address provided"
    );
  };

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Properties</CardTitle>
          <CardDescription>
            You don't have any properties assigned to you yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>My Properties</CardTitle>
            <CardDescription>Select a property to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {properties.map((property) => (
                <Button
                  key={property.id}
                  variant={
                    selectedPropertyId === property.id ? "default" : "outline"
                  }
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedPropertyId(property.id)}
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 shrink-0" />
                    <div className="truncate">
                      <div className="font-medium">{property.parcel_id}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {getAddress(property)}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
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
                  <CardDescription>
                    {getAddress(selectedProperty)}
                  </CardDescription>
                </div>
                <div>{getStatusBadge(selectedProperty.status)}</div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Property Details</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Location
                        </h3>
                        <div className="mt-1 text-sm">
                          <p>{getAddress(selectedProperty)}</p>
                          {selectedProperty.county && (
                            <p>County: {selectedProperty.county}</p>
                          )}
                          {selectedProperty.cross_streets && (
                            <p>
                              Cross Streets: {selectedProperty.cross_streets}
                            </p>
                          )}
                        </div>
                      </div>

                      {selectedProperty.google_maps_link && (
                        <div>
                          <a
                            href={selectedProperty.google_maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Ruler className="h-4 w-4" /> Lot Information
                        </h3>
                        <div className="mt-1 text-sm">
                          {selectedProperty.lot_size && (
                            <p>Size: {selectedProperty.lot_size}</p>
                          )}
                          {selectedProperty.lot_sf && (
                            <p>Square Feet: {selectedProperty.lot_sf}</p>
                          )}
                          {selectedProperty.lot_acres && (
                            <p>Acres: {selectedProperty.lot_acres}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Property Identifiers
                        </h3>
                        <div className="mt-1 text-sm">
                          <p>Parcel ID: {selectedProperty.parcel_id}</p>
                          {selectedProperty.ppin && (
                            <p>PPIN: {selectedProperty.ppin}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="payments">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Payment History
                      </h3>
                    </div>
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Loading payments...</p>
                    ) : error ? (
                      <p className="text-sm text-destructive">{error}</p>
                    ) : (
                      <PaymentTable payments={payments} readOnly />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Documents
                      </h3>
                    </div>
                    {loadingDocs ? (
                      <p className="text-sm text-muted-foreground">Loading documents...</p>
                    ) : errorDocs ? (
                      <p className="text-sm text-destructive">{errorDocs}</p>
                    ) : documents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No documents found for this property.</p>
                    ) : (
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
                            {documents.map((doc) => (
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
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
