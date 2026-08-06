# 👗 Easy Fashion Limited

## Software Engineer Technical Assessment — Software Requirements Specification

---

> ⏰ **Submission Deadline:** `07 August 2026, 11:59 PM`

---

## 📋 1. Assessment Overview

Develop a modern, responsive **Fashion E-Commerce application** along with a secure **Management Dashboard**.

This assessment evaluates:

- 🏗️ Backend architecture
- 🎨 Frontend development
- 🔐 Authentication & Authorization
- 🗄️ Database design
- 🔌 REST API development
- 🧹 Clean coding practices
- 🖌️ UI/UX implementation
- 🛡️ Security
- 📐 Overall project architecture

---

## 🛠️ 2. Preferred Technology Stack

### ⚙️ Backend

- **Runtime:** Node.js
- **Framework:** Express.js _or_ NestJS

### 🗄️ Database

- PostgreSQL _or_ MongoDB (Mongoose)

### 🔗 Database Access (ORM / Query Builder — choose any)

- Sequelize
- TypeORM
- Prisma
- Knex
- Mongoose

### 💻 Frontend

- **Framework:** Next.js

### 🎨 UI Framework (choose any)

- Tailwind CSS
- Ant Design
- Material UI
- Bootstrap
- _Or any modern CSS framework_

---

## 🧩 3. Project Modules

The project consists of **two applications**:

1. 🛍️ **Customer E-Commerce Website**
2. 🖥️ **Management Dashboard**

---

## 🛍️ 4. Module 1 — Customer Website

### 🏠 4.1 Home Page

#### ✨ Hero Section

- Modern, responsive design
- Animated banner or carousel
- Fashion promotional banners
- Smooth animations

#### 📊 Summary Section

Display attractive summary cards showing:

| Metric              | Description                     |
| ------------------- | ------------------------------- |
| 🗂️ Total Categories | Count of all product categories |
| 👕 Total Products   | Count of all products           |
| 📏 Available Sizes  | Count of all sizes              |
| 🎭 Available Styles | Count of all styles             |

---

### 🛒 4.2 Product Listing

Display products in a **responsive card view**.

> Each product card should include:
>
> - 🖼️ Product Image
> - 🏷️ Product Name
> - 🗂️ Category
> - 🎭 Style
> - 📏 Available Sizes
> - 💰 Price
> - ➕ _Add to Cart_ button

#### 🔍 Product Filtering

Allow filtering by:

- Category
- Size
- Style

_Products should update **dynamically** based on selected filters._

---

### 📄 4.3 Product Details Page

Clicking a product should open a details page displaying:

- 🖼️ Multiple Product Images
- 📝 Product Description
- 🗂️ Category
- 📏 Available Sizes
- 🎭 Available Styles
- 💰 Price
- 🔢 Quantity Selector
- ➕ Add to Cart

---

### 🛒 4.4 Shopping Cart

Implement:

- ➕ Add Item
- ➖ Remove Item
- 🔄 Update Quantity
- 🧮 Price Calculation
- 💵 Grand Total

---

### 📦 4.5 Checkout / Order

Collect the following information:

- 👤 Customer Name
- 📞 Phone Number
- 🏠 Shipping Address

✅ Generate an **Order** successfully upon submission.

---

### 🦶 4.6 Footer

Include:

- 🏢 Company Information
- ☎️ Contact Information
- 🔗 Social Media Links
- © Copyright

---

## 🖥️ 5. Module 2 — Management Dashboard

Develop a **secure and responsive** Management Dashboard.

---

### 🔐 5.1 Authentication & Authorization

#### 📝 User Registration

Allow users to register using:

- Full Name
- Email Address
- Phone Number _(optional)_
- Password

**Requirements:**

- ✅ Email must be unique
- 🔒 Passwords must be securely hashed using **bcrypt**
- ✅ Validate all input fields
- ⚠️ Return proper validation errors
- 👤 Newly registered users should receive the **Customer** role by default

#### 🔑 User Login

