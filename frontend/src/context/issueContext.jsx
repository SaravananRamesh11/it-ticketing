import React from 'react';
import { createContext, useContext, useReducer, useMemo } from 'react';

export const IssueContext = createContext();

const issueHierarchy = {
  "Hardware Issues": {
    "Desktops/Laptops": {
      "Repair": { timeLimit: 120 },
      "Replacement": { timeLimit: 180 },
      "Upgrade": { timeLimit: 90 },
      "Peripheral Issues": { timeLimit: 60 }
    },
    "Printers/Scanners": {
      "Setup": { timeLimit: 60 },
      "Configuration": { timeLimit: 90 },
      "Repair": { timeLimit: 120 },
      "Replacement": { timeLimit: 180 }
    },
    "Servers": {
      "Hardware Failure": { timeLimit: 240 },
      "Maintenance": { timeLimit: 180 },
      "Upgrade": { timeLimit: 300 }
    }
  },
  "Software": {
    "Operating Systems": {
      "Installation": { timeLimit: 120 },
      "Upgrade": { timeLimit: 180 },
      "Performance Issues": { timeLimit: 90 },
      "Driver Issues": { timeLimit: 60 }
    },
    "Applications": {
      "WPS": { timeLimit: 45 },
      "Microsoft Office": { timeLimit: 60 },
      "Teams": { timeLimit: 45 },
      "Upgrade": { timeLimit: 90 },
      "Licensing": { timeLimit: 30 },
      "Functionality": { timeLimit: 60 }
    },
    "Software Bug Reports": {
      "Reporting Software Defects": { timeLimit: 30 }
    }
  },
  "Connectivity (Network Issues)": {
    "Network Issues": {
      "Wired/Wireless Access": { timeLimit: 120 },
      "VPN": { timeLimit: 90 },
      "Network Performance": { timeLimit: 180 }
    },
    "Email Issues": {
      "Account Setup": { timeLimit: 30 },
      "Performance": { timeLimit: 60 },
      "Connectivity": { timeLimit: 90 }
    },
    "LAN/Internet": {
      "LAN Cable Issues": { timeLimit: 60 },
      "Internet I/O Port Damage": { timeLimit: 120 },
      "Website Issues": { timeLimit: 90 }
    }
  },
  "Accounts and Access (File Sharing)": {
    "User Accounts": {
      "Creation": { timeLimit: 15 },
      "Termination": { timeLimit: 15 },
      "Password Resets": { timeLimit: 10 },
      "Access Rights": { timeLimit: 30 }
    },
    "File/Resource Access": {
      "Shared Folders": { timeLimit: 45 },
      "Permissions": { timeLimit: 60 },
      "Network Drives": { timeLimit: 60 }
    }
  },
  "Other Services": {
    "Printing Services": {
      "Print Queues": { timeLimit: 30 },
      "Quality": { timeLimit: 60 },
      "Access": { timeLimit: 45 }
    },
    "Database Services": {
      "Access": { timeLimit: 90 },
      "Performance Tuning": { timeLimit: 240 },
      "Backup/Recovery": { timeLimit: 180 }
    },
    "Web Services": {
      "Website Accessibility": { timeLimit: 120 },
      "Content Updates": { timeLimit: 60 },
      "Domain Names": { timeLimit: 90 }
    }
  },
  "Mail Issues": {
    "Mail Operations": {
      "Mail Password Reset": { timeLimit: 10 },
      "Mail ID Creation": { timeLimit: 15 },
      "Deletion": { timeLimit: 15 },
      "Account Configuration": { timeLimit: 30 }
    },
    "Mail Client Issues": {
      "Configuration": { timeLimit: 30 },
      "Sync Issues": { timeLimit: 60 }
    }
  }
};


const priorityMap = {
  "Hardware Issues": "high",
  "Software": "medium",
  "Connectivity (Network Issues)": "high",
  "Accounts and Access (File Sharing)": "medium",
  "Other Services": "low",
  "Mail Issues": "medium"
};




export const IssueProvider = ({ children }) => {
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    // Helper function to get time limit
    const getTimeLimit = (mainCategory, subCategory, issue) => {
      try {
        return issueHierarchy[mainCategory]?.[subCategory]?.[issue]?.timeLimit;
      } catch (error) {
        console.error("Error getting time limit:", error);
        return null; // Explicit null for error cases
      }
    };

    // Helper to get all main categories
    const getMainCategories = () => Object.keys(issueHierarchy);

    // Helper to get sub-categories for a main category
    const getSubCategories = (mainCategory) => {
      return mainCategory in issueHierarchy ? Object.keys(issueHierarchy[mainCategory]) : [];
    };

    // Helper to get issues for a sub-category
    const getIssues = (mainCategory, subCategory) => {
      if (mainCategory in issueHierarchy && subCategory in issueHierarchy[mainCategory]) {
        return Object.keys(issueHierarchy[mainCategory][subCategory]);
      }
      return [];
    };

    // Helper to get priority
    const getPriority = (mainCategory) => {
      return priorityMap[mainCategory] || 'medium';
    };

    // Calculate deadline from createdAt and timeLimit
    const calculateDeadline = (createdAt, timeLimitMinutes) => {
      if (!createdAt || !timeLimitMinutes) return null;
      const createdDate = new Date(createdAt);
      return new Date(createdDate.getTime() + timeLimitMinutes * 60000);
    };

    return {
      issueHierarchy,
      priorityMap,
      getTimeLimit,
      getMainCategories,
      getSubCategories,
      getIssues,
      getPriority,
      calculateDeadline
    };
  }, []);

  return (
    <IssueContext.Provider value={contextValue}>
      {children}
    </IssueContext.Provider>
  );
};
