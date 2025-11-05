"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Home, Mail, Phone } from "lucide-react";
import Link from "next/link";

function TripConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tripId = searchParams.get("id");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!tripId) {
      router.push("/");
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tripId, router]);

  if (!tripId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center shadow-lg">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trip Request Submitted!
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Thank you for choosing us! Your trip request has been successfully submitted.
          </p>

          {/* Trip ID */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Your Request ID</p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              {tripId.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What happens next?
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">1</span>
                </div>
                <span>Our travel experts will review your request and selected activities</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">2</span>
                </div>
                <span>We'll contact you within 24 hours via email or phone</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">3</span>
                </div>
                <span>Receive a personalized quote with detailed itinerary</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <p className="text-sm text-gray-600 mb-4">Need immediate assistance?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:support@travelsite.com"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <Mail className="w-4 h-4" />
                support@travelsite.com
              </a>
              <a
                href="tel:+971123456789"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <Phone className="w-4 h-4" />
                +971 12 345 6789
              </a>
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Redirecting to home in <span className="font-semibold text-gray-900">{countdown}</span> seconds...
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TripConfirmationContent />
    </Suspense>
  );
}
