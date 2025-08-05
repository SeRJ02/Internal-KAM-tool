# Key Account Management Dashboard

A comprehensive internal dashboard for managing key accounts, tracking performance, and handling user queries.

## Features

- **User Authentication**: Role-based access control (Admin/Employee)
- **Performance Tracking**: Import and analyze Excel data for user performance
- **Call Management**: Track call records and complaint tags
- **User Queries**: Manage and categorize user complaints and queries
- **Retailer Tagging**: Tag users with their primary retailers
- **Analytics Dashboard**: Visualize data with charts and insights
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Data Processing**: XLSX for Excel file handling

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/key-account-management-dashboard.git
cd key-account-management-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Demo Accounts

### Admin Account (Full Access)
- **Username**: `admin`
- **Password**: `admin123`

### Employee Accounts (Limited Access)
- **Username**: `john.doe` | **Password**: `john123` (POC: John Doe)
- **Username**: `jane.smith` | **Password**: `jane123` (POC: Jane Smith)

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard container
│   ├── LoginPage.tsx    # Authentication page
│   ├── DataTable.tsx    # Performance data table
│   ├── Analytics/       # Analytics components
│   └── ...
├── styles/             # CSS files
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Features Overview

### 1. Dashboard
- Overview statistics
- Quick actions
- Recent activity

### 2. Performance Data
- Excel file import
- User performance tracking
- Call status management
- POC account matching

### 3. Analytics
- Interactive charts and graphs
- Complaint tag analysis
- Performance trends
- User activity insights

### 4. User Management
- Create branch accounts
- Role-based permissions
- User data visualization

### 5. Query Management
- User complaint tracking
- Status management (Open/In Progress/Resolved)
- Complaint categorization

### 6. Retailer Tagging
- Tag users with retailers
- Performance correlation analysis
- Retailer insights

## Data Storage

Currently uses localStorage for data persistence. Data includes:
- Excel performance data
- Call records
- User queries
- Retailer tags
- Branch accounts

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact the development team.