
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

const GenReport = () => {
    const location = useLocation();
    const { reportContent } = location.state || {};
    
    // Simple state to manage display
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (reportContent) {
            setIsLoading(false);
        }
    }, [reportContent]);

    if (isLoading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" mt={2}>Generating report...</Typography>
            </Box>
        );
    }
    
    // You can parse the content here if it has a specific format (e.g., Markdown)
    // For now, we will render it as a simple text block.

    return (
        <Box sx={{ p: 4, maxWidth: 'lg', mx: 'auto' }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Feasibility Report
                </Typography>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {reportContent}
                </div>
            </Paper>
        </Box>
    );
};

export default GenReport;