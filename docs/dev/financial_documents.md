# Document Types for Recognition System

## Identity Documents
1. **Personal ID**
   - Required Fields:
     * ID Number
     * Full Name
     * Date of Birth
     * Issue Date
     * Expiry Date
   - Optional Fields:
     * Address
     * Nationality
     * Place of Issue

2. **Passport**
   - Required Fields:
     * Passport Number
     * Full Name
     * Nationality
     * Date of Birth
     * Expiry Date
   - Optional Fields:
     * Place of Issue
     * Issue Date
     * Address

3. **Driving License**
   - Required Fields:
     * License Number
     * Full Name
     * Date of Birth
     * Issue Date
     * Expiry Date
     * License Type
   - Optional Fields:
     * Address
     * Restrictions

## Income Documents
1. **Pay Slip**
   - Required Fields:
     * Employee Name
     * Employer Details
     * Gross Salary
     * Net Salary
     * Pay Period
     * Tax Deductions
   - Optional Fields:
     * Bonuses
     * Overtime
     * Social Security Numbers

2. **Tax Return**
   - Required Fields:
     * Tax Year
     * Total Income
     * Taxable Income
     * Tax Paid
     * Filing Status
   - Optional Fields:
     * Business Income
     * Investment Income
     * Deductions

## Bank Documents
1. **Bank Statement**
   - Required Fields:
     * Account Holder
     * Account Number
     * Statement Period
     * Opening Balance
     * Closing Balance
     * Monthly Income
     * Regular Expenses
   - Optional Fields:
     * Savings Rate
     * Overdraft Information
     * Credit Usage

2. **Credit Report**
   - Required Fields:
     * Personal Information
     * Credit Score
     * Payment History
     * Current Debts
     * Credit Utilization
   - Optional Fields:
     * Previous Loans
     * Credit Inquiries
     * Bankruptcy Information

## Property Documents
1. **Property Valuation**
   - Required Fields:
     * Property Address
     * Market Value
     * Valuation Date
     * Property Type
     * Square Footage
   - Optional Fields:
     * Comparable Sales
     * Condition Assessment
     * Location Details

2. **Property Title**
   - Required Fields:
     * Property Details
     * Owner Information
     * Registration Number
     * Purchase Price
     * Purchase Date
   - Optional Fields:
     * Mortgage Details
     * Liens
     * Easements

## Business Documents
1. **Financial Statement**
   - Required Fields:
     * Revenue
     * Expenses
     * Net Profit
     * Assets
     * Liabilities
     * Period Covered
   - Optional Fields:
     * Cash Flow
     * Equity Details
     * Notes to Accounts

2. **Business Plan**
   - Required Fields:
     * Company Overview
     * Financial Projections
     * Market Analysis
     * Revenue Model
   - Optional Fields:
     * Competition Analysis
     * Risk Assessment
     * Team Structure

## Validation Rules
1. **Format Validation**
   - Date formats (DD/MM/YYYY, MM/DD/YYYY)
   - Currency formats (with decimal places)
   - Number formats (integers, decimals)
   - ID number patterns

2. **Logic Validation**
   - Value ranges for amounts
   - Date sequence validation
   - Required field presence
   - Cross-document consistency

## OCR Processing
1. **Primary Processing**
   - Google Vision API base processing
   - Confidence score calculation
   - Field extraction based on document type
   - Initial validation

2. **Enhanced Processing**
   - Multiple OCR service comparison
   - Cross-validation of results
   - User feedback integration
   - Continuous learning from corrections
