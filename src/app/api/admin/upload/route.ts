import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { requireAuth } from "@/lib/auth/serverAuth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Server Authentication
    const { errorResponse } = await requireAuth(req);
    if (errorResponse) {
      return errorResponse;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Validate file size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit of 10MB." },
        { status: 400 }
      );
    }

    // 3. Validate mime type and extension
    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return NextResponse.json({ error: "Only image files (.png, .jpg, .webp, .svg) are allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. SVG XSS Prevention: Disallow embedded scripts and execution handlers in SVG images
    if (file.name.toLowerCase().endsWith(".svg") || file.type.includes("svg")) {
      const svgText = buffer.toString("utf-8").toLowerCase();
      if (
        svgText.includes("<script") ||
        svgText.includes("javascript:") ||
        svgText.includes("onerror=") ||
        svgText.includes("onload=")
      ) {
        return NextResponse.json(
          { error: "Malicious SVG rejected: Embedded scripts and event handlers are strictly forbidden." },
          { status: 400 }
        );
      }
    }

    // Clean filename
    const ext = file.name.split(".").pop() || "webp";
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const cleanFileName = `${folder}-${baseName}-${Date.now()}.${ext}`;
    const storagePath = `${folder}/${cleanFileName}`;

    let uploadedUrl = "";
    let uploadErrorMessage = "";

    // 1. Try uploading to Supabase Storage Bucket ('media')
    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "https://your-project.supabase.co") {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(storagePath, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicData } = supabase.storage.from("media").getPublicUrl(storagePath);
          if (publicData?.publicUrl) {
            uploadedUrl = publicData.publicUrl;
          }
        } else if (uploadError) {
          uploadErrorMessage = uploadError.message;
          console.warn("Supabase Storage bucket upload notice:", uploadError.message);
        }
      } catch (sbErr: any) {
        uploadErrorMessage = sbErr?.message || "Storage upload exception";
        console.warn("Supabase upload exception:", sbErr);
      }
    }

    // 2. Also save to local public/uploads for local development and offline fallback
    try {
      const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      const localFilePath = path.join(publicUploadsDir, cleanFileName);
      fs.writeFileSync(localFilePath, buffer);

      if (!uploadedUrl) {
        uploadedUrl = `/uploads/${cleanFileName}`;
      }
    } catch (fsErr) {
      // Expected to fail silently on Vercel's read-only serverless filesystem
      console.warn("Local disk write note (expected on serverless read-only disk):", fsErr);
    }

    if (!uploadedUrl) {
      const hint = !supabaseUrl || !supabaseAnonKey
        ? "Database/Storage is not configured on Vercel. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Environment Variables."
        : uploadErrorMessage
          ? `Supabase Storage error: ${uploadErrorMessage}. Make sure a public bucket named 'media' exists in Supabase Dashboard -> Storage.`
          : "Failed to upload image to storage.";

      return NextResponse.json({ error: hint }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      fileName: cleanFileName,
      size: file.size,
    });
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
