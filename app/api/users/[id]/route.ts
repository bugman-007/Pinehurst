import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;
    const { name, email, password, role, address, city, state, zip } =
      await req.json();

    // Validate input
    if (!name || !email || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existingUser] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    const [emailCheck] = await db.query(
      "SELECT * FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );

    if (emailCheck) {
      return NextResponse.json(
        { message: "Email already in use by another user" },
        { status: 409 }
      );
    }

    // Update user
    if (password) {
      const hashedPassword = await hash(password, 10);
      await db.query(
        "UPDATE users SET name = ?, email = ?, password = ?, role = ?, address = ?, city = ?, state = ?, zip = ? WHERE id = ?",
        [name, email, hashedPassword, role, address, city, state, zip, userId]
      );
    } else {
      await db.query(
        "UPDATE users SET name = ?, email = ?, role = ?, address = ?, city = ?, state = ?, zip = ? WHERE id = ?",
        [name, email, role, address, city, state, zip, userId]
      );
    }

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = params.id;

    // Check if user exists
    const userToDelete = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (!userToDelete || userToDelete.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Delete the user
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is requesting their own profile or is an admin
    if (session.user.id !== params.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user from database
    const userResult = await db.query("SELECT * FROM users WHERE id = ?", [
      params.id,
    ]);

    if (!userResult || !userResult[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = {
      id: userResult[0].id.toString(),
      name: userResult[0].name,
      email: userResult[0].email,
      role: userResult[0].role,
      address: userResult[0].address,
      city: userResult[0].city,
      state: userResult[0].state,
      zip: userResult[0].zip,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
