import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Parse the incoming form data
  const formData = await req.formData();

  // Get the file from the form data
  const file = formData.get("file") as File;

  // Check if a file is received
  if (!file) {
    // If no file is received, return a JSON response with an error and a 400 status code
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Ensure the upload directory exists
  await mkdir(uploadDir, { recursive: true });

  // Convert the file data to a Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Replace spaces in the file name with underscores
  const filename = file.name.replaceAll(" ", "_");
  console.log(filename);

  try {
    // Write the file to the specified directory (public/uploads) with the modified filename
    await writeFile(path.join(uploadDir, filename), buffer);

    // Return the public path to the uploaded image
    return NextResponse.json(
      { filePath: `/uploads/${filename}` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ message: "Error saving file" }, { status: 500 });
  }
}
