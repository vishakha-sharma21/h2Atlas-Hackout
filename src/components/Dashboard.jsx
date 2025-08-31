// src/components/Dashboard.jsx

import React, { useMemo } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const ChartPlaceholder = ({ title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250, border: '1px dashed lightgrey', borderRadius: 1 }}>
        <Typography variant="body1" color="text.secondary">{title}</Typography>
    </Box>
);

const Dashboard = ({ data }) => {
    if (!data) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h6">Select a region on the map and click 'Calculate Scores' to view the dashboard.</Typography>
            </Box>
        );
    }

    const fuelCapacityData = useMemo(() => {
        return data.fuelCapacity ? Object.entries(data.fuelCapacity).map(([fuel, capacity]) => ({ name: fuel, capacity })) : [];
    }, [data.fuelCapacity]);

    const cumulativeCapacityData = useMemo(() => {
        return data.cumulativeCapacity || [];
    }, [data.cumulativeCapacity]);

    const sliderContributionsData = useMemo(() => {
        return data.sliderContributions || [];
    }, [data.sliderContributions]);

    const nearestParametersData = useMemo(() => {
        return data.nearestParameters || [];
    }, [data.nearestParameters]);


    const pieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`;

    return (
        <Box sx={{ p: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* 1. Pie Chart: Score Contributions */}
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
                <Typography variant="h5">Score Contributions</Typography>
                {sliderContributionsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={sliderContributionsData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={pieLabel}
                            >
                                {sliderContributionsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <ChartPlaceholder title="No slider data available." />
                )}
            </Paper>

            {/* 2. Table: Nearest Parameters */}
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
                <Typography variant="h5">Nearest Parameters</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Distance (km)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {nearestParametersData.length > 0 ? (
                                nearestParametersData.slice(0, 5).map((point, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{point.type}</TableCell>
                                        <TableCell>{point.name}</TableCell>
                                        <TableCell>{point.distance ? point.distance.toFixed(2) : 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No nearby parameters found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* 3. Bar Chart: Total Capacity by Fuel Type */}
            <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
                <Typography variant="h5">Total Capacity by Fuel</Typography>
                {fuelCapacityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={fuelCapacityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="capacity" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <ChartPlaceholder title="No fuel data in this region." />
                )}
            </Paper>
        </Box>
    );
};

export default Dashboard;