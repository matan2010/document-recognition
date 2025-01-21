# Document Recognition System - UI Specification

## Overview
A modern document management platform that enables companies to efficiently handle document processing, client management, and automated data extraction.

## Core Screens

### 1. Dashboard
- **Header (Top Bar)**:
  - Left: Company logo
  - Center: Global search bar with filters dropdown
  - Right: Notifications bell icon + User profile dropdown
- **Stats Cards (Top Row)**:
  - Total Documents Card (with trend indicator)
  - Documents Processed Today
  - Pending Documents
  - Success Rate
  - Each card: Big number + icon + small trend percentage
- **Recent Activity Feed (Middle Left)**:
  - Timeline style list
  - Each item: User avatar + action + document name + time
  - Color-coded by activity type (upload, process, share)
- **Quick Access Documents (Middle Right)**:
  - Grid of 6-8 recent documents
  - Thumbnail preview
  - Hover actions (view, download)
- **Notifications Panel (Right Sidebar)**:
  - Categorized notifications (New, Processing, Completed)
  - Clear All button
  - Mark as Read functionality

### 2. Document Upload & Management
- **Upload Area**:
  - Large centered drop zone when empty
  - Animated border on drag
  - Progress bar during upload
  - Multi-file upload support
- **View Controls**:
  - Toggle between grid/list view
  - Sort options (date, name, status)
  - Filter by client/type/status
- **Document Cards**:
  - Large thumbnail preview
  - Status badge (color-coded)
  - Client name with avatar
  - Upload date and time
  - Quick action buttons on hover
- **Processing Status**:
  - Progress indicator
  - Estimated time remaining
  - Cancel option
  - Error handling display

### 3. Client Management
- **List/Grid Toggle**:
  - List: More detailed view
  - Grid: Quick visual overview
- **Client Cards**:
  - Company logo/avatar
  - Client name (bold)
  - Unique ID (monospace font)
  - Total documents count with icon
  - Last activity timestamp
  - Status indicator (active/inactive)
- **Add Client**:
  - Prominent '+' button top-right
  - Quick add form
  - Detailed add option
- **Search & Filter**:
  - Search by name/ID
  - Filter by activity/status
  - Sort by various fields

### 4. Document Viewer
- **Split Screen**:
  - Left (60%): Document preview
    * Zoom controls
    * Page navigation
    * Rotate options
  - Right (40%): Extracted info
    * Tabbed interface for different data types
    * Edit/Confirm extracted data
    * Confidence scores
- **Action Bar (Top)**:
  - Download original
  - Download processed
  - Share button (generates link)
  - Print option
  - Process again
- **Metadata Panel**:
  - Document properties
  - Processing history
  - Related documents
  - Client information

### 5. Authentication Screens
- **Login Page**:
  - Clean, centered design
  - Company logo at top
  - Login form:
    * Email/Username field
    * Password field with show/hide toggle
    * "Remember me" checkbox
    * "Forgot password?" link
  - Login button (full width)
  - "Sign up your company" link below
  - OAuth options (if applicable)
  - Error messages handling

- **Sign Up Flow**:
  - Step 1: Company Information
    * Company name
    * Industry dropdown
    * Company size
    * Business email
    * Phone number
  - Step 2: Admin Account
    * Full name
    * Email
    * Password with strength indicator
    * Confirm password
  - Step 3: Verification
    * Email verification code
    * Phone verification (optional)
  - Step 4: Welcome screen
    * Quick start guide
    * Setup checklist

### 6. Company Settings
- **Company Profile**:
  - Company logo upload
  - Company details:
    * Name
    * Address
    * Contact information
    * Industry
    * Website
  - Billing information
  - Subscription plan details

- **User Management**:
  - Users list/grid:
    * User avatar
    * Name
    * Role
    * Status (active/inactive)
    * Last login
  - Add user button
  - Role management:
    * Create/edit roles
    * Permission settings
    * Access control matrix

- **Preferences**:
  - Document processing settings:
    * Default OCR settings
    * Auto-processing rules
    * Notification preferences
  - Display preferences:
    * Default view modes
    * Language settings
    * Date/time format
  - Integration settings:
    * API keys
    * Webhook configurations
    * Third-party connections

- **Branding**:
  - Custom color scheme
  - Logo placement options
  - Email template customization
  - Document template settings

## Design Guidelines
- Modern, clean interface
- Professional but not boring
- Ample white space
- Light shadows for depth
- Simple, consistent icons
- Responsive design for all screen sizes
- Clear typography hierarchy
- Intuitive navigation
- Consistent action button placement
- Clear feedback for all user actions

## Inspiration
- Google Drive (document management)
- Dropbox (file organization)
- Notion (clean, modern UI)
