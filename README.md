# Salesforce MCP Server (Extended)

[![npm version](https://img.shields.io/npm/v/@boejucci/mcp-server-salesforce)](https://www.npmjs.com/package/@boejucci/mcp-server-salesforce)

An extended MCP (Model Context Protocol) server implementation that integrates Claude with Salesforce, enabling natural language interactions with your Salesforce data, metadata, **and reports**. This fork adds comprehensive report creation and management capabilities to the original [tsmztech/mcp-server-salesforce](https://github.com/tsmztech/mcp-server-salesforce).

## 🆕 New Report Features

This fork extends the original server with 5 powerful report creation tools:

* **Report Creation**: Create Salesforce reports using natural language
* **Report Discovery**: List and search available report types
* **Schema Inspection**: Get detailed field information for report types
* **Report Reading**: Inspect existing report metadata
* **Smart Filtering**: Automatic date range detection and field formatting

## Installation

### npm (Recommended)

```bash
npx @boejucci/mcp-server-salesforce
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "salesforce": {
      "command": "npx",
      "args": ["-y", "@boejucci/mcp-server-salesforce"],
      "env": {
        "SALESFORCE_CONNECTION_TYPE": "OAuth_2.0_Client_Credentials",
        "SALESFORCE_CLIENT_ID": "your_client_id",
        "SALESFORCE_CLIENT_SECRET": "your_client_secret",
        "SALESFORCE_INSTANCE_URL": "https://your-domain.my.salesforce.com"
      }
    }
  }
}
```

## Report Tools

### salesforce_create_report

Create Salesforce reports with TABULAR, SUMMARY, or MATRIX formats. Supports filters, groupings, and automatic date range detection.

**Features:**
* Smart field name formatting (automatically adds object prefixes to custom fields)
* Automatic date range filter conversion
* Support for charts
* Multiple report formats (TABULAR, SUMMARY, MATRIX)

**Example Usage:**
```
"Create a report showing MSP opportunities by month for 2024-2025"
"Make a tabular report of all accounts with their annual revenue"
"Build a summary report of opportunities grouped by stage"
```

**Parameters:**
* `name`: Report name
* `reportType`: Base object (e.g., "Opportunity", "Account")
* `format`: TABULAR, SUMMARY, or MATRIX
* `columns`: Array of field names (use UPPERCASE for standard fields)
* `filters`: Array of filter objects
* `groupingsDown`: Row groupings for SUMMARY/MATRIX
* `groupingsAcross`: Column groupings for MATRIX only
* `chart`: Optional chart configuration

**Smart Features:**
* Custom field names (e.g., `Type__c`) are automatically formatted as `Opportunity.Type__c`
* Date range filters are automatically detected and converted to `timeFrameFilter`
* Standard fields use UPPERCASE format (e.g., `OPPORTUNITY_NAME`, `AMOUNT`)

### salesforce_list_report_types

Discover available report types in your Salesforce org.

**Example Usage:**
```
"What report types are available for opportunities?"
"Show me all account-related report types"
```

### salesforce_describe_report_type

Get detailed field information for a specific report type, including which fields are filterable, groupable, and sortable.

**Example Usage:**
```
"What fields are available in the Opportunity report type?"
"Show me filterable fields for Account reports"
```

### salesforce_read_report

Inspect existing report metadata including columns, filters, groupings, and chart configuration.

**Example Usage:**
```
"Show me the configuration of the Q3 Sales Report"
"What filters are applied to my pipeline report?"
```

### salesforce_list_reports

List all reports or search for reports by name pattern.

**Example Usage:**
```
"List all reports with 'Opportunity' in the name"
"Find reports related to sales"
```

## Original Features

All features from the original [tsmztech/mcp-server-salesforce](https://github.com/tsmztech/mcp-server-salesforce) are included:

* **Object and Field Management**: Create and modify custom objects and fields
* **Smart Object Search**: Find Salesforce objects using partial name matches
* **Flexible Data Queries**: Query records with relationship support
* **Data Manipulation**: Insert, update, delete, and upsert records
* **Cross-Object Search**: Search across multiple objects using SOSL
* **Apex Code Management**: Read, create, and update Apex classes and triggers
* **Debug Log Management**: Enable, disable, and retrieve debug logs

For complete documentation on the original tools, see the [original repository](https://github.com/tsmztech/mcp-server-salesforce).

## Authentication

Supports three authentication methods:

### 1. OAuth 2.0 Client Credentials (Recommended)
```json
{
  "env": {
    "SALESFORCE_CONNECTION_TYPE": "OAuth_2.0_Client_Credentials",
    "SALESFORCE_CLIENT_ID": "your_client_id",
    "SALESFORCE_CLIENT_SECRET": "your_client_secret",
    "SALESFORCE_INSTANCE_URL": "https://your-domain.my.salesforce.com"
  }
}
```

### 2. Username/Password
```json
{
  "env": {
    "SALESFORCE_CONNECTION_TYPE": "User_Password",
    "SALESFORCE_USERNAME": "your_username",
    "SALESFORCE_PASSWORD": "your_password",
    "SALESFORCE_TOKEN": "your_security_token",
    "SALESFORCE_INSTANCE_URL": "https://login.salesforce.com"
  }
}
```

### 3. Salesforce CLI
```json
{
  "env": {
    "SALESFORCE_CONNECTION_TYPE": "Salesforce_CLI"
  }
}
```

## Example: Creating Reports

### Simple Tabular Report
```
"Create a tabular report showing all opportunities with their names, amounts, and close dates"
```

This generates a basic list-style report with three columns.

### Summary Report with Grouping
```
"Create a summary report of opportunities grouped by stage, showing the total amount for each stage"
```

Creates a report grouped by stage with subtotals.

### Matrix Report
```
"Create a matrix report showing opportunity counts by stage and quarter"
```

Creates a two-dimensional report with row and column groupings.

### Report with Filters and Date Ranges
```
"Create a report of MSP opportunities created between January 1, 2024 and December 31, 2025, grouped by month"
```

The tool automatically:
* Converts `Type__c` to `Opportunity.Type__c`
* Detects the two date filters and converts to a `timeFrameFilter`
* Groups by month using date granularity

## Development

### Building from Source

```bash
git clone https://github.com/boejucci/mcp-server-salesforce.git
cd mcp-server-salesforce
npm install
npm run build
```

### Running Locally

```json
{
  "mcpServers": {
    "salesforce": {
      "command": "node",
      "args": ["/path/to/mcp-server-salesforce/dist/index.js"],
      "env": {
        // ... auth config
      }
    }
  }
}
```

## Technical Details

### Report Field Naming

The tool handles field naming intelligently:

* **Standard fields**: Use UPPERCASE format
  * Examples: `OPPORTUNITY_NAME`, `AMOUNT`, `STAGE_NAME`, `CREATED_DATE`
* **Custom fields**: Use exact API names (e.g., `Type__c`)
  * Automatically prefixed with object name: `Type__c` → `Opportunity.Type__c`

### Date Range Filters

Date ranges are automatically detected and converted:

```javascript
// Input filters
[
  {"field": "CREATED_DATE", "operator": "greaterOrEqual", "value": "2024-01-01"},
  {"field": "CREATED_DATE", "operator": "lessOrEqual", "value": "2025-12-31"}
]

// Automatically converted to:
{
  "timeFrameFilter": {
    "dateColumn": "CREATED_DATE",
    "startDate": "2024-01-01",
    "endDate": "2025-12-31",
    "interval": "INTERVAL_CUSTOM"
  }
}
```

### Supported Report Formats

* **TABULAR**: Simple list-style reports
* **SUMMARY**: Reports with groupings and subtotals (supports row groupings only)
* **MATRIX**: Two-dimensional reports (supports both row and column groupings)

## Contributing

Contributions welcome! Please submit pull requests or open issues on GitHub.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

Based on [tsmztech/mcp-server-salesforce](https://github.com/tsmztech/mcp-server-salesforce) with report creation extensions by Joe Bucci.

## Links

* **npm package**: [@boejucci/mcp-server-salesforce](https://www.npmjs.com/package/@boejucci/mcp-server-salesforce)
* **GitHub**: [boejucci/mcp-server-salesforce](https://github.com/boejucci/mcp-server-salesforce)
* **Original**: [tsmztech/mcp-server-salesforce](https://github.com/tsmztech/mcp-server-salesforce)
