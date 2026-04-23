import { redirect } from "next/navigation"

export default function SettingsPage() {
  // const { userId } = await auth();

  // if (!userId) {
  //   return redirect('/auth/sign-in');
  // } else {
  //   redirect('/dashboard');
  // }
  redirect("/dashboard/settings/profile")
}
