# Class Access

<p align="center">
  <a href="https://classaccess.tech" >
    <img src="https://classaccess.tech/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo2.5fc48551.png&w=256&q=75" alt="Class Access Logo" width="120"/>
  </a>
</p>

<p align="center">
  <img src="https://img.icons8.com/color/48/nextjs.png" alt="Next.js" title="Next.js" hspace="5"/>
  <img src="https://img.icons8.com/officel/48/react.png" alt="React" title="React" hspace="5"/>
  <img src="https://img.icons8.com/fluency/48/supabase.png" alt="Supabase" title="Supabase" hspace="5"/>
  <img src="https://img.icons8.com/color/48/postgreesql.png" alt="PostgreSQL" title="PostgreSQL" hspace="5"/>
  <img src="https://img.icons8.com/color/48/tailwindcss.png" alt="Tailwind CSS" title="Tailwind CSS" hspace="5"/>
  <img src="https://img.icons8.com/color/48/google-meet.png" alt="Google Meet" title="Google Meet" hspace="5"/>
  <img src="https://img.icons8.com/fluency/48/zoom.png" alt="Zoom" title="Zoom" hspace="5"/>
</p>

Class Access is a comprehensive digital solution designed to help teaching academies and individual tutors manage their classes, students, payments, attendance, and communications efficiently, all in one place. This platform aims to streamline administrative tasks, allowing educators to focus more on teaching.

