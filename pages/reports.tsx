import Head from 'next/head';
import React from 'react';
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockMetrics = {
  totalEvents: 24,
  totalRegistrants: 128,
  openSeats: 56,
  highRiskEvents: 3,
};

const enrollmentData = [
  { month: 'Jan', enrollments: 20 },
  { month: 'Feb', enrollments: 35 },
  { month: 'Mar', enrollments: 40 },
  { month: 'Apr', enrollments: 50 },
  { month: 'May', enrollments: 30 },
  { month: 'Jun', enrollments: 45 },
];

export default function Reports() {
  return (
    <Container>
      <Head>
        <title>Reports - Graston Dashboard</title>
        <meta name="description" content="Reports page of Graston Dashboard" />
      </Head>

      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Events</Typography>
              <Typography variant="h4">{mockMetrics.totalEvents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Registrants</Typography>
              <Typography variant="h4">{mockMetrics.totalRegistrants}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Open Seats</Typography>
              <Typography variant="h4">{mockMetrics.openSeats}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">High-Risk Events</Typography>
              <Typography variant="h4">{mockMetrics.highRiskEvents}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Enrollment Trends
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={enrollmentData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="enrollments" fill="#0072CE" />
        </BarChart>
      </ResponsiveContainer>
    </Container>
  );
}