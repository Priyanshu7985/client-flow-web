import Link from "next/link";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClients, listProjects } from "@/lib/data";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const [clients, projects] = await Promise.all([getClients(), listProjects()]);

  if (clients.length === 0) {
    return (
      <div>
        <PageHeader title="Clients" />
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Clients are added automatically when you create a project for them."
          action={
            <Button asChild>
              <Link href="/projects/new">Create a project</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} ${clients.length === 1 ? "client" : "clients"}`}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => {
          const clientProjects = projects.filter((p) => p.client_id === client.id);
          const approved = clientProjects.filter((p) => p.status === "approved").length;
          return (
            <Card key={client.id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={client.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-foreground">{client.name}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{client.email}</p>
                </div>
              </div>
              {client.company && (
                <p className="mt-3 text-[12.5px] text-muted-foreground">{client.company}</p>
              )}
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                <Badge tone="neutral">{clientProjects.length} projects</Badge>
                {approved > 0 && <Badge tone="approved">{approved} approved</Badge>}
              </div>
              {clientProjects.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {clientProjects.slice(0, 3).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-[12.5px] text-accent hover:underline"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
