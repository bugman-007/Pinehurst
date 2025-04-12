import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { createPropertiesSchema } from "../db-schema-properties"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Ensure the schema exists
    await createPropertiesSchema()

    const url = new URL(req.url)
    const parcelId = url.searchParams.get("parcelId")
    const status = url.searchParams.get("status")
    const userId = url.searchParams.get("userId")

    let query = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM property_users pu WHERE pu.property_id = p.id) as assigned_users_count
      FROM properties p
    `

    const whereConditions = []
    const params = []

    if (parcelId) {
      whereConditions.push("p.parcel_id = ?")
      params.push(parcelId)
    }

    if (status) {
      whereConditions.push("p.status = ?")
      params.push(status)
    }

    if (userId) {
      query = `
        SELECT p.*, 
          (SELECT COUNT(*) FROM property_users pu WHERE pu.property_id = p.id) as assigned_users_count
        FROM properties p
        JOIN property_users pu ON p.id = pu.property_id
        WHERE pu.user_id = ?
      `
      params.push(userId)
    } else if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ")
    }

    query += " ORDER BY p.created_at DESC"

    const properties = await db.query(query, params)

    return NextResponse.json({ properties }, { status: 200 })
  } catch (error) {
    console.error("Properties fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Ensure the schema exists
    await createPropertiesSchema()

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
      user_id,
    } = await req.json()

    // Validate required fields
    if (!parcel_id || !status) {
      return NextResponse.json({ message: "Parcel ID and status are required" }, { status: 400 })
    }

    // Check if property with this parcel_id already exists
    const existingProperty = await db.query("SELECT * FROM properties WHERE parcel_id = ?", [parcel_id])

    if (existingProperty && existingProperty.length > 0) {
      return NextResponse.json({ message: "Property with this Parcel ID already exists" }, { status: 409 })
    }

    // Insert the property
    const result = await db.query(
      `
      INSERT INTO properties (
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
        google_maps_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ],
    )

    // If a user_id was provided, assign the property to that user
    if (user_id && result.insertId) {
      await db.query(
        `
        INSERT INTO property_users (property_id, user_id)
        VALUES (?, ?)
      `,
        [result.insertId, user_id],
      )
    }

    return NextResponse.json(
      {
        message: "Property created successfully",
        propertyId: result.insertId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Property creation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