Users should log in using **email and password**.

After successful login, generate:

- 🎫 JWT Access Token
- 🔁 JWT Refresh Token

**Requirements:**

- 🔒 Store Refresh Token securely (hashed if persisted)
- ⏳ Implement Access Token expiration
- ⏳ Implement Refresh Token expiration
- 🔄 Implement Refresh Token API

#### 🔌 Required Authentication APIs

| Endpoint Purpose         | Description                    |
| ------------------------ | ------------------------------ |
| Register                 | Create a new user              |
| Login                    | Authenticate & issue tokens    |
| Refresh Token            | Issue new access token         |
| Logout                   | Invalidate session             |
| Get Current User Profile | Return authenticated user data |

---

### 🌐 5.2 Social Authentication

Implement **OAuth Login** using:

- 🔴 Google
- 🔵 Facebook

**Requirements:**

- ♻️ Existing users should be logged in automatically
- 🆕 New users should be created automatically
- 🎫 Return JWT Access Token and Refresh Token after successful authentication

---

### 🛡️ 5.3 Dashboard Authentication

> ⚠️ Only **authenticated dashboard users** should access the Management Dashboard.

- The system must contain **one default Super Admin account** seeded directly into the database.

**The Super Admin must be able to:**

- 🔑 Login
- ➕ Create Dashboard Users
- 📋 View User List
- 👁️ View User Details
- ✏️ Update User Information
- 🔛 Activate / Deactivate Users
- 🎭 Assign User Roles

---

### 🧑‍⚖️ 5.4 Authorization (RBAC)

Implement **Role-Based Access Control (RBAC)**.

#### 🎭 Roles

1. 👑 Super Admin
2. 🛠️ Admin
3. 📋 Manager
4. 🙋 Customer

#### 🔑 Permissions Matrix

| Permission                 | 👑 Super Admin | 🛠️ Admin | 📋 Manager | 🙋 Customer |
| -------------------------- | :------------: | :------: | :--------: | :---------: |
| Full System Access         |       ✅       |    ❌    |     ❌     |     ❌      |
| Manage Dashboard Users     |       ✅       |    ❌    |     ❌     |     ❌      |
| Assign Roles & Permissions |       ✅       |    ❌    |     ❌     |     ❌      |
| Manage Products            |       ✅       |    ✅    |     ❌     |     ❌      |
| Manage Categories          |       ✅       |    ✅    |     ❌     |     ❌      |
| Manage Sizes               |       ✅       |    ✅    |     ❌     |     ❌      |
| Manage Styles              |       ✅       |    ✅    |     ❌     |     ❌      |
| View Users                 |       ✅       |    ✅    |     ❌     |     ❌      |
| Manage Orders              |       ✅       |    ✅    |     ✅     |     ❌      |
| Update Order Status        |       ✅       |    ❌    |     ✅     |     ❌      |
| View Dashboard Reports     |       ✅       |    ❌    |     ❌     |     ❌      |
| View Dashboard             |       ✅       |    ✅    |     ✅     |     ❌      |
| View Products              |       ✅       |    ✅    |     ✅     |     ✅      |
| Register / Login           |       ✅       |    ✅    |     ✅     |     ✅      |
| Browse Products            |       ✅       |    ✅    |     ✅     |     ✅      |
| Add to Cart                |       ❌       |    ❌    |     ❌     |     ✅      |
| Place Orders               |       ❌       |    ❌    |     ❌     |     ✅      |
| View Own Orders            |       ❌       |    ❌    |     ❌     |     ✅      |
| Update Own Profile         |       ❌       |    ❌    |     ❌     |     ✅      |

> 🔒 **All dashboard APIs must be protected using JWT Authentication and Role Guards.**

---

### 🛡️ 5.5 Security Best Practices

**Must implement:**

