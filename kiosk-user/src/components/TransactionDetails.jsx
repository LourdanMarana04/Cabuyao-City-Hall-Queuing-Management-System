import React, { useEffect, useState } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { ArrowLeft } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const TransactionDetails = ({ departmentId, transactionId, onBack, children }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`);
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment and try again.");
          }
          throw new Error(`Failed to fetch department (${response.status})`);
        }
        const dept = await response.json();
        const tx = (dept.transactions || []).find(
          (t) => String(t.id) === String(transactionId)
        );
        setTransaction(tx);
      } catch (err) {
        console.error("Error fetching transaction details:", err);
        setError(err.message || "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [departmentId, transactionId]);

  if (loading) return <div className="text-center py-8">{t("loadingTransactionDetails")}</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!transaction) return <div className="text-center py-8">{t("transactionNotFound")}</div>;

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-blue-50 overflow-hidden">
      {/* Back button fixed */}
      {onBack && (
        <button
        className="absolute left-0 top-0 ml-4 mt-2 p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-100 transition-all focus:outline-none"
        onClick={onBack}
        aria-label="Back"
      >
        <ArrowLeft className="w-6 h-6 text-blue-700" />
      </button>
      )}

      {/* Title */}
      <h2 className="text-3xl font-extrabold text-red-800 mt-16 mb-4">{t("transactionDetails")}</h2>

      {/* Card container (fits screen height) */}
      <div className="flex flex-col items-center w-full max-w-3xl h-[65vh] bg-white border border-gray-300 rounded-[2rem] shadow-xl p-8 overflow-y-auto">
        {/* Transaction Name */}
        <h2 className="text-3xl font-extrabold text-blue-700 text-center drop-shadow-md mb-6">
          {transaction.name}
        </h2>

        {/* Checklist Section */}
        <div className="w-full bg-gradient-to-b from-yellow-50 to-white rounded-[2rem] shadow-lg border border-gray-200 mb-8">
          <div
            className="px-8 py-4 text-center rounded-t-[2rem] border-b border-gray-200"
            style={{
              background:
                "linear-gradient(135deg, rgb(250,223,136) 0%, rgb(253,209,78) 60%, rgb(255,192,44) 100%)",
              boxShadow:
                "0 8px 15px rgba(255,193,7,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <h3 className="text-2xl font-bold text-red-700 tracking-wide">
              {t("checklistRequirements")}
            </h3>
          </div>

          <table className="w-full border border-gray-300 text-base bg-white rounded-b-[2rem] overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-6 text-left font-bold text-gray-800 uppercase tracking-wide">
                  {t("requirement")}
                </th>
                <th className="py-3 px-6 text-left font-bold text-gray-800 uppercase tracking-wide">
                  {t("whereToSecure")}
                </th>
              </tr>
            </thead>
            <tbody>
              {transaction.requirements?.length > 0 ? (
                transaction.requirements.map((req, idx) => {
                  let text = req.text;
                  let where = req.where || "";
                  if (typeof text === "object" && text !== null) {
                    where = text.where || "";
                    text = text.text || "";
                  }
                  return (
                    <tr
                      key={idx}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-yellow-50"
                      } hover:bg-yellow-100 transition`}
                    >
                      <td className="py-3 px-6 border-b border-gray-200">{text}</td>
                      <td className="py-3 px-6 border-b border-gray-200">{where}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-400 italic">
                    {t("noRequirements")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Procedures Section */}
        <div className="w-full bg-gradient-to-b from-yellow-50 to-white rounded-[2rem] shadow-lg border border-gray-200 mb-4">
          <div
            className="px-8 py-4 text-center rounded-t-[2rem] border-b border-gray-200"
            style={{
              background:
                "linear-gradient(135deg, rgb(250,223,136) 0%, rgb(253,209,78) 60%, rgb(255,192,44) 100%)",
              boxShadow:
                "0 8px 15px rgba(255,193,7,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <h3 className="text-2xl font-bold text-red-700 tracking-wide">
              {t("procedures")}
            </h3>
          </div>

          <table className="w-full border border-gray-300 text-base bg-white rounded-b-[2rem] overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-6 text-center font-bold text-gray-800 uppercase tracking-wide">
                  {t("procedure")}
                </th>
              </tr>
            </thead>
            <tbody>
              {transaction.procedures?.length > 0 ? (
                transaction.procedures.map((proc, idx) => {
                  let text = proc.text;
                  if (typeof text === "object" && text !== null) {
                    text = text.text || "";
                  }
                  return (
                    <tr
                      key={idx}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-yellow-50"
                      } hover:bg-yellow-100 transition`}
                    >
                      <td className="py-3 px-6 border-b border-gray-200 text-left">
                        <span className="font-semibold mr-2">{idx + 1}.</span>
                        {text}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-4 text-center text-gray-400 italic">
                    {t("noProcedures")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        {children && (
          <div className="w-full flex justify-center gap-4 mt-4 mb-4">{children}</div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetails;
