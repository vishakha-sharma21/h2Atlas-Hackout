import React from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Heat from "./Heat";

const theme = createTheme();

function MainApp() {
    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                {/* Direct Header Content */}
                <header className="flex justify-between items-center py-4 px-6 md:px-12 bg-[#6495ED] text-white shadow-md">
                    <div className="flex items-center space-x-2">
                        <Link to="/predictdata" className="flex items-center space-x-2 text-white font-semibold text-lg">
                                    <div className="h-12 w-12 md:h-14 md:w-14 bg-white rounded-full p-1 flex items-center justify-center shadow-sm">
          <img src="/favicon.svg" alt="H2Atlas logo" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
        </div>
                            <span className="text-white">Predict</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-6">
                        <Link to="/predict" className="text-white hover:text-white/80 font-medium transition-colors">
                            Predict Solar/Wind Plant
                        </Link>
                        <Link to="/preferences" className="text-white hover:text-white/80 font-medium transition-colors">
                            Preferences
                        </Link>
                        <Link to="/" className="text-white hover:text-white/80 font-medium transition-colors">
                            Home
                        </Link>
                    </div>
                </header>

                <Heat />
            </div>
        </ThemeProvider>
    );
}

export default MainApp;