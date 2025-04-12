import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id

    // Get property details
    const properties = await db.query(
      `
      SELECT * FROM properties WHERE id = ?
    `,
      [propertyId],
    )

    if (!properties || properties.length === 0) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    const property = properties[0]

    // Get assigned users
    const assignedUsers = await db.query(
      `
      SELECT u.id, u.name, u.email, u.role, pu.assigned_at
      FROM property_users pu
      JOIN users u ON pu.user_id = u.id
      WHERE pu.property_id = ?
    `,
      [propertyId],
    )

    // Get property photos
    const photos = await db.query(
      `
      SELECT * FROM property_photos
      WHERE property_id = ?
      ORDER BY uploaded_at DESC
    `,
      [propertyId],
    )

    // Get tax documents
    const taxDocuments = await db.query(
      `
      SELECT * FROM property_tax_documents
      WHERE property_id = ?
      ORDER BY uploaded_at DESC
    `,
      [propertyId],
    )

    // Get related payments
    const payments = await db.query(
      `
      SELECT p.id, p.amount_due, p.amount_paid, p.balance, p.date, p.status, u.name as customer_name
      FROM payments p
      JOIN users u ON p.customer_id = u.id
      WHERE p.parcel_id = ?
      ORDER BY p.date DESC
    `,
      [property.parcel_id],
    )

    return NextResponse.json(
      {
        property,
        assignedUsers,
        photos,
        taxDocuments,
        payments,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Property fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id
    const {
      status,
      parcel_id,
      ppin,
      lot_size,
      lot_sf,
      lot_acres,
      street_number,
      street_name,
      cross_streets,
      city,
      state,
      zip,
      county,
      gps_coordinates,
      google_maps_link,
    } = await req.json()

    // Check if property exists
    const existingProperty = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

    if (!existingProperty || existingProperty.length === 0) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    // Check if another property with this parcel_id exists
    if (parcel_id !== existingProperty[0].parcel_id) {
      const duplicateCheck = await db.query("SELECT * FROM properties WHERE parcel_id = ? AND id != ?", [
        parcel_id,
        propertyId,
      ])

      if (duplicateCheck && duplicateCheck.length > 0) {
        return NextResponse.json({ message: "Another property with this Parcel ID already exists" }, { status: 409 })
      }
    }

    // Update the property
    await db.query(
      `
      UPDATE properties SET
        status = ?,
        parcel_id = ?,
        ppin = ?,
        lot_size = ?,
        lot_sf = ?,
        lot_acres = ?,
        street_number = ?,
        street_name = ?,
        cross_streets = ?,
        city = ?,
        state = ?,
        zip = ?,
        county = ?,
        gps_coordinates = ?,
        google_maps_link = ?
      WHERE id = ?
    `,
      [
        status,
        parcel_id,
        ppin || null,
        lot_size || null,
        lot_sf || null,
        lot_acres || null,
        street_number || null,
        street_name || null,
        cross_streets || null,
        city || null,
        state || null,
        zip || null,
        county || null,
        gps_coordinates || null,
        google_maps_link || null,
        propertyId,
      ],
    )

    return NextResponse.json({ message: "Property updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Property update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id

    // Check if property exists
    const existingProperty = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

    if (!existingProperty || existingProperty.length === 0) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    // Delete the property (cascade will delete related records)
    await db.query("DELETE FROM properties WHERE id = ?", [propertyId])

    return NextResponse.json({ message: "Property deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Property deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
