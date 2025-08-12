import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  useEffect(() => {
    document.title = "Admin Dashboard | ThaparAcad";
  }, []);

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Reporting Dashboard</h1>
        <p className="text-muted-foreground mt-2">Connect Supabase to enable real reports, filters, and exports.</p>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Papers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">—</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Review</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">—</CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Admin;
