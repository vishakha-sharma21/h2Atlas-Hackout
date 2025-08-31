# H2Atlas-Hackout

H2Atlas-Hackout is an interactive map-based platform designed to support the planning and analysis of hydrogen infrastructure across India. The platform integrates multiple datasets, allowing users to evaluate optimal locations for hydrogen plants, assess nearby renewable energy sources, industrial demand points, and transportation options, all in a visually intuitive interface.

🌐 **Live Demo:** https://h2atlas.vercel.app

---

## 🚀 Features

- **Interactive India Map**: Explore hydrogen plant locations, renewable energy sources, and major industrial plants across India.  
- **Dynamic Filtering**: Apply filters to view specific types of energy resources or industrial clusters.  
- **Location Scoring**: Evaluate potential hydrogen plant sites based on proximity to demand, renewable energy availability, and power infrastructure.  
- **Report Generation**: Generate detailed location reports including nearest resources and suitability scores.  
- **Responsive UI**: Clean, modern interface built with Tailwind CSS for seamless experience across devices.  
- **Real-time Data Integration**: Leverages GeoJSON datasets for hydrogen plants, solar & wind resources, and major industrial plants.

---

## 🛠 Key Technologies

- **React** – Build interactive and dynamic user interfaces.  
- **Vite** – Fast and optimized front-end build tool.  
- **Tailwind CSS** – Utility-first framework for rapid UI development.  
- **Leaflet** – Map rendering and spatial data visualization.  
- **GeoJSON** – Spatial datasets for hydrogen plants, renewable resources, and industrial locations.

---

## 📂 Project Structure

```
├── public/                  # Static assets
│   ├── final_hydrogen_plants.geojson
│   ├── india_solar_wind.geojson
│   ├── major_industrial_plants.geojson
|   ├── favicon.svg
│   └── vite.svg
│
├── src/                     # Application source code
│   ├── assets/              # Static files (images, fonts, etc.)
│   ├── components/          # Reusable React components
│   │   ├── components.js
│   │   ├── components.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Filters.jsx
│   │   ├── GenReport.jsx
│   │   ├── Header.jsx
│   │   ├── Heat.jsx
│   │   ├── Hero.jsx
│   │   ├── IndiaMap.jsx
│   │   ├── MainApp.jsx
│   │   ├── MainPlatform.jsx
│   │   ├── Report.jsx
│   │   ├── TheChallenge.jsx
│   │   ├── TheSolution.jsx
│   │   └── WeightageInputComponent.jsx
│   ├── pages/               # Main pages/views
│   │   └── About.jsx
│   │   ├── Predict.jsx
│   │   └── Preferences.jsx
│   ├── utils/               # Utility/helper files
│   │   └── overpass.js
    │   └── predict.js
    │   └── scorecalculation.js

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

## 💡 Future Enhancements

- Integration with real-time energy datasets.
- Advanced AI-driven location optimization.
- User accounts with saved preferences and reports.
- Export reports as PDF or Excel.

---
## Demo Screenshots

### Main Landing Page
![WhatsApp Image 2025-08-31 at 10 24 09_7979ccf2](https://github.com/user-attachments/assets/3a76b1ce-db4f-46a4-9667-5ae6b2a9c98e)
![WhatsApp Image 2025-08-31 at 10 24 49_329f18f3](https://github.com/user-attachments/assets/ac49ad1e-d1b0-46d6-958f-aef3ad8a3310)
![WhatsApp Image 2025-08-31 at 10 24 48_08e0da30](https://github.com/user-attachments/assets/dde481be-5825-47c3-b897-829972fd94b4)
![WhatsApp Image 2025-08-31 at 10 24 48_b33c18d0](https://github.com/user-attachments/assets/7d4c0e7b-a870-4b5e-a52c-ce66e721d210)

### Main Features

#### Preferences
![WhatsApp Image 2025-08-31 at 10 31 43_f935bfc1](https://github.com/user-attachments/assets/6b406345-d444-4e63-8395-ef2637fb5d03)

#### Prediction of Solar/Wind Plants
![WhatsApp Image 2025-08-31 at 10 32 21_11f864b7](https://github.com/user-attachments/assets/857417dd-bf45-4a1c-9df4-7744166e63e4)

#### Prediction of H2 Power Plant
![WhatsApp Image 2025-08-31 at 10 32 56_8569e054](https://github.com/user-attachments/assets/80f92dd7-b546-4016-842b-7635df103bd4)
![WhatsApp Image 2025-08-31 at 10 33 23_a50793df](https://github.com/user-attachments/assets/40357e39-28e9-4c20-9f86-35aaafecca78)


### Output Report
![WhatsApp Image 2025-08-31 at 10 34 07_89518829](https://github.com/user-attachments/assets/049c3c5c-96e6-49b5-8ce7-25b5b16b725b)


---

## Getting Started

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

## Authors

- [Vishakha Sharma](https://github.com/vishakha-sharma21)  
- Team: h2Atlas-Hackout  

---
