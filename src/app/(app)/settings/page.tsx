import { PageHeader } from "@/components/app/page-header";
import {
  AppearancePanel,
  NotificationsPanel,
  ProfilePanel,
  WorkspacePanel,
} from "@/components/app/settings-panels";
import { getProfile } from "@/lib/data";
import { demoProfile } from "@/lib/data/sample";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = (await getProfile()) ?? demoProfile;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" description="Manage your account, workspace and preferences." />
      <div className="space-y-6">
        <ProfilePanel profile={profile} />
        <WorkspacePanel profile={profile} />
        <NotificationsPanel profile={profile} />
        <AppearancePanel />
      </div>
    </div>
  );
}
