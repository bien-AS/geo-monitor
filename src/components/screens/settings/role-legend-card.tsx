import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_CAPABILITIES, ROLE_META } from "./roles";

/** Capability matrix — which of the 4 workspace roles can do what. */
export function RoleLegendCard() {
  return (
    <Card className="gap-4 p-6">
      <div>
        <h2 className="text-base font-semibold">What each role can do</h2>
        <p className="text-text-tertiary mt-0.5 text-[13px]">
          Agency roles run the platform; client roles see a clean, cost-free view of their
          locations.
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-56">Capability</TableHead>
              {(Object.keys(ROLE_META) as Array<keyof typeof ROLE_META>).map((r) => (
                <TableHead
                  key={r}
                  className="text-center"
                >
                  {ROLE_META[r].label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROLE_CAPABILITIES.map((row) => (
              <TableRow key={row.capability}>
                <TableCell className="text-[13px]">{row.capability}</TableCell>
                {(["as_admin", "as_staff", "client_admin", "client_user"] as const).map((r) => (
                  <TableCell
                    key={r}
                    className="text-center"
                  >
                    {row[r] ? (
                      <Icons.check
                        className="text-success-600 mx-auto size-4"
                        aria-label="Yes"
                      />
                    ) : (
                      <Icons.minus
                        className="text-text-disabled mx-auto size-4"
                        aria-label="No"
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
