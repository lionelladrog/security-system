# SafeWatch Attendance System - User Guide

A complete guide to using the SafeWatch Attendance Tracking System interface.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Staff](#managing-staff)
4. [Recording Attendance](#recording-attendance)
5. [Viewing Reports](#viewing-reports)
6. [Settings](#settings)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Logging In

1. **Open the application** in your browser at `http://localhost:3000`
2. You'll see the **Login Page** with the SafeWatch logo
3. **Choose one of two options:**

**Option 1: Manual Login**
   - Email: `admin@safewatch.com`
   - Password: `password123`
   - Click **"Sign In"**

**Option 2: Quick Login (Recommended for Demo)**
   - Click the **"Quick Login (Demo)"** button
   - Instantly access the dashboard

4. You'll be redirected to the **Dashboard**

**Demo Credentials:**
- Admin: `admin@safewatch.com` / `password123`
- Manager: `manager@safewatch.com` / `password123`

💡 **Note**: This is a frontend demo. All authentication is simulated with mock data.

---

## Dashboard Overview

After logging in, you'll see the main dashboard with several sections:

### 1. Navigation Sidebar (Left)

The sidebar contains the main navigation menu:

- **Dashboard** 📊 - Overview of attendance statistics and charts
- **Staff Attendance** 👥 - Manage staff members and their attendance
- **Reports** 📈 - View detailed reports and analytics
  - When clicked, expands to show:
    - **Attendance** - Detailed attendance reports
- **Settings** ⚙️ - Application settings and preferences

**User Profile Section (Bottom of Sidebar):**
- Shows your avatar with initials
- Displays your name and email
- **Logout** button to sign out

### 2. Dashboard Statistics Cards

The dashboard shows four key metrics at the top:

#### **Present Days** ✅
- **Shows**: Total number of staff marked as present
- **Color**: Green indicator
- **Format**: Number of present days / Total days

#### **Absent Days** ❌
- **Shows**: Total number of staff marked as absent
- **Color**: Red indicator
- **Format**: Number of absent days / Total days

#### **Late Arrivals** ⏰
- **Shows**: Total number of late check-ins
- **Color**: Orange indicator
- **Format**: Number of late arrivals / Total days

#### **Attendance Rate** 📅
- **Shows**: Overall attendance percentage
- **Color**: Blue indicator
- **Format**: Percentage based on current month
- **Calculation**: (Present days / Total days) × 100

### 3. Attendance Overview Chart

Below the statistics cards, you'll find the **Attendance Overview** chart:

- **Type**: Stacked bar chart
- **Shows**: Daily attendance distribution across all staff
- **Color Coding**:
  - 🟢 Green bars = Present
  - 🟡 Yellow bars = Late
  - 🔴 Red bars = Absent
- **Data Displayed**: Shows the last 7-14 days of attendance data
- **Hover**: Hover over bars to see detailed percentages and counts
- **Percentages**: Each bar segment shows the percentage of staff in that status

---

## Managing Staff

### Viewing Staff List

1. Click **"Staff Attendance"** in the sidebar
2. You'll see a table with all staff members and their recent attendance

**Staff Table Columns:**
- **Name** - Employee's full name
- **Employee ID** - Unique identifier
- **Site** - Assigned location
- **Email** - Contact email
- **Phone** - Contact phone number
- **Position** - Job title
- **Status** - Active/Inactive/On-Leave
- **Actions** - Edit or delete buttons

### Adding a New Staff Member

1. Navigate to **Staff Attendance**
2. Click the **"Add New Staff"** button (usually top-right)
3. Fill in the **Staff Information Form**:

   **Required Fields:**
   - **Employee ID** - Unique identifier (e.g., EMP001)
   - **First Name** - Employee's first name
   - **Last Name** - Employee's last name
   - **Email** - Valid email address
   - **Site** - Select from available sites

   **Optional Fields:**
   - **Phone** - Contact phone number
   - **Position** - Job title (e.g., Security Guard, Supervisor)
   - **Department** - Department name (e.g., Security, Admin)
   - **Hire Date** - Date of employment

4. Click **"Create Staff Member"** or **"Save"**
5. The new staff member will appear in the staff list
6. You'll see a success message confirming creation

**Tips:**
- Employee IDs must be unique
- Email addresses must be unique
- Use consistent naming format for sites
- Fill in all fields for complete records

### Editing Staff Information

1. In the **Staff Attendance** table, find the staff member
2. Click the **Edit** button (pencil icon) in the Actions column
3. The edit form will open with pre-filled data
4. Update the fields you want to change
5. Click **"Update"** or **"Save Changes"**
6. You'll see a success message

**What You Can Edit:**
- Name, email, phone
- Site assignment
- Position and department
- Employment status (Active/Inactive/On-Leave)

### Deactivating a Staff Member

1. Find the staff member in the list
2. Click the **Delete** or **Deactivate** button
3. Confirm the action in the dialog box
4. The staff member's status will change to "Inactive"

**Note**: Staff members are not permanently deleted - they're marked as inactive and can be reactivated later.

---

## Recording Attendance

### Viewing Today's Attendance

1. Go to **Staff Attendance**
2. The default view shows today's date
3. You'll see all active staff members with their attendance status

### Marking Attendance for a Staff Member

1. In the **Staff Attendance** section
2. Find the staff member's row
3. Click **"Mark Attendance"** or the status dropdown

**Choose a Status:**
- **Present** ✅ - Staff member is at work and on time
- **Late** ⏰ - Staff member arrived late
- **Absent** ❌ - Staff member did not show up
- **Half Day** 📅 - Staff member worked half shift
- **Leave** 🏖️ - Staff member is on approved leave

4. **Enter Time Details:**
   - **Check-In Time** - When they arrived (e.g., 09:00 AM)
   - **Check-Out Time** - When they left (e.g., 05:00 PM)
   - **Break Time** - Duration in minutes (e.g., 60)
   - **Hours Worked** - Automatically calculated or manual entry

5. **Additional Information (Optional):**
   - **Site** - Confirm or change the work location
   - **Travel Allowance** - Enter amount if applicable
   - **Notes** - Add any comments or reasons (e.g., "Traffic delay", "Medical appointment")

6. Click **"Save"** or **"Mark Attendance"**
7. The attendance will be recorded and visible in the table

### Editing Attendance Records

1. Find the attendance record in the table
2. Click the **Edit** button
3. Modify the fields:
   - Status
   - Check-in/check-out times
   - Hours worked
   - Notes
4. Click **"Update"**

### Viewing Attendance History

**Date Selector:**
- Use the **date picker** at the top of the Staff Attendance page
- Select any date to view that day's attendance
- Navigate between dates using arrows or calendar

**Filtering Options:**
- **By Site** - Filter to show only specific locations
- **By Status** - Show only present, absent, or late staff
- **By Name** - Search for specific staff members

---

## Viewing Reports

The Reports section provides detailed analytics and export capabilities.

### Accessing Reports

1. Click **"Reports"** in the sidebar
2. The submenu will expand
3. Click **"Attendance"** to view attendance reports

### Understanding the Reports Interface

**Filter Panel (Top Section):**

The reports page includes several filters to customize your view:

#### 1. **Date Range Filter**
- **Start Date** - Select the beginning of the period
- **End Date** - Select the end of the period
- **Quick Selections**:
  - Today
  - This Week
  - This Month
  - Last Month
  - Last 7 Days
  - Last 30 Days
  - Custom Range

#### 2. **Month Filter**
- Select a specific month (e.g., October 2025)
- Shows all attendance for that month

#### 3. **Site Filter**
- **All Sites** - Show data from all locations
- **Specific Site** - Filter by individual site (e.g., Main Office, North Branch)

#### 4. **Staff Name Filter**
- Search or select specific staff members
- Shows attendance for selected individuals only

### Generating Reports

**Steps:**
1. **Select Filters** - Choose date range, site, and/or staff
2. **Click "Apply Filters"** or **"Generate Report"**
3. The report table will update with filtered data

**Report Table Columns:**
- **Date** - Attendance date
- **Employee ID** - Staff identifier
- **Name** - Employee name
- **Site** - Work location
- **Status** - Present/Late/Absent/Leave
- **Check-In** - Arrival time
- **Check-Out** - Departure time
- **Hours** - Total hours worked
- **Notes** - Any comments or reasons

### Report Summary Statistics

Below or above the table, you'll see summary metrics:

- **Total Staff** - Number of employees in the report
- **Total Present Days** - Sum of all present days
- **Total Absent Days** - Sum of all absent days
- **Total Late Arrivals** - Count of late check-ins
- **Average Attendance Rate** - Overall percentage
- **Total Hours Worked** - Cumulative hours across all staff

### Exporting Reports

Reports can be exported in two formats:

#### **Excel Export** 📊
1. Click the **"Export to Excel"** button
2. A `.xlsx` file will download
3. Open in Microsoft Excel, Google Sheets, or compatible software

**Excel Export Includes:**
- All filtered attendance records
- Summary statistics
- Formatted tables
- Date headers

#### **PDF Export** 📄
1. Click the **"Export to PDF"** button
2. A PDF file will download
3. Professional formatted report ready for printing

**PDF Export Includes:**
- Company header with SafeWatch branding
- Date range and filter information
- Attendance table with all data
- Summary statistics
- Page numbers
- Generated date/time

### Report Views and Insights

**Monthly Summary View:**
- Shows each staff member's monthly totals
- Present days, absent days, late arrivals
- Total hours worked
- Attendance percentage per employee

**Site Comparison View:**
- Compare attendance rates across different sites
- Identify locations with attendance issues
- View total staff per site

**Staff Performance View:**
- Individual staff attendance history
- Trends over time
- Identify patterns (e.g., frequently late on Mondays)

**Low Attendance Alert:**
- Automatically highlights staff with < 80% attendance
- Shows staff needing attention
- Useful for HR follow-up

---

## Settings

### Accessing Settings

1. Click **"Settings"** in the sidebar
2. Configure application preferences

### Available Settings (If Implemented)

- **Profile Settings**
  - Update your name and email
  - Change password
  - Upload profile photo

- **Site Management**
  - Add new sites/locations
  - Edit site information
  - Deactivate sites

- **Notification Preferences**
  - Email notifications for absences
  - Daily attendance summary
  - Weekly reports

- **Display Settings**
  - Date format (MM/DD/YYYY or DD/MM/YYYY)
  - Time format (12-hour or 24-hour)
  - Theme (Light/Dark mode)

---

## Tips & Best Practices

### For Daily Attendance Tracking

1. **Mark attendance at start of shift**
   - Record check-ins as staff arrive
   - Update check-outs at end of day

2. **Use notes effectively**
   - Record reasons for lateness
   - Document approved absences
   - Add context for half-days

3. **Review daily**
   - Check for unmarked attendance
   - Verify all staff are accounted for
   - Correct any errors promptly

### For Staff Management

1. **Keep data current**
   - Update contact information regularly
   - Remove inactive staff
   - Maintain accurate site assignments

2. **Unique identifiers**
   - Use consistent Employee ID format (e.g., EMP001, EMP002)
   - Don't reuse Employee IDs

3. **Complete profiles**
   - Fill in all available fields
   - Include emergency contacts (if field available)
   - Keep hire dates accurate

### For Reporting

1. **Regular reports**
   - Generate weekly summaries
   - Monthly reports for management
   - Quarterly performance reviews

2. **Use filters effectively**
   - Start with broad filters, then narrow down
   - Compare same periods (month-to-month)
   - Filter by site for multi-location analysis

3. **Export and archive**
   - Export monthly reports for records
   - Save PDFs for compliance
   - Keep Excel files for further analysis

4. **Identify trends**
   - Look for patterns in absences
   - Monitor chronic lateness
   - Track seasonal variations

### For Data Accuracy

1. **Double-check entries**
   - Verify times are correct (AM/PM)
   - Ensure hours calculation is accurate
   - Confirm status matches reality

2. **Correct errors immediately**
   - Edit mistakes as soon as discovered
   - Add notes explaining corrections
   - Notify affected staff of changes

3. **Regular audits**
   - Review attendance records weekly
   - Cross-reference with payroll
   - Validate against security logs

---

## Common Tasks Quick Reference

| Task | Navigation | Button/Action |
|------|-----------|---------------|
| View today's stats | Dashboard | Auto-displayed on login |
| Add new staff | Staff Attendance | "Add New Staff" button |
| Mark today's attendance | Staff Attendance | Click on staff row → Mark Attendance |
| View specific date | Staff Attendance | Use date picker → Select date |
| Edit attendance | Staff Attendance | Edit button in record row |
| Generate monthly report | Reports → Attendance | Select month → Apply Filters |
| Export to Excel | Reports | "Export to Excel" button |
| Export to PDF | Reports | "Export to PDF" button |
| Change password | Settings | Profile → Change Password |
| Logout | Sidebar (bottom) | "Logout" button |

---

## Keyboard Shortcuts (If Implemented)

- **Ctrl/Cmd + K** - Open command palette
- **Ctrl/Cmd + D** - Go to Dashboard
- **Ctrl/Cmd + S** - Go to Staff Attendance
- **Ctrl/Cmd + R** - Go to Reports
- **Esc** - Close open dialogs
- **Tab** - Navigate through form fields

---

## Troubleshooting

### "Cannot save attendance"
- Check that all required fields are filled
- Verify date is not in the future
- Ensure check-out time is after check-in time

### "Staff not appearing in list"
- Check the staff status (may be inactive)
- Verify you're viewing the correct site
- Clear any active filters

### "Export not working"
- Ensure you have data to export
- Check browser pop-up blocker settings
- Try a different browser

### "Cannot see reports"
- Verify you have the correct permissions
- Check that there's data in the selected date range
- Apply filters and click "Generate Report"

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the documentation**
   - README.md - Technical setup
   - SETUP.md - Installation guide
   - db/README.md - Database information

2. **Contact support**
   - Email: support@safewatch.com
   - Submit a ticket through the Settings page

3. **Report bugs**
   - Include what you were doing
   - Attach screenshots if possible
   - Note the exact error message

---

## Appendix: Status Definitions

| Status | Icon | Description | When to Use |
|--------|------|-------------|-------------|
| Present | ✅ | On time and working | Staff arrived on time and completed shift |
| Late | ⏰ | Arrived after scheduled time | Staff arrived after shift start time |
| Absent | ❌ | Did not show up | Staff did not come to work |
| Half Day | 📅 | Partial shift | Staff worked only half of scheduled hours |
| Leave | 🏖️ | Approved time off | Pre-approved vacation, sick leave, etc. |

---

## Version Information

- **Guide Version**: 1.0.0
- **Application Version**: 1.0.0
- **Last Updated**: October 2025

---

**Happy Tracking!** 📊

For the latest updates and features, check the application's release notes.
