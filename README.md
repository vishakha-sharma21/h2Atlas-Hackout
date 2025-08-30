h2Atlas-Hackout

This is a **React project** built with **Vite**, styled using **Tailwind CSS**, and designed for mapping and visualization.  

---

Project Structure

The repository is structured as follows:

```
.
├── public/                  # Static assets
│   ├── final_hydrogen_plants.geojson
│   ├── india_solar_wind.geojson
│   ├── major_industrial_plants.geojson
│   └── vite.svg
│
├── src/                     # Application source code
│   ├── assets/              # Static files (images, fonts, etc.)
│   ├── components/          # Reusable React components
│   │   ├── Filters.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── IndiaMap.jsx
│   │   ├── MainPlatform.jsx
│   │   ├── Report.jsx
│   │   ├── TheChallenge.jsx
│   │   └── TheSolution.jsx
│   ├── pages/               # Main pages/views
│   │   └── Preferences.jsx
│   ├── utils/               # Utility/helper files
│   │   └── overpass.js
│   ├── App.jsx              # Main application component
│   ├── index.css            # Global CSS styles
│   └── main.jsx             # Application entry point
│
├── .gitignore               # Files/folders ignored by Git
├── index.html               # Main HTML file
├── package.json             # Project dependencies and scripts
├── package-lock.json        # Locked dependency versions
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

---

Getting Started

To get the project up and running locally, follow these steps:

1.Clone the repository
```bash
git clone https://github.com/vishakha-sharma21/h2Atlas-Hackout.git
cd h2Atlas-Hackout
```

2.Install dependencies
```bash
npm install
```

3.Run the development server
```bash
npm run dev
```

4.Open in browser
Navigate to [http://localhost:5173/](http://localhost:5173/) (or the port shown in your terminal).

---

##Key Technologies

- **React** → JavaScript library for building UIs  
- **Vite** → Fast front-end build tool  
- **Tailwind CSS** → Utility-first CSS framework for rapid UI development  

---

##Authors

- [Vishakha Sharma](https://github.com/vishakha-sharma21)  
- Team: h2Atlas-Hackout  

---
