import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import NewsTable from "@/components/tables/NewsTable";
import { Basic } from "next/font/google";
import React from "react";

function BlogEditorClient() {
  return <div>
          <PageBreadcrumb pageTitle="News and Blogs" />
          <ComponentCard title="View and manage news and blogs.">
              <NewsTable />
        </ComponentCard>


  </div>;
}

export default BlogEditorClient;
