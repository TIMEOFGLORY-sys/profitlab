import { redirect } from "next/navigation";
import ProfitLabApp from "@/components/ProfitLabApp";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <ProfitLabApp />;
}
