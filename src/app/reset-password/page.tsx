import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Reset password | SAVZIX",
  description: "Reset your SAVZIX customer account password.",
  path: "/reset-password",
  index: false,
});

type PasswordResetPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function PasswordResetPage({ searchParams }: PasswordResetPageProps) {
  const { mode } = await searchParams;

  return (
    <section className="px-4 py-12 md:px-6 md:py-20">
      <PasswordResetForm isRecoverySession={mode === "update"} />
    </section>
  );
}
