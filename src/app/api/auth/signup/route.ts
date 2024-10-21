import { db } from "@/server/db";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, name } = (await req.json()) as {
      email: string;
      password: string;
      name: string;
    };

    // Ensure the data exists
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    // Call the signup logic
    console.log("signup data: ", name, email, password);
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the new user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User created", user },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 },
    );
  }
}