## Table of Contents
1.  [Tech Stack & Architecture](#tech-stack--architecture)
2.  [Technical Features & Learning Experiences](#technical-features--learning-experiences)
3.  [Core Features](#core-features)
4.  [Database Schema & Row Level Security](#database-schema--row-level-security)
5.  [Getting Started](#getting-started)
6.  [Deploy on Vercel](#deploy-on-vercel)
7.  [Contact](#contact)

## <a name="tech-stack--architecture"></a><img src="https://img.icons8.com/fluency/48/gear.png" width="30" height="30" alt="Tech Stack Icon"/> Tech Stack & Architecture

Class Access is built using a modern, robust, and scalable technology stack:

### Core Framework & Language:
* **Next.js 14**: Utilized as a full-stack React framework, leveraging features like the App Router for server and client components, API routes for backend logic, server-side rendering (SSR), and static site generation (SSG) where applicable, ensuring optimal performance and SEO.
* **React 18**: The core library for building a declarative, component-based, and interactive user interface. Employs functional components and React Hooks (e.g., `useState`, `useEffect`, `useContext`, custom hooks) for state management and side effects.
* **JavaScript (ES6+) & JSX**: The primary programming language for frontend and backend logic, utilizing modern JavaScript features and JSX syntax for React components.

### Backend & Database:
* **Supabase**: A comprehensive Backend-as-a-Service (BaaS) platform providing:
    * **PostgreSQL Database**: A powerful open-source relational database for storing all application data, including user profiles, class information, student records, attendance, payments, and invoices. Leverages Supabase's managed PostgreSQL offering with built-in extensions.
    * **Authentication**: Supabase Auth handles secure user sign-up, login (email/password), and OAuth 2.0 integration with providers like Google and Zoom. Manages JWT sessions and user identities.
    * **Storage**: (If used, e.g., for profile pictures or uploaded documents - not explicitly detailed in provided files but a common Supabase feature).
    * **Realtime**: (If used, e.g., for live updates - not explicitly detailed but available).
    * **Edge Functions**: (If used for serverless functions - not explicitly detailed but available).
    * **Admin SDK**: Utilized within Next.js API routes for performing privileged database operations and administrative tasks that require bypassing Row Level Security (RLS), using the `SUPABASE_SERVICE_KEY`.
* **Next.js API Routes**: Serve as the backend endpoints for custom business logic, data validation, secure interaction with the Supabase database (often using the Admin SDK), and orchestrating calls to third-party services.

### Styling & UI/UX:
* **Tailwind CSS**: A utility-first CSS framework enabling rapid UI development, responsive design, and a consistent styling system through pre-defined utility classes. Configured via `tailwind.config.js`.
* **Shadcn/ui**: A collection of re-usable, accessible, and aesthetically pleasing UI components built on top of Radix UI and styled with Tailwind CSS. Key components used include `Button`, `Dialog`, `Card`, `Table`, `Input`, `Select`, `Toast`, `Calendar`, `Popover`, `DropdownMenu`, `Checkbox`, `Avatar`, `Badge`, `Textarea`, `Separator`, `ScrollArea`, and `RadioGroup`.
* **Framer Motion**: A React animation library used to create fluid transitions, micro-interactions, and engaging user experiences throughout the application, particularly on the landing page and for UI element state changes.
* **Lucide React**: Provides a comprehensive library of clean, consistent, and customizable SVG icons used across the application to enhance visual communication.

### Integrations & Services:
* **Email Delivery**:
    * **Brevo (formerly Sendinblue)**: Integrated via its REST API for sending various transactional emails, including welcome messages, account activation links, password reset instructions, invoices, and attendance reports with PDF attachments.
* **Video Conferencing Platforms**:
    * **Google Meet**: Integrated using the Google Calendar API and Google OAuth 2.0. Allows teachers to authenticate their Google account and give the app permissions to dynamically generate unique Google Meet links for their classes.
    * **Zoom**: Integrated using the Zoom API and OAuth 2.0. Enables teachers to connect their Zoom accounts, create meeting links, and manage API access/refresh tokens securely.
* **Payment Processing**:
    * **UPI (Unified Payments Interface)**: Facilitates payments by generating UPI QR codes (using `qrcode.react`) and constructing UPI intent URLs. This allows students to make direct payments using their preferred UPI apps.
* **PDF Generation**:
    * **@react-pdf/renderer**: A React library used for generating PDF documents on the client-side. Implemented for creating professional-looking attendance reports and invoices that can be downloaded or emailed.
* **Security & Authentication**:
    * **JWT (JSON Web Tokens)**: Handled by Supabase Auth for user sessions. Custom JWT verification (`jsonwebtoken` library) is implemented in API routes to protect endpoints and authorize requests.
    * **Cryptr**: A library used for symmetric encryption/decryption of sensitive data, specifically for securing third-party OAuth tokens (Google, Zoom) before they are stored in the database.
* **Phone Number Utilities**:
    * **`libphonenumber-js`**: Used within the custom `PhoneInput` component for parsing, formatting, and validating international phone numbers, enhancing data quality for user profiles.
* **Date & Time Management**:
    * **`date-fns`**: Utilized for date formatting and manipulation, particularly in UI components like calendars and date pickers.
    * **`moment-timezone`**: Employed for handling complex timezone conversions and date/time calculations, essential for scheduling classes across different timezones and for backend processes like cron jobs.

### Development & Operations:
* **Vercel**: The primary platform for deployment, continuous integration/continuous deployment (CI/CD), global hosting, and managing serverless cron jobs (defined in `vercel.json`) for scheduled backend tasks.
* **ESLint**: Configured with `next/core-web-vitals` preset for static code analysis, enforcing code style, and identifying potential errors to maintain high code quality.
* **Custom Utilities**:
    * `fetchTimeout`: A custom wrapper around the native `fetch` API to implement request timeouts, preventing indefinite hangs and improving application resilience when dealing with external services.
* **HTTP Client**:
    * **Axios**: A promise-based HTTP client used for certain backend API interactions, particularly for handling the Zoom OAuth token exchange and API calls due to its features like automatic JSON data transformation and error handling.
* **Analytics & Monitoring**:
    * **Vercel Analytics & Speed Insights**: Built-in Vercel tools for monitoring website traffic, performance metrics, and Core Web Vitals.
    * **Umami**: A self-hostable or cloud-based privacy-focused web analytics solution used for tracking user interactions and site usage.
    * **Microsoft Clarity**: A user behavior analytics tool providing heatmaps, session recordings, and insights into how users interact with the application, aiding in UI/UX improvements.

---

## <a name="technical-features--learning-experiences"></a><img src="https://img.icons8.com/fluency/48/developer-mode.png" width="30" height="30" alt="Learning Icon"/> Technical Features & Learning Experiences

This project showcases the implementation of various advanced web development concepts and features, demonstrating proficiency in full-stack development and system design:

* **Full-Stack Application Development with Next.js & Supabase:**
    * **Accomplishment:** Architected and developed a multi-functional platform for educational institutions, seamlessly integrating a React-based frontend (Next.js App Router) with a robust backend (Next.js API Routes) and a Supabase BaaS.
    * **Skills Demonstrated & Learnings:**
        * **Database Design & Management:** Designed and implemented a normalized PostgreSQL schema on Supabase, modeling complex relationships between teachers, students, classes, attendance, payments, and invoices. Utilized JSONB fields for flexible data structures like `classes_left` and `status` per class.
        * **Frontend Development:** Built responsive, interactive, and component-driven user interfaces using React 18, functional components, and advanced Hook patterns. Leveraged Shadcn/ui and Tailwind CSS for rapid and consistent UI development.
        * **Backend Development:** Developed secure and efficient server-side logic using Next.js API Routes to handle business operations, data validation, and communication with Supabase (utilizing the Admin SDK for privileged actions).
        * **Next.js Mastery:** Gained in-depth experience with Next.js features including Server Components, Client Components, file-system routing, dynamic routing, and various data fetching strategies (SSR, CSR, and server actions if applicable).
        * **Supabase Integration:** Proficiently used Supabase client libraries for CRUD operations, user authentication, and managing database interactions from both client and server, including implementing Row Level Security.

* **Advanced Third-Party API Integration & Secure OAuth 2.0 Management:**
    * **Accomplishment:** Integrated Google Meet, Zoom, and Brevo APIs to provide core functionalities like video conferencing and automated email communications.
    * **Skills Demonstrated & Learnings:**
        * **OAuth 2.0 Implementation:** Successfully implemented the Authorization Code Grant flow for Google and Zoom, including handling OAuth callbacks, securely exchanging authorization codes for access and refresh tokens, and managing token lifecycles.
        * **Secure Token Management:** Engineered a secure system for storing sensitive OAuth tokens by encrypting them using `Cryptr` before database persistence and decrypting them on demand for API calls, significantly enhancing security.
        * **Token Refresh Strategy:** Implemented logic to automatically refresh expired access tokens for Google and Zoom using their respective refresh tokens, ensuring uninterrupted service.
        * **Transactional Email Service Integration:** Leveraged Brevo's API to send various types of automated emails (welcome, account activation, password resets, invoices, attendance reports), including dynamic content and PDF attachments.

* **Robust Authentication, Authorization & User Lifecycle Management:**
    * **Accomplishment:** Developed a comprehensive user authentication system supporting multiple roles (teacher, student) and secure access control through Supabase Auth and custom JWT verification.
    * **Skills Demonstrated & Learnings:**
        * **Multi-Factor Authentication (if applicable) & OAuth:** Utilized Supabase Auth for core email/password authentication and integrated Google OAuth for teacher sign-in.
        * **Custom User Flows:** Designed and implemented complete user lifecycle management, including account activation via email, secure password reset mechanisms, and linking external OAuth identities to user accounts.
        * **API Security (JWT):** Secured all custom API endpoints by implementing JWT verification middleware, ensuring that only authenticated and authorized users can access protected resources.

* **Automation through Scheduled Tasks & Cron Jobs:**
    * **Accomplishment:** Implemented automated daily email reminders for teachers regarding their upcoming class schedules using Vercel Cron Jobs.
    * **Skills Demonstrated & Learnings:**
        * **Serverless Scheduling:** Configured and deployed cron jobs using Vercel's infrastructure (`vercel.json`) to trigger specific Next.js API routes at predefined intervals.
        * **Timezone-Aware Logic:** Utilized `moment-timezone` for accurate date and time calculations, ensuring cron jobs and notifications respect user/teacher timezones.
        * **Background Task Processing:** Developed backend logic within API routes to fetch necessary data, process it (e.g., filter classes for the next day), and trigger email notifications.

* **Dynamic Document Generation (PDFs) & Client-Side Processing:**
    * **Accomplishment:** Enabled users to generate and download/email professional PDF documents for student attendance summaries and financial invoices.
    * **Skills Demonstrated & Learnings:**
        * **Client-Side PDF Rendering:** Employed `@react-pdf/renderer` to construct PDF documents using React components, allowing for dynamic data injection and complex layouts directly in the browser.
        * **Blob & Base64 Handling:** Managed PDF output as Blobs, converted them to Base64 strings for efficient transmission as email attachments via API calls.

* **Complex UI/UX Implementation & Advanced State Management:**
    * **Accomplishment:** Created a feature-rich and intuitive user interface for managing all aspects of a teaching academy, focusing on ease of use and clear information presentation.
    * **Skills Demonstrated & Learnings:**
        * **Advanced React Patterns:** Proficient use of React Hooks (`useState`, `useEffect`, `useContext`, `useRef`, custom hooks) for managing complex local and global UI state, side effects, and component lifecycle.
        * **Interactive Components:** Developed highly interactive components such as a dynamic attendance calendar, multi-step dialogs for class creation with conditional logic, and sortable/filterable data tables.
        * **Custom Form Controls:** Engineered custom input components like `PhoneInput` incorporating `libphonenumber-js` for validation and formatting, and `useStateHistory` for undo/redo functionality in inputs.
        * **UI Libraries & Styling:** Leveraged Shadcn/ui and Tailwind CSS to build a consistent, responsive, and accessible design system.
        * **Animations:** Enhanced user experience with subtle and meaningful animations using Framer Motion.

* **Sophisticated Database Schema Design & Data Integrity:**
    * **Accomplishment:** Designed a normalized and efficient PostgreSQL database schema within Supabase, capable of handling complex relationships and varied data types while prioritizing data privacy.
    * **Skills Demonstrated & Learnings:**
        * **Relational Data Modeling:** Structured tables to represent entities and their relationships (e.g., many-to-many relationships between students and classes managed via the `student_proxies` table).
        * **JSONB for Flexibility:** Utilized PostgreSQL's JSONB data type for fields like `classes_left` and `status` in the `student_proxies` table, allowing for flexible key-value storage within a relational structure.
        * **Data Integrity & Consistency:** Ensured data consistency through appropriate use of foreign keys, unique constraints, and transactional updates where necessary (e.g., updating `classes_left` when attendance is marked).
        * **Row Level Security (RLS):** Implemented granular RLS policies in Supabase to enforce data access rules, ensuring users can only access data they are authorized to see (detailed further in the "Database Schema & Row Level Security" section).

* **Resilient API Development & Comprehensive Error Handling:**
    * **Accomplishment:** Built a suite of Next.js API routes that are robust, secure, and provide clear feedback for various application operations.
    * **Skills Demonstrated & Learnings:**
        * **RESTful API Design:** Designed API endpoints following REST principles for clarity and predictability.
        * **Input Validation & Error Handling:** Implemented thorough input validation on API routes and comprehensive error handling, returning meaningful HTTP status codes and error messages to the client.
        * **Asynchronous Operations Management:** Proficiently used `async/await` for managing asynchronous operations. Developed and used a `fetchTimeout` utility to prevent indefinite hangs when calling external services, improving application stability.
        * **User Feedback Mechanisms:** Integrated a toast notification system (`useToast`) to provide users with clear feedback on the success or failure of their actions.

---

## <a name="core-features"></a><img src="https://img.icons8.com/fluency/48/classroom.png" width="30" height="30" alt="Features Icon"/> Core Features

Class Access offers a robust set of features to streamline the management of teaching academies:

* **👤 User Authentication & Management:**
    * Secure sign-up and login for teachers and students (email/password).
    * Password reset functionality via secure email links.
    * Student account activation workflow with email verification.
    * Google OAuth 2.0 for teacher login, simplifying access and enabling Google service integrations.
* **🏫 Class & Schedule Management:**
    * Teachers can create, view, edit, and manage classes with details like name, description, recurring days, and specific start/end times (timezone aware).
    * Dynamic generation of meeting links via Google Meet and Zoom API integrations, or marking classes as "In-Person".
    * Shareable class enrollment and direct join links for students.
* **🎓 Student Administration & Enrollment:**
    * Teachers can add new students (creating accounts if necessary) or enroll existing students into their classes.
    * Streamlined student enrollment process using unique, randomly generated class codes.
    * Accurate tracking of each student's remaining paid classes for each course.
    * Student "proxy" system allows students to be associated with multiple teachers/classes with distinct attributes (notes, classes left) for each association.
* **📊 Attendance Tracking & Reporting:**
    * Digital attendance marking (Present/Absent) for students in each class session.
    * Support for both individual student attendance views and group/batch attendance marking.
    * Interactive calendar interface for viewing and modifying individual student attendance.
    * Automated generation and emailing of PDF attendance reports to students/parents.
* **💳 Payments & Invoicing System:**
    * Teachers can create and send detailed invoices to students via email.
    * Students can view invoices and make payments using UPI through a generated QR code on a dedicated payment page.
    * Teachers can manually record payments received through various methods (Cash, Bank Transfer, etc.).
    * Invoice status tracking (Pending, Student Confirmed, Paid) with automated updates.
    * PDF invoice generation for record-keeping and sharing.
* **✉️ Automated Communications & Notifications:**
    * Automated welcome emails for newly registered students with account activation links.
    * Automated class enrollment invitation emails to students.
    * Daily cron job sends email reminders to teachers about their classes scheduled for the next day.
* **🖥️ Teacher Dashboard & Analytics:**
    * Centralized dashboard for teachers to view their scheduled classes, manage student enrollments, and access key functionalities.
    * Comprehensive student listing page with details on enrollment status and remaining classes.
    * System-level tracking of overall payment volume and number of payments processed.
* **🌐 Public-Facing & Informational Pages:**
    * Engaging landing page showcasing platform features and benefits.
    * A "How-To" guide for students detailing the account creation and class enrollment process.
    * Dedicated pages for Privacy Policy and Terms of Use.

---

## <a name="database-schema--row-level-security"></a><img src="https://img.icons8.com/fluency/48/database.png" width="30" height="30" alt="Database Icon"/> Database Schema & Row Level Security

Class Access utilizes **Supabase** (PostgreSQL) for its database. The schema is designed to support the application's features efficiently while prioritizing data privacy through Row Level Security (RLS).

![supabase-schema-jzauydoaasxvajwzfupq](https://github.com/user-attachments/assets/b6332091-9f68-4b11-842b-fc4808a7a23f)


[Link to Database Schema Diagram](https://drawsql.app/teams/vikrams-team-1/diagrams/class-access)


### Key Tables Overview:

* **`teachers`**: Stores teacher profiles and configurations.
* **`students`**: Core student profiles (universal student identity, `id` is `auth.uid()`).
* **`student_proxies`**: Links students to teachers/classes. This is the primary table teachers interact with regarding student data for *their* classes. It contains `id` (unique proxy ID), `student_id` (FK to `students.id`), `teacher_id` (FK to `teachers.id`), and class-specific attributes like `classes_left` (JSONB), `status` (JSONB), `notes`, `email`, `first_name`, `last_name`, `phone`, `hasJoined`.
* **`classes`**: Defines class details, schedules, and an array of `student_proxy_ids` for enrolled students.
* **`attendance_records`**: Logs student attendance, linked via `student_proxy_id`.
* **`invoices`**: Manages financial invoices, linked via `student_proxy_id`.
* **`payments`**: Records all payment transactions, linked via `student_proxy_id`.
* **`statistics`**: Tracks aggregate platform data.
* **`google_tokens` / `zoom_tokens`**: Securely store encrypted OAuth tokens for teachers, linked via `user_id` (which is `teachers.id`).

### Row Level Security (RLS) Implementation & Key Security Decision:

Supabase's Row Level Security is integral to Class Access's data protection strategy. Policies are meticulously crafted for each table to ensure users can only access and modify data they are explicitly authorized for.

* **Core RLS Principle:** Data access is scoped to the authenticated user's role (`teacher` or `student`) and their unique ID (`auth.uid()`).
* **Teacher Data Access:** Teachers can generally `SELECT`, `INSERT`, `UPDATE`, `DELETE` data related to their own profile, the classes they own (`teacher_id = auth.uid()`), and the `student_proxies` associated with their `teacher_id`.
* **Student Data Access:** Students can `SELECT` and `UPDATE` their own core profile in the `students` table (`auth.uid() = id`). They can `SELECT` `student_proxies` where `student_id = auth.uid()` to see their enrollments across different teachers/classes. Access to class details, attendance, and invoices is typically granted if their `student_proxy_id` is associated with the respective records.

* **Critical Security & Privacy Design: `student_id` vs. `student_proxy_id`**
    * A fundamental architectural decision for enhancing student privacy and enabling flexible enrollments is the distinction between a student's universal identity (`students.id`) and their contextual representation within a specific teacher's domain (`student_proxies.id`).
    * **Teachers interact primarily with `student_proxy_id`s.** When a teacher manages their roster, adds a student to a class, or views student-specific information for their courses, they are operating on `student_proxy` records. RLS policies on `student_proxies` are generally scoped such that a teacher can only access proxies where `teacher_id = auth.uid()`.
    * **Controlled Visibility of Student Information:** This design ensures that a teacher ("Teacher A") does not have automatic access to a student's universal profile in the `students` table or their interactions with another teacher ("Teacher B"). Teacher A's view is limited to the information pertinent to their relationship with the student, as stored in the `student_proxy` record they manage. Personal details like the student's full name and phone number within the `student_proxies` table are populated only after the student activates their account and consents to share this information in the context of that teacher's class (e.g., via the `/api/students/update_proxy` endpoint after student activation).
    * **Student Onboarding & Data Control:**
        1. When a teacher invites a student (e.g., by email to a new class), a `student_proxy` record is created. This proxy might initially contain only the student's email (as provided by the teacher) and a link to the teacher and class. The student's core `students` table record might not yet exist or might not be fully populated.
        2. The student receives an activation email. Upon clicking the activation link and setting up their password/profile (or logging into an existing core `students` account), their universal `students` record (`id`, `first_name`, `last_name`, `phone`) is created/updated.
        3. The `student_proxies.hasJoined` flag is set to true, and details like `first_name`, `last_name`, and `phone` can be populated into the `student_proxies` record for that specific teacher's view, based on the student's core profile. This ensures the teacher has the necessary contact information for the students *they teach*, but only after the student has engaged with the platform.
    * **Benefits of this Approach:**
        * **Enhanced Student Privacy:** A student's activities, notes, or class balance with one teacher are not visible to other teachers they might also be learning from on the platform. Each teacher's view is siloed to their specific `student_proxies`.
        * **Facilitates Multi-Teacher/Multi-Class Enrollment:** Students can maintain a single, central user account (`students` table) while enrolling in diverse classes offered by different teachers. Each such enrollment is managed through a distinct `student_proxy` record, ensuring clear separation of data and context without data duplication in the core student profile.
        * **Granular Access Control:** RLS policies can be more effectively applied, as teacher access is primarily governed by their ownership of `student_proxy` records rather than direct access to all student data.

* **API Routes & Admin SDK for Privileged Operations:**
    * For operations requiring broader data access or complex logic that cannot be easily expressed in RLS policies (e.g., initial student account creation triggered by a teacher's invitation, or system-wide administrative tasks), Next.js API routes are utilized.
    * These API routes first authenticate the calling user by verifying their JWT. If authorized, these routes can then use the `SUPABASE_SERVICE_KEY` (via the Supabase Admin SDK) to perform database operations. This temporarily bypasses RLS with full administrative privileges for that specific, controlled, and audited server-side action. This is essential for tasks like creating a new user in the `auth.users` table and then linking them to the `students` and `student_proxies` tables.

**(You should elaborate here with more specific RLS policy examples for each critical table if you wish, e.g., `CREATE POLICY "Teachers can view their own student proxies" ON student_proxies FOR SELECT USING (auth.uid() = teacher_id);` and `CREATE POLICY "Students can view their own proxy records" ON student_proxies FOR SELECT USING (auth.uid() = student_id);`)**

---

## <a name="getting-started"></a><img src="https://img.icons8.com/fluency/48/rocket.png" width="30" height="30" alt="Getting Started Icon"/> Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18.17.0 or later)
* A package manager: npm, yarn, pnpm, or bun
* A Supabase account and project.
* API keys for Brevo, Google Cloud Platform (for Calendar API), and Zoom Marketplace.

### Installation & Running

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/sreevikramr/class-access.git
    cd class-access
    ```

2.  **Install Dependencies:**
    Choose your preferred package manager:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Set Up Environment Variables:**
    Create a `.env.local` file in the project root. Populate it with your specific keys and secrets:
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_public_anon_key
    SUPABASE_SERVICE_KEY=your_supabase_service_role_key # For backend operations

    # Authentication & Security
    JWT_SECRET=your_strong_and_unique_jwt_secret
    ENCRYPTION_SECRET=your_very_strong_secret_for_encrypting_tokens_min_32_chars

    # Email Service (Brevo)
    EMAIL_TOKEN=your_brevo_api_key

    # Google OAuth & APIs
    GOOGLE_CLIENT_ID=your_google_oauth_client_id
    GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
    # Ensure Google Calendar API is enabled for your project in Google Cloud Console.
    # Set up OAuth consent screen and add `https://classaccess.tech/oauth/google/teacher_login` (or your local equivalent during dev) as an authorized redirect URI.

    # Zoom OAuth & APIs
    ZOOM_CLIENT_ID=your_zoom_oauth_app_client_id
    ZOOM_CLIENT_SECRET=your_zoom_oauth_app_client_secret
    # Add `https://classaccess.tech/oauth/zoom/callback` (or your local equivalent) as an authorized redirect URI in your Zoom App Marketplace settings.

    # Cron Job Security (for Vercel cron jobs)
    CRON_SECRET=your_secret_for_securing_cron_endpoints
    ```
    **Important Security Notes:**
    * All variables except those prefixed with `NEXT_PUBLIC_` are server-side only and must be kept confidential.
    * The `ENCRYPTION_SECRET` is critical for securing stored OAuth tokens. Ensure it's strong and unique.

4.  **Set up Supabase Database Schema:**
    You will need to set up the tables and relationships in your Supabase project as described in the "Database Schema" section. This can be done via the Supabase Studio UI or by writing SQL migration scripts. Implement Row Level Security policies as outlined.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```
    The application will typically be available at [http://localhost:3000](http://localhost:3000).

You can begin development by modifying files within the `app/` directory. Next.js provides hot module reloading for a seamless development experience.

---

## Deploy on Vercel

The simplest way to deploy your Class Access application is using the **Vercel Platform**, created by the team behind Next.js.

1.  Ensure your project is pushed to a Git repository (GitHub, GitLab, Bitbucket).
2.  Sign up or log in to [Vercel](https://vercel.com).
3.  Import your Git repository.
4.  Configure your environment variables in the Vercel project settings (as listed in the `.env.local` section).
5.  Configure cron jobs in `vercel.json` for scheduled tasks like daily emails.
6.  Deploy!

For detailed deployment instructions, refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

---

## <a name="contact"></a><img src="https://img.icons8.com/fluency/48/contacts.png" width="30" height="30" alt="Contact Icon"/> Contact

Sreevikram R - [sreevikram.r@gmail.com](mailto:sreevikram.r@gmail.com)

Co-Developer - Meet Gamdha - [gamdhameet@gmail.com](mailto:gamdhameet@gmail.com)

Project Link: [https://github.com/sreevikramr/class-access](https://github.com/sreevikramr/class-access)
