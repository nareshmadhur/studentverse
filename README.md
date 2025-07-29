# StudentVerse - Student Management System

This is a Next.js application built with Firebase Studio for managing students, classes, fees, and payments for an independent tutor or a small educational institution.

## Tech Stack

- **Framework**: Next.js (with App Router)
- **UI**: React, ShadCN UI Components, Tailwind CSS
- **Database**: Firestore
- **Authentication**: Firebase
- **AI**: Genkit (optional, for future integrations)
- **Deployment**: Firebase App Hosting

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

    The application will be available at [http://localhost:9002](http://localhost:9002).

## Securing Your Database

This application uses Firebase Authentication. To secure your Firestore database so that only logged-in users can access data, you need to deploy Firestore security rules.

A basic set of rules has been created in `firestore.rules`. To deploy them, you can either:

1.  **Use the Firebase CLI**:
    - Install the Firebase CLI if you haven't already: `npm install -g firebase-tools`
    - Login to your Firebase account: `firebase login`
    - Initialize Firebase in your project directory (if you haven't): `firebase init`
    - Deploy the rules: `firebase deploy --only firestore:rules`

2.  **Use the Firebase Console**:
    - Open your Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    - Go to the **Firestore Database** section.
    - Click on the **Rules** tab.
    - Copy the contents of the `firestore.rules` file from this project and paste them into the rules editor.
    - Click **Publish**.

## Firestore Data Model

The application uses Firestore to store its data. All collections use a `deleted: boolean` field for soft deletes. Timestamps are stored as ISO 8601 strings in the application state but are Firestore Timestamps in the database.

### `students` collection

Stores information about each student.

| Field        | Type                                    | Description                                |
| :----------- | :-------------------------------------- | :----------------------------------------- |
| `id`         | `string` (auto)                         | Unique Firestore document ID               |
| `name`         | `string`                                | Full name of the student                   |
| `email`        | `string`                                | Student's email address (must be unique)   |
| `phone`        | `string` (optional)                     | Student's phone number                     |
| `country`      | `string`                                | Student's country of residence             |
| `currencyCode` | `enum`                                  | Preferred currency (USD, INR, EUR, etc.)   |
| `createdAt`    | `timestamp`                             | Record creation timestamp                  |
| `updatedAt`    | `timestamp`                             | Record last update timestamp               |
| `deleted`      | `boolean`                               | Flag for soft deletes (default: `false`)   |

### `classes` collection

Stores details for each class or session scheduled.

| Field             | Type                                | Description                                       |
| :---------------- | :---------------------------------- | :------------------------------------------------ |
| `id`              | `string` (auto)                     | Unique Firestore document ID                      |
| `title`           | `string`                            | The title of the class (e.g., "Intro to Guitar")  |
| `discipline`      | `string`                            | Subject or skill area (e.g., "guitar", "vocals")  |
| `category`        | `string` (optional)                 | Broader category (e.g., "Music", "Art")           |
| `sessionType`     | `enum ('1-1', 'group')`             | Type of the session                               |
| `description`     | `string` (optional)                 | A detailed description of the class content       |
| `scheduledDate`   | `timestamp`                         | The date and time the class is scheduled for      |
| `durationMinutes` | `number`                            | Duration of the class in minutes                  |
| `location`        | `string` (optional)                 | Physical or virtual location of the class         |
| `students`        | `array` (of `string`)               | List of student IDs enrolled in the class         |
| `feeOverrides`    | `array` (of `object`) (optional)    | Student-specific fee adjustments for this class   |
| `createdAt`       | `timestamp`                         | Record creation timestamp                         |
| `updatedAt`       | `timestamp`                         | Record last update timestamp                      |
| `deleted`         | `boolean`                           | Flag for soft deletes (default: `false`)          |

### `fees` collection

Stores the fee structure, which can be general or student-specific.

| Field           | Type                                | Description                                       |
| :-------------- | :---------------------------------- | :------------------------------------------------ |
| `id`            | `string` (auto)                     | Unique Firestore document ID                      |
| `studentId`     | `string`                            | Reference to a student (`students` collection)    |
| `discipline`    | `string` (optional)                 | Subject the fee applies to (e.g., "guitar")       |
| `sessionType`   | `enum ('1-1', 'group')`             | Session type the fee applies to                   |
| `feeType`       | `enum ('hourly', 'subscription')`   | The billing model for this fee                    |
| `amount`        | `number`                            | The amount charged                                |
| `currencyCode`  | `enum`                              | Currency of the fee amount (USD, INR, etc.)       |
| `effectiveDate` | `timestamp`                         | Date from which this fee becomes effective        |
| `createdAt`     | `timestamp`                         | Record creation timestamp                         |
| `updatedAt`     | `timestamp`                         | Record last update timestamp                      |
| `deleted`       | `boolean`                           | Flag for soft deletes (default: `false`)          |

### `payments` collection

Stores a record of every payment received from a student.

| Field             | Type                  | Description                                       |
| :---------------- | :-------------------- | :------------------------------------------------ |
| `id`              | `string` (auto)       | Unique Firestore document ID                      |
| `studentId`       | `string`              | Reference to the student (`students` collection)  |
| `amount`          | `number`              | The amount paid by the student                    |
| `currencyCode`    | `enum`                | Currency of the payment (USD, INR, etc.)          |
| `transactionDate` | `timestamp`           | The date the payment was made                     |
| `paymentMethod`   | `string`              | Mode of payment (e.g., "Cash", "Card")            |
| `notes`           | `string` (optional)   | Any additional notes about the payment            |
| `createdAt`       | `timestamp`           | Record creation timestamp                         |
| `updatedAt`       | `timestamp`           | Record last update timestamp                      |
| `deleted`         | `boolean`             | Flag for soft deletes (default: `false`)          |
