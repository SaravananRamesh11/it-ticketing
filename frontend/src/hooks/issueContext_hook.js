// import { useContext } from "react";
// import { IssueProvider } from "../context/issueContext";

// export default function useIssueData() {
//   const context = useContext(IssueProvider);
//   if (!context) {
//     throw new Error("useIssueData must be used within an IssueProvider");
//   }
//   return context;
// }


// import { useContext } from "react";
// import { IssueContext } from "../context/issueContext.jsx"; // ✅ Correct: import the context

// export default function useIssueData() {
//   const context = useContext(IssueContext); // ✅ Correct: use the context, not the provider
//   if (!context) {
//     throw new Error("useIssueData must be used within an IssueProvider");
//   }
//   return context;
// }

import { useContext } from "react";
import { IssueContext } from "../context/issueContext"; // ✅ use IssueContext

export default function useIssueData() {
  const context = useContext(IssueContext); // ✅ correct
  if (!context) {
    throw new Error("useIssueData must be used within an IssueProvider");
  }
  return context;
}