- 🎫 JWT Authentication
- 🔒 Password Hashing (bcrypt)
- 🔄 Refresh Token Rotation _(Bonus)_
- 🚧 Route Guards / Middleware
- 🛡️ Protected APIs
- 📟 Proper HTTP Status Codes
- ✅ Input Validation
- ⚠️ Centralized Error Handling
- 🌐 CORS Configuration
- 🔑 Environment Variables for Secrets

#### 🌟 Bonus Security Features

- 📧 Email Verification
- 🔓 Forgot Password
- 🔁 Reset Password
- ✅ Account Activation
- 🚦 Rate Limiting
- 🚫 Login Attempt Protection
- 📜 Audit Log for Login Activity

---

### 📊 5.6 Dashboard Home

Display dashboard summary cards:

| Metric           | Icon |
| ---------------- | :--: |
| Total Users      |  👥  |
| Total Categories |  🗂️  |
| Total Products   |  👕  |
| Total Orders     |  📦  |

---

### 🗂️ 5.7 Category Management

> Implement **full CRUD** operations (Create, Read, Update, Delete).

### 👕 5.8 Product Management

> Implement **full CRUD** operations.

Each product should contain:

- Product Name
- Category
- Style
- Size
- Description
- Price
- Multiple Product Images

### 📏 5.9 Size Management

> Implement **full CRUD** operations.

### 🎭 5.10 Style Management

> Implement **full CRUD** operations.

### 📦 5.11 Order Management

Display:

- 👤 Customer Information
- 🛍️ Ordered Products
- 🔢 Quantity
- 💵 Total Amount
- 🚦 Order Status

✏️ Allow updating **Order Status**.

### 👥 5.12 User Management

Display:

- 📋 User List
- 👁️ User Details

> Super Admin should be able to **create and manage dashboard users**.

---

## 🔌 6. API Requirements

Develop clean REST APIs following best practices, including:

- ✅ Validation
- 🔐 Authentication
- 🛡️ Authorization
- ⚠️ Error Handling
- 📄 Pagination
- 🔍 Search
- 🧮 Filtering

---

## 🗄️ 7. Database Design

Design a **normalized relational database** including the following entities:

- 👥 Users
- 🎭 Roles
- 🗂️ Categories
- 👕 Products
- 📏 Sizes
- 🎨 Styles
- 📦 Orders
- 🧾 Order Items

> 🔗 Use proper **relationships, foreign keys, indexes, and constraints**.

---

## 🏆 8. Code Quality Expectations

Evaluation will consider:

| Category           | Aspects                                              |
| ------------------ | ---------------------------------------------------- |
| 🏗️ Architecture    | Clean Architecture, Modular Design, Folder Structure |
| ♻️ Design          | Reusable Components, SOLID Principles, Clean Code    |
| 🔌 API             | API Design                                           |
| 🛡️ Security        | Security Best Practices                              |
| ⚡ Performance     | Optimization & Efficiency                            |
| 📱 UI              | Responsive UI                                        |
| 🗃️ Version Control | Git Commit History                                   |

---

## 🔀 9. Git Workflow

1. ✅ Accept the GitHub Collaboration invitation
2. 📥 Clone the repository
3. 🏗️ Complete the project according to the requirements
4. 💬 Make meaningful Git commits
5. 🚀 Push all code before the submission deadline

---

## ✅ 10. Submission Checklist

Before submitting, ensure that:

- [ ] Source code has been pushed to GitHub
- [ ] The project runs successfully without errors
- [ ] A complete `README.md` file is included
- [ ] Installation steps are documented
- [ ] Environment variables are documented
- [ ] Database migration, schema, or seed files are included

---

## 📧 11. Submission Confirmation

After completing the assessment, reply to the assignment email with:

- 👤 Full Name
- 🐙 GitHub Username
- 🕒 Submission Date & Time
- ✅ Confirmation that all source code has been pushed successfully
- 📝 Brief summary of the completed work
- 💡 Any assumptions, limitations, or additional features implemented

---

<div align="center">

### 🌟 We wish you the very best and look forward to reviewing your technical solution! 🌟

**— Easy Fashion Limited**

</div>
