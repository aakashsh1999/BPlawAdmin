"use client"
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import NewsTable from "@/components/tables/NewsTable";
import { Basic } from "next/font/google";
import React, { useState } from "react";
import { toast } from "react-toastify";

function BlogEditorClient() {
  const [refreshRequired, setRefreshRequired] = useState(false);


  const handlePostCreated = () => {
    setRefreshRequired(true);
    toast.success("Post created successfully");
  };

  return <div>
          <PageBreadcrumb pageTitle="News and Blogs" />
          <ComponentCard title="View and manage news and blogs." onsaveSuccess={handlePostCreated}>
        <NewsTable refreshRequired={refreshRequired} setRefreshRequired={setRefreshRequired} /> 
        </ComponentCard>


  </div>;
}

export default BlogEditorClient;
