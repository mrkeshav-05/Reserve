"use client";
import { Layout } from "@/components/layout";
import { ImpactStats } from "@/components/impact-stats";

export default function About() {
  return (
    <Layout>
      <div className="py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Our Impact</h1>
        <p className="max-w-2xl mx-auto text-center text-muted-foreground mb-12">
          Foodlink is dedicated to reducing food waste by connecting surplus food from local 
          businesses with communities that need it, helping to save meals and offset carbon emissions.
        </p>
        <ImpactStats />
      </div>
    </Layout>
  );
}
