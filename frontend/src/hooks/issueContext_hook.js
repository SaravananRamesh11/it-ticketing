import { useContext } from "react";
import { IssueContext } from "../context/issueContext"; // ✅ use IssueContext

export default function useIssueData() {
  const context = useContext(IssueContext); // ✅ correct
  if (!context) {
    throw new Error("useIssueData must be used within an IssueProvider");
  }
  return context;
}

