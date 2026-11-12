"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";
import { DashCard, DashCardHeader } from "@/components/dashboard/DashCard";
import { DASH_FIELD } from "@/components/dashboard/menu";
import {
  LiveCloud,
  LiveKeyRound,
  LivePlugZap,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { PageBody } from "@/features/dashboard/components/PageBody";
import { requestOk } from "@/lib/api/request.client";
import { oidcTokenResponseSchema } from "@/lib/schemas/oidc.schemas";

const PROVIDERS = [
  {
    name: "AWS",
    step: "IAM → Identity providers → Add OpenID Connect provider",
  },
  {
    name: "Google Cloud",
    step: "IAM → Workload Identity Federation → Add provider",
  },
  {
    name: "Azure",
    step: "App registration → Federated credentials → Add credential",
  },
];

/** Short-lived OIDC identity so deployments reach your cloud without secrets. */
export function IntegrationsPage({
  issuer,
  projectId,
  projectName,
}: {
  issuer: string;
  projectId: string;
  projectName: string;
}) {
  const [audience, setAudience] = useState("multivrs");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  function generateToken() {
    if (loading) return;
    setLoading(true);
    void requestOk(
      `/api/projects/${projectId}/oidc/token`,
      {
        body: JSON.stringify({ audience }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Token generation failed",
    )
      .then((response) => response.json())
      .then((body) => oidcTokenResponseSchema.parse(body))
      .then((result) => setToken(result.token))
      .catch(() =>
        toast.error(
          "Couldn't generate a token. The OIDC signing key or public app URL isn't configured.",
        ),
      )
      .finally(() => setLoading(false));
  }

  return (
    <PageBody>
      <DashboardPageHeader
        description="Signed, short-lived project identity your deployments can exchange for cloud credentials."
        eyebrow={`${projectName} · Configure`}
        title="Integrations"
      />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <DashCard aria-label="OpenID Connect">
          <DashCardHeader
            description="No long-lived cloud secrets in your environment"
            icon={LivePlugZap}
            title="OpenID Connect"
          />
          <div className="space-y-4 p-5 pt-4">
            <div className="space-y-1.5 text-xs font-medium">
              <span>Issuer</span>
              <div className="flex items-center gap-1">
                <Input
                  className={`${DASH_FIELD} font-geist-mono`}
                  id="oidc-issuer"
                  readOnly
                  value={issuer}
                />
                <CopyButton className="size-9" text={issuer} />
              </div>
            </div>
            <label
              className="block space-y-1.5 text-xs font-medium"
              htmlFor="oidc-audience"
            >
              <span>Audience</span>
              <Input
                className={`${DASH_FIELD} font-geist-mono`}
                id="oidc-audience"
                onChange={(event) => setAudience(event.target.value)}
                value={audience}
              />
            </label>
            <Button
              data-icon-trigger
              disabled={loading}
              onClick={generateToken}
              size="sm"
              variant="hero"
            >
              <LiveKeyRound strokeWidth={1.75} />
              {loading ? "Generating…" : "Generate a test token"}
            </Button>
            {token ? (
              <div className="surface-inset relative rounded-tile p-3 pr-11 duration-300 animate-in fade-in-0">
                <code className="block max-h-28 overflow-auto break-all font-geist-mono text-[11px] leading-5 text-muted-foreground">
                  {token}
                </code>
                <CopyButton
                  className="absolute right-2 top-2 size-7"
                  text={token}
                />
              </div>
            ) : null}
          </div>
        </DashCard>
        <DashCard aria-label="Connect your cloud">
          <DashCardHeader
            description="Trust this issuer once; deployments do the rest"
            icon={LiveCloud}
            title="Connect your cloud"
          />
          <ul className="space-y-2 p-5 pt-4">
            {PROVIDERS.map((provider) => (
              <li
                className="surface-inset rounded-tile px-3.5 py-3"
                key={provider.name}
              >
                <p className="text-[13px] font-medium">{provider.name}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {provider.step}
                </p>
              </li>
            ))}
            <li className="px-1 pt-1 text-[12px] leading-5 text-muted-foreground">
              Use the issuer on the left and the audience{" "}
              <span className="font-geist-mono text-foreground">
                {audience || "multivrs"}
              </span>
              .
            </li>
          </ul>
        </DashCard>
      </div>
    </PageBody>
  );
}
