# FoodShare – Community Food Donation & Request Platform

## 🥗 About the Project

**FoodShare** is a full-stack community platform built using the MERN stack. It enables users to donate or request surplus food, browse public posts, claim or fulfill requests, and track their donation/request history. This project promotes reducing food waste while supporting community needs through a user-friendly, real-time interface. Build fully with Cursor AI.

🌐 Project link: [Food Share](https://food-share-community.netlify.app/) 🚀

---

## 🛠️ Tech Stack

- **Frontend**: React, Chakra UI
- **State Management**: Redux Toolkit
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt

---

## ✨ Features

- **Public Post Feed**: View active food donations and requests (no login required).
- **Secure Authentication**: JWT-based login and signup with hashed passwords using bcrypt.
- **Post Donation or Request**: Submit posts with type, description, quantity, location, and expiry date.
- **Map View**: Browse donations/requests by location using an interactive map.
- **Claim Flow**: Claim a donation, get approved by the post owner, and mark it picked up or completed.
- **Status Tracking**: Visual timeline from `Posted → Claimed → Picked Up → Completed` or `Expired`.
- **Notifications**: In-app reminders for approvals, expirations, and actions.
- **Ratings**: Users can rate each other after successful food exchanges (1–5 stars).
- **User Profile**: View your stats, history, and ratings.
- **Filtering Options**: Filter posts by type (donate/request), expiry date, or location.

---

## 🖥️ Frontend

- Developed using **React** and styled with **Chakra UI**.
- State managed with **Redux Toolkit**.
- Implemented routing with **React Router DOM**.
- Toast notifications for real-time feedback.
- Integrated interactive map using **React-Leaflet**.

---

## 🧩 Backend

- Built with **Node.js** and **Express**.
- **MongoDB** with Mongoose for database management.
- Passwords securely hashed using **bcrypt**.
- JWT tokens for user authentication and authorization.
- RESTful APIs for all core functionalities: auth, posts, claims, profiles, ratings.

---

## 🖼️ Images

### Homepage  
![Homepage](https://raw.githubusercontent.com/RohitBasantYadav/FoodShare/refs/heads/main/frontend/public/foodshare-homepage.png)

### Post Form  
![Post Form](https://raw.githubusercontent.com/RohitBasantYadav/FoodShare/refs/heads/main/frontend/public/foodshare-postform.png)

### Map View  
![Map View](https://raw.githubusercontent.com/RohitBasantYadav/FoodShare/refs/heads/main/frontend/public/foodshare-mapview.png)

### Dashboard 
![Dashboard](https://raw.githubusercontent.com/RohitBasantYadav/FoodShare/refs/heads/main/frontend/public/foodshare-dashboard.png)

### Profile Page  
![Profile Page](https://raw.githubusercontent.com/RohitBasantYadav/FoodShare/refs/heads/main/frontend/public/foodshare-profile.png)

### Login Page  
![Login](https://raw.githubusercontent.com/RohitBasantYadav/FoodShare/refs/heads/main/frontend/public/foodshare-login.png)

### Signup Page  
![Register](https://raw.githubusercontent.com/RohitBasantYadav/FoodShare/refs/heads/main/frontend/public/foodshare-signup.png)

---

## 🚀 Installation

To run this project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RohitBasantYadav/FoodShare.git
2. Navigate to the project directory:

   ```bash
    cd Big_basket_clone

3. Install the dependencies for both frontend and backend:

   ```bash
   cd frontend
   npm install
   cd backend
   npm install

4. Create a .env file in the backend directory and add the following environment variables:

   ```bash
    MONGODB_URI=<your-mongodb-url>
    PORT=<any-port-number>
    JWT_SECRET=<your-secret-key>
    JWT_EXPIRE=<your-expiry-date>

5. Create a .env file in the frontend directory and add the following environment variables:

    ```bash
    VITE_API_URL=<your-api-url>

6. Start the backend server locally:

   ```bash
    npm run dev

7. Start the frontend locally:

   ```bash
    npm run dev

    