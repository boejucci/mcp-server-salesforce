import jsforce from "jsforce";
type Connection = InstanceType<typeof jsforce.Connection>;
import { MetadataUtils } from '../metadata/metadataUtils.js';

/**
 * Read report metadata from Salesforce
 */
export async function readReport(
  conn: Connection,
  reportName: string
): Promise<{ success: boolean; metadata?: any; error?: string }> {
  try {
    const metadataUtils = new MetadataUtils(conn);
    
    // Retrieve the report metadata
    const result = await metadataUtils.retrieveMetadata('Report', reportName);
    
    return {
      success: true,
      metadata: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * List reports in a specific folder (or search by pattern)
 */
export async function listReports(
  conn: Connection,
  folder?: string,
  searchPattern?: string
): Promise<{ success: boolean; reports?: any[]; error?: string }> {
  try {
    const metadataUtils = new MetadataUtils(conn);

    // If no folder specified, try common folders
    const foldersToCheck = folder
      ? [folder]
      : ['unfiled$public', 'Private Reports'];

    let allReports: any[] = [];
    const errors: string[] = [];

    for (const folderName of foldersToCheck) {
      try {
        const results = await metadataUtils.listMetadata('Report', folderName);
        allReports = allReports.concat(results.filter(r => r)); // Filter out null/undefined
      } catch (error) {
        errors.push(`${folderName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Filter by search pattern if provided
    let filteredReports = allReports;
    if (searchPattern) {
      const pattern = searchPattern.toLowerCase();
      filteredReports = allReports.filter((report: any) =>
        report.fullName.toLowerCase().includes(pattern) ||
        (report.namespacePrefix && report.namespacePrefix.toLowerCase().includes(pattern))
      );
    }

    return {
      success: true,
      reports: filteredReports,
      error: errors.length > 0 ? `Some folders failed: ${errors.join('; ')}` : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * List all report folders
 */
export async function listReportFolders(
  conn: Connection
): Promise<{ success: boolean; folders?: any[]; error?: string }> {
  try {
    const metadataUtils = new MetadataUtils(conn);
    const folders = await metadataUtils.listReportFolders();

    return {
      success: true,
      folders: folders.filter(f => f) // Filter out null/undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Tool definition for reading report metadata
 */
export const readReportTool = {
  name: 'salesforce_read_report',
  description: 'Read detailed metadata for a Salesforce report including columns, filters, groupings, and chart configuration. Use this to inspect existing reports and understand their structure.',
  inputSchema: {
    type: 'object',
    properties: {
      reportName: {
        type: 'string',
        description: 'Full name of the report (e.g., "unfiled$public/Report_Name" or just "Report_Name")'
      }
    },
    required: ['reportName']
  }
};

/**
 * Tool definition for listing reports
 */
export const listReportsTool = {
  name: 'salesforce_list_reports',
  description: `List reports in Salesforce folders.

IMPORTANT: Reports in Salesforce are organized in folders. This tool will:
- If folder is specified: List reports in that specific folder
- If no folder specified: Check common folders ("unfiled$public" and "Private Reports")
- Cannot list ALL reports across all folders in one call (Salesforce API limitation)

TIP: Use salesforce_list_report_folders first to discover available folders, then call this tool with specific folder names.`,
  inputSchema: {
    type: 'object',
    properties: {
      folder: {
        type: 'string',
        description: 'Folder name to list reports from (e.g., "unfiled$public", "Private Reports"). If not specified, will check common folders.'
      },
      searchPattern: {
        type: 'string',
        description: 'Optional search pattern to filter reports by name'
      }
    }
  }
};

/**
 * Tool definition for listing report folders
 */
export const listReportFoldersTool = {
  name: 'salesforce_list_report_folders',
  description: `List all report folders in Salesforce. Use this to discover available folders before listing reports.

NOTE: You may only see folders that you created and the "unfiled$public" folder. Standard folders like "Activity Reports" may not appear depending on permissions.`,
  inputSchema: {
    type: 'object',
    properties: {}
  }
};
