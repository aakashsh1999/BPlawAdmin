"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if running in a browser environment before accessing localStorage
    if (typeof window !== 'undefined' && localStorage.getItem("token")) {
      router.push("/");
    }
  }, [router]); // Added router dependency to useEffect

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Simulate API call or authentication check
        // In a real app, replace this with an actual API call
        if (values.email === "admin@bplaw.com" && values.password === "admin@123") {
           // Check if running in a browser environment before accessing localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem("token", "user-authenticated");
            toast.success("User logged in successfully");
            router.push("/");
          }
        } else {
          toast.error("Invalid email or password");
        }
      } catch (error) {
         console.error("Login error:", error); // Log the actual error
         toast.error("An unexpected error occurred. Please try again."); // More user-friendly message
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
              {/* Email Field */}
              <div>
                {/* Use htmlFor for accessibility, linking label to input */}
                <Label htmlFor="email">Email <span className="text-error-500">*</span></Label>
                <Input
                  id="email" // Add id matching the label's htmlFor
                  name="email"
                  type="email"
                  placeholder="info@gmail.com"
                  onChange={formik.handleChange}
                  // Add aria-describedby for errors if needed
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-sm text-red-500" id="email-error"> {/* Optional id for aria-describedby */}
                    {formik.errors.email}
                  </p>
                ) : null}
              </div>

              {/* Password Field */}
              <div>
                 {/* Use htmlFor for accessibility */}
                <Label htmlFor="password">Password <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password" // Add id matching the label's htmlFor
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    onChange={formik.handleChange}
                     // Add aria-describedby for errors if needed
                  />
                  {/* Use a button for interactive elements */}
                  <button
                    type="button" // Prevent form submission
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2 p-1" // Added padding for easier click
                    aria-label={showPassword ? "Hide password" : "Show password"} // Accessibility label
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 w-5 h-5" /> // Example size
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 w-5 h-5" /> // Example size
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-sm text-red-500" id="password-error"> {/* Optional id for aria-describedby */}
                    {formik.errors.password}
                  </p>
                ) : null}
              </div>

              {/* Submit Button */}
              <div>
                <Button className="w-full" size="sm" disabled={isLoading || !formik.isValid || !formik.dirty}>
                  {/* More informative loading state and disable logic */}
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}