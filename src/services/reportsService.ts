import {
  makeGetRequest,
  makePostRequest,
  makeDeleteRequest,
} from "../config/Api";
import { LOCAL_HOST } from "../config/config";

export interface GeneratedReport {
  id: string;
  type: string;
  format: string;
  generatedAt: string;
  data: any;
}

export interface ReportStats {
  totalReports: number;
  generatedToday: number;
  generatedThisWeek: number;
  generatedThisMonth: number;
}

const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const reportsService = {
  /**
   * Get list of generated reports
   */
  async getReports(params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
  }): Promise<any> {
    return await makeGetRequest("admin/reports", undefined, params);
  },

  /**
   * Generate a new report
   */
  async generateReport(data: {
    type: string;
    startDate?: string;
    endDate?: string;
    format?: string;
    filters?: any;
  }): Promise<any> {
    return await makePostRequest("admin/reports/generate", data);
  },

  /**
   * Download a generated report
   */
  async downloadReport(reportId: string): Promise<void> {
    const token = getAuthToken();
    const response = await fetch(
      `${LOCAL_HOST}api/admin/reports/${reportId}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to download report");
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "report.pdf";
    if (contentDisposition) {
      const matches = /filename="([^"]+)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Download report data as JSON/CSV
   */
  async downloadReportData(
    data: any,
    filename: string,
    format: "json" | "csv",
  ) {
    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else if (format === "csv") {
      // Convert data to CSV format
      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  },

  /**
   * Convert JSON data to CSV
   */
  convertToCSV(data: any): string {
    if (!data || typeof data !== "object") return "";

    // Handle array of objects
    if (Array.isArray(data)) {
      if (data.length === 0) return "";
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(",")];

      for (const row of data) {
        const values = headers.map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        });
        csvRows.push(values.join(","));
      }

      return csvRows.join("\n");
    }

    // Handle object with summary and data
    if (data.summary && data.users) {
      return this.convertToCSV(data.users);
    }
    if (data.summary && data.videos) {
      return this.convertToCSV(data.videos);
    }
    if (data.summary && data.subscriptions) {
      return this.convertToCSV(data.subscriptions);
    }

    return "";
  },

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<any> {
    return await makeDeleteRequest(`admin/reports/${reportId}`);
  },

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<any> {
    return await makeGetRequest("admin/reports/stats");
  },
};

export default reportsService;
