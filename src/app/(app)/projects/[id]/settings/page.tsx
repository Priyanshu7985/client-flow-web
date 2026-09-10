import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ProjectSettingsForm } from "@/components/app/project-settings-form";
import { DeleteProjectButton } from "@/components/app/delete-project-button";
import { CopyLinkButton } from "@/components/app/copy-link-button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_URL } from "@/lib/constants";
import { getProject } from "@/lib/data";

export const metadata = { title: "Project settings" };

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/projects/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> {project.name}
      </Link>
      <PageHeader title="Project settings" />

      <div className="space-y-6">
        <ProjectSettingsForm project={project} />

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardBody className="pt-3 text-[13px]">
            <p className="text-foreground">{project.client?.name ?? "No client"}</p>
            <p className="text-muted-foreground">{project.client?.email ?? "—"}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review link</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap items-center gap-3 pt-3">
            <span className="flex-1 truncate font-mono text-[12px] text-muted-foreground">
              {SITE_URL}/review/{project.review_token}
            </span>
            <CopyLinkButton value={`${SITE_URL}/review/${project.review_token}`} label="Copy link" />
          </CardBody>
        </Card>

        <Card className="border-danger/25">
          <CardHeader>
            <CardTitle className="text-danger">Danger zone</CardTitle>
          </CardHeader>
          <CardBody className="flex items-center justify-between gap-4 pt-3">
            <p className="text-[13px] text-muted-foreground">
              Delete this project and everything in it.
            </p>
            <DeleteProjectButton projectId={project.id} projectName={project.name} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
