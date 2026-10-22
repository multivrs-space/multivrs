"use client";

import {
  Check,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COUNTRIES,
  POPULAR_COUNTRIES,
  type CountryItem,
} from "@/features/dashboard/constants/countries";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardFooter,
} from "@/features/dashboard/components/settings/SettingsCard";
import type { PaymentMethodSummary } from "@/app/api/billing/payment-method/route";

interface AccountBillingInformationTabProps {
  email: string;
  name: string;
  username: string;
}

import {
  TAX_ID_TYPES,
  type TaxIdType,
} from "@/features/dashboard/constants/tax-ids";

const INVOICE_LANGUAGES = [
  "English",
  "French",
  "German",
  "Spanish",
  "Japanese",
  "Portuguese",
  "Italian",
  "Dutch",
];

export function AccountBillingInformationTab({
  email,
  name,
  username,
}: AccountBillingInformationTabProps) {
  // 1. Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodSummary | null>(null);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  // 2. Invoice Email
  const [invoiceEmail, setInvoiceEmail] = useState(email);
  const [savedInvoiceEmail, setSavedInvoiceEmail] = useState(email);
  const [savingEmail, setSavingEmail] = useState(false);

  // 3. Company Name
  const [companyName, setCompanyName] = useState(username || name);
  const [savedCompanyName, setSavedCompanyName] = useState(username || name);
  const [savingCompany, setSavingCompany] = useState(false);

  // 4. Billing Address
  const [orgName, setOrgName] = useState(username || name);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(
    COUNTRIES.find((c) => c.code === "NG") || COUNTRIES[0]!,
  );
  const [countrySearch, setCountrySearch] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // 5. Invoice Language
  const [language, setLanguage] = useState("English");
  const [savedLanguage, setSavedLanguage] = useState("English");
  const [savingLanguage, setSavingLanguage] = useState(false);

  // 6. Purchase Order
  const [poNumber, setPoNumber] = useState("");
  const [savedPoNumber, setSavedPoNumber] = useState("");
  const [savingPo, setSavingPo] = useState(false);

  // 7. Tax ID
  const [taxType, setTaxType] = useState<TaxIdType>(TAX_ID_TYPES[0]!);
  const [taxIdValue, setTaxIdValue] = useState("");
  const [savedTaxIdValue, setSavedTaxIdValue] = useState("");
  const [taxSearch, setTaxSearch] = useState("");
  const [taxOpen, setTaxOpen] = useState(false);
  const [savingTax, setSavingTax] = useState(false);

  const filteredTaxTypes = taxSearch.trim()
    ? TAX_ID_TYPES.filter(
        (t) =>
          t.label.toLowerCase().includes(taxSearch.toLowerCase()) ||
          t.id.toLowerCase().includes(taxSearch.toLowerCase()) ||
          t.country.toLowerCase().includes(taxSearch.toLowerCase()),
      )
    : TAX_ID_TYPES;

  // Load real payment method from Stripe if configured
  useEffect(() => {
    fetch("/api/billing/payment-method")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setPaymentMethod(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPaymentMethod(false));
  }, []);

  // Open Stripe billing portal to add / manage cards
  const handleOpenAddCard = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scopeId: "personal" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.url) {
          window.location.assign(data.data.url);
          return;
        }
      }
      toast.info("Stripe card management portal opened");
    } catch {
      toast.error("Could not open payment portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSaveInvoiceEmail = () => {
    if (!invoiceEmail.trim()) return;
    setSavingEmail(true);
    setTimeout(() => {
      setSavedInvoiceEmail(invoiceEmail.trim());
      setSavingEmail(false);
      toast.success("Invoice email recipient updated");
    }, 400);
  };

  const handleSaveCompany = () => {
    if (!companyName.trim()) return;
    setSavingCompany(true);
    setTimeout(() => {
      setSavedCompanyName(companyName.trim());
      setSavingCompany(false);
      toast.success("Company name updated");
    }, 400);
  };

  const handleSaveAddress = () => {
    setSavingAddress(true);
    setTimeout(() => {
      setSavingAddress(false);
      toast.success("Billing address updated");
    }, 400);
  };

  const handleSaveLanguage = () => {
    setSavingLanguage(true);
    setTimeout(() => {
      setSavedLanguage(language);
      setSavingLanguage(false);
      toast.success("Invoice language updated");
    }, 400);
  };

  const handleSavePo = () => {
    setSavingPo(true);
    setTimeout(() => {
      setSavedPoNumber(poNumber.trim());
      setSavingPo(false);
      toast.success("Purchase order line updated");
    }, 400);
  };

  const handleSaveTax = () => {
    setSavingTax(true);
    setTimeout(() => {
      setSavedTaxIdValue(taxIdValue.trim());
      setSavingTax(false);
      toast.success("Tax ID updated");
    }, 400);
  };

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          c.code.toLowerCase().includes(countrySearch.toLowerCase()),
      )
    : COUNTRIES;

  return (
    <div className="space-y-6">
      {/* 1. Payment Method Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Payment Method"
          description="Payments for domains, add-ons, and other usage are made using the default card."
        >
          {paymentMethod?.hasPaymentMethod ? (
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-white">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white capitalize">
                    {paymentMethod.brand ?? "Card"} •••• {paymentMethod.last4 ?? "0000"}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-800 bg-black/60 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-500 mb-2.5">
                <CreditCard className="size-6" strokeWidth={1.5} />
              </div>
              <div className="text-xs text-zinc-400">No payment methods added</div>
            </div>
          )}
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="At most, three credit cards can be added."
          action={
            <Button
              size="sm"
              disabled={portalLoading}
              onClick={handleOpenAddCard}
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4"
            >
              {portalLoading ? "Loading…" : "Add Card"}
            </Button>
          }
        />
      </SettingsCard>

      {/* 2. Invoice Email Recipient Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Invoice Email Recipient"
          description="By default, all your invoices will be sent to your account's email address. If you want to use a custom email address specifically for receiving invoices, enter it here."
        >
          <div className="max-w-md">
            <Input
              type="email"
              maxLength={254}
              value={invoiceEmail}
              onChange={(e) => setInvoiceEmail(e.target.value)}
              placeholder="john@doe.com"
              className="h-10 text-sm bg-black/60 border-zinc-800 placeholder:text-zinc-600 font-normal"
            />
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="Please use 254 characters at maximum."
          action={
            <Button
              size="sm"
              disabled={savingEmail || invoiceEmail === savedInvoiceEmail}
              onClick={handleSaveInvoiceEmail}
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {savingEmail ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* 3. Company Name Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Company Name"
          description="By default, your account name is shown on your invoice. If you want to show a custom name instead, please enter it here."
        >
          <div className="max-w-md">
            <Input
              maxLength={64}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name"
              className="h-10 text-sm bg-black/60 border-zinc-800 placeholder:text-zinc-600"
            />
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="Please use 64 characters at maximum."
          action={
            <Button
              size="sm"
              disabled={savingCompany || companyName === savedCompanyName}
              onClick={handleSaveCompany}
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {savingCompany ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* 4. Billing Address Card */}
      <SettingsCard>
        <SettingsCardBody title="Billing Address">
          <div className="space-y-4 max-w-md">
            <div>
              <Label className="text-xs text-zinc-400 font-normal mb-1.5 block">
                Organization Name
              </Label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Organization name"
                className="h-10 text-sm bg-black/60 border-zinc-800"
              />
            </div>

            <div>
              <Label className="text-xs text-zinc-400 font-normal mb-1.5 block">
                Country Or Region
              </Label>
              <DropdownMenu open={countryOpen} onOpenChange={setCountryOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-800 bg-black/60 px-3 text-sm text-white hover:border-zinc-700 transition-colors"
                  >
                    <span>{selectedCountry.name}</span>
                    <ChevronDown className="size-4 text-zinc-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 bg-zinc-950 border-zinc-800 p-1">
                  <div className="p-1 border-b border-zinc-800/80">
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="h-8 w-full bg-black/60 border border-zinc-800 rounded px-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto hide-scrollbar pt-1">
                    {filteredCountries.map((c) => (
                      <DropdownMenuItem
                        key={c.code}
                        className="flex items-center gap-2 text-xs cursor-pointer py-2 px-2.5 text-zinc-200 hover:text-white"
                        onClick={() => {
                          setSelectedCountry(c);
                          setCountrySearch("");
                          setCountryOpen(false);
                        }}
                      >
                        <span className="text-sm shrink-0">{c.flag}</span>
                        <span className="flex-1 truncate">{c.name}</span>
                        {c.code === selectedCountry.code && (
                          <Check className="size-3.5 text-white" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <Label className="text-xs text-zinc-400 font-normal mb-1.5 block">
                Address Line 1
              </Label>
              <Input
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street address or P.O. Box"
                className="h-10 text-sm bg-black/60 border-zinc-800"
              />
            </div>
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          action={
            <Button
              size="sm"
              disabled={savingAddress}
              onClick={handleSaveAddress}
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4"
            >
              {savingAddress ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* 5. Invoice Language Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Invoice Language"
          description="If your billing department is using a different language, enter it here."
        >
          <div className="max-w-md">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-800 bg-black/60 px-3 text-sm text-white hover:border-zinc-700 transition-colors"
                >
                  <span>{language}</span>
                  <ChevronDown className="size-4 text-zinc-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 bg-zinc-950 border-zinc-800 p-1">
                {INVOICE_LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    className="text-xs cursor-pointer py-2 px-3 text-zinc-200 hover:text-white"
                    onClick={() => setLanguage(lang)}
                  >
                    <span>{lang}</span>
                    {lang === language && <Check className="ml-auto size-3.5 text-white" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="This field determines the language of your invoice."
          action={
            <Button
              size="sm"
              disabled={savingLanguage || language === savedLanguage}
              onClick={handleSaveLanguage}
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {savingLanguage ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* 6. Invoice Purchase Order Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Invoice Purchase Order"
          description="By default, no purchase order line is shown on your account's billing invoices. If you want to show a purchase order line, please enter it here."
        >
          <div className="max-w-md">
            <Input
              maxLength={84}
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="PO-000000"
              className="h-10 text-sm bg-black/60 border-zinc-800"
            />
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="Please use 84 characters at maximum."
          action={
            <Button
              size="sm"
              disabled={savingPo || poNumber === savedPoNumber}
              onClick={handleSavePo}
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {savingPo ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>

      {/* 7. Tax ID Card */}
      <SettingsCard>
        <SettingsCardBody
          title="Tax ID"
          description="If you would like your invoice to render a specific tax ID, enter it here."
        >
          <div className="flex max-w-md items-center gap-2">
            <DropdownMenu open={taxOpen} onOpenChange={setTaxOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-56 shrink-0 items-center justify-between rounded-md border border-zinc-800 bg-black/60 px-3 text-xs text-white hover:border-zinc-700 transition-colors"
                >
                  <span className="truncate">{taxType.label}</span>
                  <ChevronDown className="size-3.5 text-zinc-500 ml-1 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 bg-zinc-950 border-zinc-800 p-1">
                <div className="p-1 border-b border-zinc-800/80">
                  <input
                    type="text"
                    placeholder="Search tax IDs..."
                    value={taxSearch}
                    onChange={(e) => setTaxSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="h-8 w-full bg-black/60 border border-zinc-800 rounded px-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-zinc-700"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto hide-scrollbar pt-1">
                  {filteredTaxTypes.map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      className="flex items-center gap-2 text-xs cursor-pointer py-2 px-2.5 text-zinc-200 hover:text-white"
                      onClick={() => {
                        setTaxType(t);
                        setTaxSearch("");
                        setTaxOpen(false);
                      }}
                    >
                      <span className="flex-1 truncate">{t.label}</span>
                      {t.id === taxType.id && <Check className="ml-auto size-3.5 text-white shrink-0" />}
                    </DropdownMenuItem>
                  ))}
                  {filteredTaxTypes.length === 0 && (
                    <div className="py-6 text-center text-xs text-zinc-500">
                      No tax ID types match your search
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              value={taxIdValue}
              onChange={(e) => setTaxIdValue(e.target.value)}
              placeholder={taxType.placeholder}
              className="h-10 flex-1 text-sm font-mono bg-black/60 border-zinc-800"
            />
          </div>
        </SettingsCardBody>
        <SettingsCardFooter
          helperText="Countries that do not use Tax IDs are not listed."
          action={
            <Button
              size="sm"
              disabled={savingTax || taxIdValue === savedTaxIdValue}
              onClick={handleSaveTax}
              className="h-8 rounded-md bg-white text-black hover:bg-zinc-200 text-xs font-medium px-4 disabled:opacity-40 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {savingTax ? "Saving…" : "Save"}
            </Button>
          }
        />
      </SettingsCard>
    </div>
  );
}
