import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return NextResponse.json({ error: "Only image files (.png, .jpg, .webp, .svg) are allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename
    const ext = file.name.split(".").pop() || "webp";
    const baseName = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const cleanFileName = `${folder}-${baseName}-${Date.now()}.${ext}`;
    const storagePath = `${folder}/${cleanFileName}`;

    let uploadedUrl = "";

    // 1. Try uploading to Supabase Storage Bucket ('media')
    if (isSupabaseConfigured && supabase) {
      try {
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
        } else {
          console.warn("Supabase Storage bucket upload notice:", uploadError?.message);
        }
      } catch (sbErr) {
        console.warn("Supabase upload exception:", sbErr);
      }
    }

    // 2. Also save to local public/uploads for local development and fallback
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
      console.warn("Local disk write note:", fsErr);
    }

    if (!uploadedUrl) {
      return NextResponse.json({ error: "Failed to upload image to storage" }, { status: 500 });
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
