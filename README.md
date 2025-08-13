# StudentVerse - Your Personal Student Management System

StudentVerse is a modern, easy-to-use web application designed to help independent tutors and small educational institutions manage their students, classes, fees, and payments efficiently. Built with a professional tech stack, it provides a solid foundation that you can customize and expand.

## What Can You Do with StudentVerse?

- **Manage Students**: Keep a detailed record of all your students, including their contact information and preferred currency for billing.
- **Schedule Classes**: Organize your teaching schedule by creating and managing classes. You can specify the discipline (e.g., "Guitar," "Piano"), session type (1-on-1 or group), and assign students to each class.
- **Define Fee Structures**: Set up flexible fee structures for each student. You can define default hourly rates or create student-specific fees for different disciplines and session types.
- **Track Payments**: Log every payment received from students, making it easy to keep track of who has paid and when.
- **Generate Billing Statements**: Quickly generate professional billing statements for any student over any date range. The system automatically calculates charges based on attended classes and logs payments received.
- **Secure Access**: The application uses Firebase Authentication, ensuring that only you can access your data.

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

### 3. Secure Your Database (Crucial Step!)

By default, your database is open to prevent lock-out during initial setup. You **must** secure it to protect your data.

**How to Secure It:**

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
