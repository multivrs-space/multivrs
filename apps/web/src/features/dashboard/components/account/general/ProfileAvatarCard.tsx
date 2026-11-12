"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { LiveFileUp, LiveImage } from "@/components/icons/animated";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import { squareImage } from "@/features/dashboard/lib/square-image";
import { readableError, requestOk } from "@/lib/api/request.client";
import {
  type AccountProfile,
  accountProfileResponseSchema,
} from "@/lib/schemas/account.schemas";

/** Your picture across Multivrs: click to upload a new one, or remove it. */
export function ProfileAvatarCard({
  profile,
  onChange,
}: {
  profile: AccountProfile;
  onChange: (profile: AccountProfile) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function send(request: Promise<Response>, success: string) {
    setBusy(true);
    void request
      .then((response) => response.json())
      .then((body) => accountProfileResponseSchema.parse(body))
      .then((updated) => {
        onChange(updated);
        toast.success(success);
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Avatar update failed")),
      )
      .finally(() => setBusy(false));
  }

  function upload(file: File) {
    send(
      squareImage(file).then((image) => {
        const body = new FormData();
        body.set("file", image);
        return requestOk(
          "/api/account/avatar",
          { body, method: "POST" },
          "Avatar upload failed",
        );
      }),
      "Avatar updated",
    );
  }

  const initial = (profile.name[0] ?? profile.username[0] ?? "M").toUpperCase();
  return (
    <SettingsCard id="avatar">
      <SettingsCardBody
        aside={
          <div className="flex flex-col items-center gap-1.5">
            <input
              accept="image/png,image/jpeg,image/webp"
              aria-hidden="true"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) upload(file);
              }}
              ref={input}
              tabIndex={-1}
              type="file"
            />
            <button
              aria-label="Upload an avatar"
              className="group surface-raised relative grid size-20 place-items-center overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              data-icon-trigger
              disabled={busy}
              onClick={() => input.current?.click()}
              type="button"
            >
              {profile.image ? (
                <Image
                  alt=""
                  className="size-full object-cover"
                  height={80}
                  src={profile.image}
                  unoptimized
                  width={80}
                />
              ) : (
                <span className="text-[26px] font-semibold text-foreground">
                  {initial}
                </span>
              )}
              <span className="absolute inset-0 grid place-items-center bg-ink/70 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex flex-col items-center gap-0.5 text-[10.5px] font-medium text-foreground">
                  <LiveFileUp className="size-4" strokeWidth={1.75} />
                  {busy ? "Uploading…" : "Upload"}
                </span>
              </span>
            </button>
            {profile.image ? (
              <button
                className="text-[11.5px] text-muted-foreground hover:text-foreground"
                disabled={busy}
                onClick={() =>
                  send(
                    requestOk(
                      "/api/account/avatar",
                      { method: "DELETE" },
                      "Avatar could not be removed",
                    ),
                    "Avatar removed",
                  )
                }
                type="button"
              >
                Remove
              </button>
            ) : null}
          </div>
        }
        description="Your picture across Multivrs. Square images work best."
        icon={LiveImage}
        title="Avatar"
      />
      <SettingsCardFooter helperText="Optional, but it helps your team recognise you." />
    </SettingsCard>
  );
}
