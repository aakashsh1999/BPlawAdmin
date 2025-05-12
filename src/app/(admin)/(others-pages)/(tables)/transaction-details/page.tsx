import { DesignByFooter } from "@/components/DesignByFooter";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import BasicTableTwo from "@/components/tables/BasicTableTwo";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Transaction Details" />
      <div className="space-y-6">
        <ComponentCard title="View and manage transaction details of the user">
          <BasicTableTwo />
        </ComponentCard>
      </div>
      {/* <DesignByFooter variant="designed" link="https://www.onggy.com/" /> */}
    </div>
  );
}
