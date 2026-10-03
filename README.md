# QLess — Frontend

The React frontend for QLess, a virtual queue management platform that lets customers join queues remotely, track their position in real time, and get notified when their turn approaches, while businesses manage branches, services, staff, bookings, and queues from one place.

## Project Overview

QLess reduces physical waiting times and makes queue management easier for both customers and businesses.

This repository contains the user interface for every role on the platform: guests browsing businesses, customers joining queues, business owners managing their branches, staff running queues at the counter, and admins overseeing the whole platform.

---

## Backend Repository

[QLess Backend Repository](https://github.com/fatema-maitham/QLess-Backend)

The frontend talks to the FastAPI backend over REST (`/api`) and WebSockets (`/ws`).

---

## Key Features

### Guest
* Landing page explaining how QLess works
* Browse, search, and filter approved businesses
* View branches, locations, opening status, services, queues, and announcements
* Sign up and sign in

### Customer
* Join an open queue and receive a queue number
* Live queue tracking: position, people ahead, estimated wait, and recommended return time
* Real-time updates and notifications when called
* Mark "on my way", check in, or leave a queue
* Queue history and no-show warnings
* Make, update, and cancel bookings
* Review and favorite businesses

### Business Owner
* Create businesses and submit them for approval
* Track approval status and see rejection reasons
* Manage branches, services, operating hours, and queues
* Open, pause, resume, and close queues
* Set capacity, average service duration, and no-show grace period
* Add and manage staff
* Manage bookings and announcements
* View reviews and queue analytics

### Staff
* View assigned business, branch, services, and hours
* Run live queues: call next, check in, complete, or mark no-show
* See customers who are on their way
* Pause and resume queues
* View queue history and branch bookings

### Admin
* Platform dashboard and statistics
* Manage users and lift restrictions
* Approve, reject, or deactivate businesses and branches
* Manage categories and reviews
* Review suspicious activity and audit logs

---

## User Roles

| Role               | Description                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Guest**          | Browse businesses and explore QLess without an account.                               |
| **Customer**       | Discover businesses, join virtual queues, manage bookings, and receive notifications. |
| **Business Owner** | Manage businesses, branches, services, queues, staff, bookings, and announcements.    |
| **Staff**          | Manage queues and customers at an assigned branch.                                    |
| **Admin**          | Manage and monitor the QLess platform, users, businesses, and activity.               |

---

## Tech Stack

* React
* JavaScript
* HTML
* CSS
* Vite
* React Router
* Axios
* WebSockets

### Development Tools
* Git
* GitHub
* npm

---

## Design

* **Font:** DM Sans
* **Colours:**

| Colour | Hex |
| --- | --- |
| Primary orange | `#f8713a` |
| Soft peach | `#f9ca87` |
| Background | `#fbfaf8` |
| Text | `#1b191a` |
| Muted grey | `#b0b0b0` |
| Light grey | `#eeedeb` |

---

## Getting Started

> Make sure the [backend](https://github.com/fatema-maitham/QLess-Backend) is running on `http://127.0.0.1:8000` first.

1. Clone the repo and install packages
```bash
   git clone https://github.com/fatema-maitham/QLess-Frontend.git
   cd QLess-Frontend
   npm install
```
2. Create a `.env` file in the project root
```
   VITE_API_URL=http://127.0.0.1:8000/api
   VITE_WS_URL=ws://127.0.0.1:8000/ws
```
3. Start the development server
```bash
   npm run dev
```
4. Open http://localhost:5173

### Test accounts (password: `password123`)

| Role | Email |
| --- | --- |
| Admin | admin@qless.com |
| Owner | owner@qless.com |
| Staff | staff@qless.com |
| Customer | customer@qless.com |

---

## Component Hierarchy

![QLess Component Hierarchy Diagram](plan/QLess-CHD.png)

---

## Future Enhancements

* SMS and WhatsApp notifications when a customer's turn is near
* QR code check-in at the branch
* Email verification and password reset
* Arabic language support
* Map view of nearby branches
* Online payment for bookings
* Charts for queue analytics
* Mobile app
