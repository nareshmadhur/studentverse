
# Tutoraid - Your Personal Student Management System

Tutoraid is a modern, easy-to-use web application designed to help independent tutors and small educational institutions manage their students, classes, fees, and payments efficiently. Built with a professional tech stack, it provides a solid foundation that you can customize and expand.

## What Can You Do with Tutoraid?

- **Manage Students**: Keep a detailed record of all your students, including their contact information and preferred currency for billing.
- **Schedule Classes**: Organize your teaching schedule by creating and managing classes. You can specify the discipline (e.g., "Guitar," "Piano"), session type (1-on-1 or group), and assign students to each class.
- **Define Fee Structures**: Set up flexible fee structures for each student. You can define default hourly rates or create student-specific fees for different disciplines and session types.
- **Track Payments**: Log every payment received from students, making it easy to keep track of who has paid and when.
- **Generate Billing Statements**: Quickly generate professional billing statements for any student over any date range. The system automatically calculates charges based on attended classes and logs payments received.
- **Secure Access**: The application uses Firebase Authentication, ensuring that only you can access your data. Email verification is required for all new accounts.
- **Multi-Environment Data**: Manage separate data for `development`, `pre-prod`, and `production` environments within a single Firebase project, switchable from the Admin panel.

## Tech Stack

This application is built with modern, industry-standard technologies to ensure it is fast, reliable, and easy to maintain.

- **Framework**: Next.js (using the App Router for optimal performance)
- **UI**: React, ShadCN UI Components, and Tailwind CSS for a clean, modern, and responsive design.
- **Database**: Firestore (a flexible, scalable NoSQL database from Google).
- **Authentication**: Firebase Authentication for secure user sign-in.
- **Deployment**: Ready to be deployed on Firebase App Hosting.

## Getting Started: A Step-by-Step Guide

Follow these steps to get the application running on your local machine for development and testing.

### 1. Install Dependencies

First, you need to install all the necessary software packages for the project. Run the following command in your terminal:

```bash
npm install
```

### 2. Run the Development Server

Once the dependencies are installed, you can start the local development server:

```bash
npm run dev
```

The application will now be running and accessible at [http://localhost:9002](http://localhost:9002).

### 3. Configure Email Templates in Firebase

For new user sign-ups, the application will send a verification email. To ensure these emails are sent correctly and don't end up in spam folders, you should customize the email template in Firebase:
1.  Go to your project in the **Firebase Console**.
2.  Navigate to **Authentication** > **Templates** tab.
3.  Click on **Email verification** and customize the sender name and content.
4.  Click **Save**.

### 4. Understand the Multi-Environment Setup

The application is configured to support multiple data environments (`development`, `pre-prod`, `production`) within a single Firebase project. This is achieved by prefixing your Firestore collection names.
-   **Development data**: uses collections like `dev_students`, `dev_classes`, etc.
-   **Pre-Prod data**: uses collections like `pre-prod_students`, etc.
-   **Production data**: uses collections like `prod_students`, etc.

You can switch between these environments using the dropdown menu on the **Admin** page in the application.

#### **IMPORTANT: Data Migration Required**
If you have existing data in Firestore from before this multi-environment setup was added, that data will be in unprefixed collections (e.g., `students`). The app will no longer see this data.

You must migrate your data to the new prefixed collections. For example, to see your existing students in the development environment, you will need to copy or rename your `students` collection to `dev_students`. This is a one-time setup task.

### 5. Secure Your Database (Crucial Step!)

By default, your database is open to prevent lock-out during initial setup. You **must** secure it to protect your data.

A file named `firestore.rules` has been created in your project. This file contains rules that ensure only logged-in users can read or write data. You need to deploy these rules to Firebase.

**Option A: Use the Firebase CLI (Recommended)**

1.  **Install Firebase CLI**: If you don't have it, install it globally:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login to Firebase**:
    ```bash
    firebase login
    ```
3.  **Deploy the Rules**: Run the following command from your project's root directory:
    ```bash
    firebase deploy --only firestore:rules
    ```

**Option B: Use the Firebase Console (No-Code)**

1.  Open your project in the [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to **Firestore Database** from the left menu.
3.  Click the **Rules** tab at the top.
4.  Copy the entire content of the `firestore.rules` file from this project.
5.  Paste it into the rules editor in the Firebase Console, overwriting any existing rules.
6.  Click **Publish**.

Your database is now secure!
