"use client";

import Link from "next/link";
import { Icons } from "@/lib/icons";
import { GlossaryScreen } from "@/components/screens/learn/glossary-screen";
import { useGlossary } from "@/hooks/use-learn";

export default function GlossaryPage() {
  const { data: glossary } = useGlossary();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/learn"
          className="text-text-tertiary hover:text-text-secondary inline-flex items-center gap-1 text-[13px]"
        >
          <Icons.arrowLeft className="size-3.5" />
          Learning Hub
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold">Glossary</h1>
          <p className="text-text-tertiary text-[13px]">
            <span className="text-text-secondary font-mono font-medium">{glossary.length}</span>{" "}
            terms
          </p>
        </div>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Every term this platform uses, explained in plain language — with a clinic example and
          links to where each one shows up.
        </p>
      </div>
      <GlossaryScreen />
    </div>
  );
}
