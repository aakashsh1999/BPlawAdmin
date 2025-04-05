"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { collection, getDocs, limit, orderBy, query, startAfter, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config";
import { toast } from "react-toastify";
import Button from "../ui/button/Button";

export interface LawyerDetails {
  id: string;
  fullName: string;
  emailAddress: string;
  mobileNumber: string;
  profileImage: any;
  barCouncilEnrollment: {
    stateBarCouncil: string;
    enrollmentNumber: string;
    yearOfEnrollment: string;
    enrollmentCertificate: any;
  };
  educationalQualifications: Array<{
    degree: string;
    university: string;
    graduationYear: string;
    degreeCertificate: any;
  }>;
  practiceAreas: string[];
  yearsOfExperience: number;
  addressDetails: {
    chamberAddress: string;
    city: string;
    state: string;
    pincode: string;
  };
  languagesProficiency: string[];
  termsAndConditionsAgreement: boolean;
  verificationConsent: boolean;
  isPayment: boolean;
  isApproved: boolean;
}

const PAGE_SIZE = 10;

export default function BasicTableOne() {
  const [lawyers, setLawyers] = useState<LawyerDetails[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null); // To disable buttons during update

  const fetchLawyers = async (nextPage = false) => {
    setLoading(true);
    setError(null);

    try {
      const lawyersRef = collection(db, "lawyers_details");
      let q = query(lawyersRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));
      if (nextPage && lastDoc) {
        q = query(lawyersRef, orderBy("createdAt", "desc"), startAfter(lastDoc), limit(PAGE_SIZE));
      }

      const querySnapshot = await getDocs(q);
      const fetchedLawyers: LawyerDetails[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LawyerDetails[];

      setLawyers((prevLawyers) =>
        nextPage ? [...prevLawyers, ...fetchedLawyers] : fetchedLawyers
      );

      setLastDoc(
        querySnapshot.docs.length > 0
          ? querySnapshot.docs[querySnapshot.docs.length - 1]
          : null
      );
    } catch (err) {
      setError("Failed to fetch lawyers. Please try again.");
      console.error("Error fetching lawyers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers(false);
  }, []);

  const handleLoadMore = () => {
    if (lastDoc) {
      fetchLawyers(true);
    }
  };

  const handleApprove = async (lawyerId: string) => {
    setUpdatingId(lawyerId);
    try {
      const lawyerRef = doc(db, "lawyers_details", lawyerId);
      await updateDoc(lawyerRef, { isApproved: true });
      setLawyers((prevLawyers) =>
        prevLawyers.map((lawyer) =>
          lawyer.id === lawyerId ? { ...lawyer, isApproved: true } : lawyer
        )
      );
      toast.success("Lawyer approved successfully!");
    } catch (error) {
      console.error("Error approving lawyer:", error);
      toast.error("Failed to approve lawyer.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDisapprove = async (lawyerId: string) => {
    setUpdatingId(lawyerId);
    try {
      const lawyerRef = doc(db, "lawyers_details", lawyerId);
      await updateDoc(lawyerRef, { isApproved: false });
      setLawyers((prevLawyers) =>
        prevLawyers.map((lawyer) =>
          lawyer.id === lawyerId ? { ...lawyer, isApproved: false } : lawyer
        )
      );
      toast.warning("Lawyer disapproved.");
    } catch (error) {
      console.error("Error disapproving lawyer:", error);
      toast.error("Failed to disapprove lawyer.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-5xl w-full overflow-x-auto">
        <div className="min-w-[1200px]"> {/* Adjust min-width to accommodate new buttons */}
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Lawyer
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Mobile
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Practice Areas
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Experience
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Payment
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {lawyers.map((lawyer) => (
                <TableRow key={lawyer.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        {lawyer.profileImage && (
                          <Image
                            width={40}
                            height={40}
                            src={lawyer.profileImage}
                            alt={lawyer.fullName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/user/user-placeholder.png";
                            }}
                          />
                        )}
                        {!lawyer.profileImage && (
                          <Image
                            width={40}
                            height={40}
                            src="/images/user/user-placeholder.png"
                            alt="Placeholder"
                          />
                        )}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {lawyer.fullName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {lawyer.emailAddress}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {lawyer.mobileNumber}
                  </TableCell>
                  <TableCell className="px-5 capitalize py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {lawyer.practiceAreas.join(", ").split("_").join(" ")}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {lawyer.yearsOfExperience} Years
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {lawyer.isPayment ? "Paid" : "Pending"}
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        lawyer.isApproved === true
                          ? "success"
                          : lawyer.isApproved === false
                          ? "warning"
                          : "default"
                      }
                    >
                      {lawyer.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-500 hover:bg-green-500 hover:text-white"
                        onClick={() => handleApprove(lawyer.id)}
                        disabled={updatingId === lawyer.id || lawyer.isApproved}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDisapprove(lawyer.id)}
                        disabled={updatingId === lawyer.id || !lawyer.isApproved}
                      >
                        Disapprove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    Loading more lawyers...
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={8} className="py-4 text-center text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {lawyers.length > 0 && !loading && lastDoc && (
                <TableRow>
                  <TableCell colSpan={8} className="py-4 text-center">
                    <Button onClick={handleLoadMore} variant="outline" size="sm">
                      Load More
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {lawyers.length === 0 && !loading && !error && (
                <TableRow>
                  <TableCell colSpan={8} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    No lawyer details found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}