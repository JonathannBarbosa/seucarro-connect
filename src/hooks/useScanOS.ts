"use client";

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { MaintenancePart, ServiceType } from "@/types/database";

export interface ScanOSResult {
  service_type: ServiceType;
  description: string | null;
  cost: number | null;
  mileage: number | null;
  service_date: string | null;
  workshop: string | null;
  parts: MaintenancePart[];
  confidence: number;
  os_image_url: string;
  storage_path: string;
}

function getExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (file.type.includes("jpeg") || file.type.includes("jpg")) return "jpg";
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  return "jpg";
}

export function useScanOS() {
  const { user } = useAuth();

  return useMutation<ScanOSResult, Error, File>({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Usuário não autenticado");

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("A imagem não pode ultrapassar 5MB");
      }

      const ext = getExtension(file);
      const uuid = crypto.randomUUID();
      const storagePath = `${user.id}/${uuid}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("os-uploads")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || `image/${ext}`,
        });

      if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);

      const { data: fn, error: fnError } = await supabase.functions.invoke("scan-os", {
        body: { storagePath },
      });

      if (fnError) {
        throw new Error(fnError.message || "Não conseguimos ler a nota. Tente registrar manualmente.");
      }

      if (fn && typeof fn === "object" && "error" in fn) {
        throw new Error(String(fn.error));
      }

      const parsed = fn as Omit<ScanOSResult, "os_image_url" | "storage_path">;

      const { data: signed } = await supabase.storage
        .from("os-uploads")
        .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

      return {
        ...parsed,
        os_image_url: signed?.signedUrl ?? "",
        storage_path: storagePath,
      };
    },
  });
}
