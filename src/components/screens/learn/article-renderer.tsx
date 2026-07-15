import Link from "next/link";
import { Icons } from "@/lib/icons";
import type { ArticleBlock, Inline } from "@/lib/data/types";

function InlineRun({ body }: { body: Inline[] }) {
  return (
    <>
      {body.map((seg, i) =>
        typeof seg === "string" ? (
          <span key={i}>{seg}</span>
        ) : (
          <Link
            key={i}
            href={seg.href}
            className="text-primary-600 decoration-primary-300 hover:decoration-primary-600 dark:text-primary-300 dark:decoration-primary-700 font-medium underline underline-offset-2"
          >
            {seg.text}
          </Link>
        ),
      )}
    </>
  );
}

export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "h2":
            return (
              <h2
                key={i}
                className="mt-3 text-lg font-semibold first:mt-0"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="mt-1 text-sm font-semibold"
              >
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p
                key={i}
                className="text-text-secondary text-sm leading-relaxed"
              >
                <InlineRun body={block.body} />
              </p>
            );
          case "steps":
            return (
              <ol
                key={i}
                className="flex flex-col gap-2.5"
              >
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3"
                  >
                    <span className="bg-primary-50 text-primary-700 dark:bg-primary-700/25 dark:text-primary-100 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold">
                      {j + 1}
                    </span>
                    <span className="text-text-secondary text-sm leading-relaxed">
                      <InlineRun body={item} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "bullets":
            return (
              <ul
                key={i}
                className="flex flex-col gap-2"
              >
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3"
                  >
                    <span
                      className="bg-primary-500 mt-[7px] size-1.5 shrink-0 rounded-full"
                      aria-hidden
                    />
                    <span className="text-text-secondary text-sm leading-relaxed">
                      <InlineRun body={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "note":
            return (
              <div
                key={i}
                className="border-primary-200 bg-primary-50 dark:border-primary-700/50 dark:bg-primary-700/15 flex gap-2.5 rounded-md border p-3.5"
              >
                <Icons.info
                  className="text-primary-600 dark:text-primary-300 mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <p className="text-text-secondary text-[13px] leading-relaxed">
                  <InlineRun body={block.body} />
                </p>
              </div>
            );
        }
      })}
    </div>
  );
}
