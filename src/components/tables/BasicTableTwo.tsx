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
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../../../config";
import Button from "../ui/button/Button";

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string;
  status: "success" | "pending" | "failed";
  createdAt: { toLocaleDateString: (locale?: string | string[], options?: Intl.DateTimeFormatOptions | undefined) => string }; // Adjust type based on your actual data
}

const PAGE_SIZE = 10;

export default function BasicTableTwo() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (nextPage = false) => {
    setLoading(true);
    setError(null);

    try {
      const transcationRef = collection(db, "transactions");
      let q = query(transcationRef, orderBy("createdAt"), limit(PAGE_SIZE));

      if (nextPage && lastDoc) {
        q = query(transcationRef, orderBy("createdAt"), startAfter(lastDoc), limit(PAGE_SIZE));
      }

      const querySnapshot = await getDocs(q);
      const fetchedTransactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      setTransactions((prevTransactions) =>
        nextPage ? [...prevTransactions, ...fetchedTransactions] : fetchedTransactions
      );

      setLastDoc(
        querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null
      );
    } catch (err) {
      setError("Failed to fetch transactions. Please try again.");
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(false);
  }, []);

  const handleLoadMore = () => {
    if (lastDoc) {
      fetchTransactions(true);
    }
  };

  const formatDate = (timestamp: { toDate: () => Date } | undefined): string => {
    if (!timestamp) {
      return "";
    }
    try {
      const date = timestamp.toDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Order ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Payment ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Currency
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {transaction?.userId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {transaction?.orderId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {transaction?.paymentId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {transaction?.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {transaction?.currency}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        transaction?.status === "success"
                          ? "success"
                          : transaction?.status === "pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {transaction?.status?.charAt(0).toUpperCase() +
                        transaction?.status?.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {formatDate(transaction?.createdAt)}
                  </TableCell>
                </TableRow>
              ))}

              {loading && (
                <TableRow>
                  <TableCell  className="px-2 w-full py-4  text-gray-500 dark:text-gray-400">
                    Loading more transactions...
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell className="px-2 py-4  text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {transactions.length > PAGE_SIZE && !loading && lastDoc && (
                <TableRow>
                  <TableCell  className="py-4 text-center">
                    <Button onClick={handleLoadMore} variant="outline" size="sm">
                      Load More
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {transactions.length === 0 && !loading && !error && (
                <TableRow>
                  <TableCell className="px-2 py-4 text-gray-500 dark:text-gray-400">
                    No transactions found.
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