import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewProjectForm } from "@/components/app/new-project-form";

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Projects
      </Link>
      <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Create a project</h1>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        Add your client and the website you want reviewed. We&apos;ll generate a private review link.
      </p>
      <div className="mt-6">
        <NewProjectForm />
      </div>
    </div>
  );
}
