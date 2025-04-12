"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PropertyFormProps {
  property?: {
    id: string
    status: string
    parcel_id: string
    ppin: string
    lot_size: string
    lot_sf: string
    lot_acres: string
    street_number: string
    street_name: string
    cross_streets: string
    city: string
    state: string
    zip: string
    county: string
    gps_coordinates: string
    google_maps_link: string
  }
  isEditing?: boolean
}

export function PropertyForm({ property, isEditing = false }: PropertyFormProps) {
  const [status, setStatus] = useState(property?.status || "Available")
  const [parcelId, setParcelId] = useState(property?.parcel_id || "")
  const [ppin, setPpin] = useState(property?.ppin || "")
  const [lotSize, setLotSize] = useState(property?.lot_size || "")
  const [lotSf, setLotSf] = useState(property?.lot_sf || "")
  const [lotAcres, setLotAcres] = useState(property?.lot_acres || "")
  const [streetNumber, setStreetNumber] = useState(property?.street_number || "")
  const [streetName, setStreetName] = useState(property?.street_name || "")
  const [crossStreets, setCrossStreets] = useState(property?.cross_streets || "")
  const [city, setCity] = useState(property?.city || "")
  const [state, setState] = useState(property?.state || "")
  const [zip, setZip] = useState(property?.zip || "")
  const [county, setCounty] = useState(property?.county || "")
  const [gpsCoordinates, setGpsCoordinates] = useState(property?.gps_coordinates || "")
  const [googleMapsLink, setGoogleMapsLink] = useState(property?.google_maps_link || "")

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!parcelId) {
      toast({
        title: "Error",
        description: "Parcel ID is required",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      let url = "/api/properties"
      let method = "POST"

      if (isEditing && property) {
        url = `/api/properties/${property.id}`
        method = "PUT"
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          parcel_id: parcelId,
          ppin,
          lot_size: lotSize,
          lot_sf: lotSf,
          lot_acres: lotAcres,
          street_number: streetNumber,
          street_name: streetName,
          cross_streets: crossStreets,
          city,
          state,
          zip,
          county,
          gps_coordinates: gpsCoordinates,
          google_maps_link: googleMapsLink,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Something went wrong")
      }

      toast({
        title: "Success",
        description: isEditing ? "Property updated successfully" : "Property created successfully",
      })

      router.push("/dashboard/properties")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save property",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Property" : "Create New Property"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="lot">Lot Details</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Financing">Financing</SelectItem>
                      <SelectItem value="Loan in Default">Loan in Default</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parcel_id">Parcel ID</Label>
                  <Input id="parcel_id" value={parcelId} onChange={(e) => setParcelId(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ppin">PPIN</Label>
                <Input id="ppin" value={ppin} onChange={(e) => setPpin(e.target.value)} />
              </div>
            </TabsContent>

            <TabsContent value="lot" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="lot_size">Lot Size</Label>
                  <Input id="lot_size" value={lotSize} onChange={(e) => setLotSize(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lot_sf">Lot SF</Label>
                  <Input id="lot_sf" value={lotSf} onChange={(e) => setLotSf(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lot_acres">Lot Acres</Label>
                  <Input id="lot_acres" value={lotAcres} onChange={(e) => setLotAcres(e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="street_number">Street #</Label>
                  <Input id="street_number" value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street_name">Street Name</Label>
                  <Input id="street_name" value={streetName} onChange={(e) => setStreetName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cross_streets">Cross Streets</Label>
                <Input id="cross_streets" value={crossStreets} onChange={(e) => setCrossStreets(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">Zip</Label>
                  <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input id="county" value={county} onChange={(e) => setCounty(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gps_coordinates">GPS Coordinates</Label>
                  <Input
                    id="gps_coordinates"
                    value={gpsCoordinates}
                    onChange={(e) => setGpsCoordinates(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_maps_link">Google Maps</Label>
                  <Input
                    id="google_maps_link"
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Property" : "Create Property"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
