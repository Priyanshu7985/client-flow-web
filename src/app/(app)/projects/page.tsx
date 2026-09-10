import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ProjectsExplorer } from "@/components/app/projects-explorer";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/data";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${projects.length} ${projects.length === 1 ? "project" : "projects"} in your workspace`}
        actions={
          <Button asChild size="sm">
            <Link href="/projects/new">
              <Plus className="size-4" /> New Project
            </Link>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="You don't have any projects yet"
          description="Create your first project to share a website and collect visual feedback from your client."
          action={
            <Button asChild>
              <Link href="/projects/new">Create your first project</Link>
            </Button>
          }
        />
      ) : (
        <ProjectsExplorer projects={projects} />
      )}
    </div>
  );
}
