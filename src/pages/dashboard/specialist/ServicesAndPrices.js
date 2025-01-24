import React from "react";
import { Typography, Box, Table, TableBody, TableCell, TableRow } from "@mui/material";

const ServicesAndPrices = ({ services }) => {
    return (
        <Box sx={{ marginBottom: 4, backgroundColor: "white", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 0, paddingLeft: 2, paddingTop: 2 }}>
                Services and prices
            </Typography>
            <Table>
                <TableBody>
                    {services.map((service, index) => (
                        <TableRow key={index}>
                            <TableCell>{service.name}</TableCell>
                            {/* Добавлен стиль для выравнивания цены по правому краю */}
                            <TableCell sx={{ textAlign: 'right' }}>${service.price}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default ServicesAndPrices;
