# Impact AI 🚀

Impact AI is a cutting-edge, AI-powered platform designed to streamline and enhance non-profit operations. By leveraging advanced automation and intelligent matching, Impact AI empowers organizations to maximize their social impact through efficient donor management, volunteer coordination, and data-driven reporting.

## ✨ Key Features

- **🎯 Volunteer Matcher**: Intelligently match volunteers with opportunities based on skills and availability.
- **📧 Donor Email Organizer**: Automate and personalize donor communications to build stronger relationships.
- **📝 Grant Assistant**: Streamline the grant application process with AI-driven writing and tracking.
- **📊 Impact Reporter**: Generate comprehensive reports to visualize and communicate social impact.
- **📅 Event Scheduler AI**: Optimize event planning and management with intelligent scheduling.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Security**: [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [Express Rate Limit](https://github.com/n67/express-rate-limit)
- **Logging**: [Morgan](https://github.com/expressjs/morgan)

---

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd hackthon
   ```

2. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies:**
   ```bash
   cd ../server
   npm install
   ```

### Running the Application

You need to start both the client and the server simultaneously.

#### 1. Start the Server
From the `server` directory:
```bash
npm run dev
```
The server will start on `http://localhost:5000` (by default).

#### 2. Start the Client
Open a new terminal window/tab and navigate to the `client` directory:
```bash
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 📂 Project Structure

```text
├── client/                # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Dashboard, Landing, etc.)
│   │   ├── App.jsx        # Main application routing
│   │   └── main.jsx       # Entry point
├── server/                # Node.js/Express backend
│   ├── index.js           # Server entry point
│   ├── routes/            # API endpoints
│   └── .env               # Environment variables
└── README.md              # Project documentation
```

## 🛡️ Environment Variables

Create a `.env` file in the `server` directory and add the following:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
