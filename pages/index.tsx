import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { Container, Typography, Chip } from '@mui/material';
import AdvancedDataGrid from '../components/AdvancedDataGrid';

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  instructor: string;
  ceus: number;
  seats: number;
  risk: 'High' | 'Medium' | 'Low';
  crmTags: string[];
  attendanceRate: number; // computed metric
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const mockEvents: Event[] = [
  { id: 1, name: 'Event A', date: '2025-09-01', location: 'Location A', instructor: 'Instructor A', ceus: 3, seats: 30, risk: 'Low', crmTags: ['VIP', 'Repeat'], attendanceRate: 0.95, status: 'Scheduled' },
  { id: 2, name: 'Event B', date: '2025-09-10', location: 'Location B', instructor: 'Instructor B', ceus: 2, seats: 25, risk: 'Medium', crmTags: ['New'], attendanceRate: 0.82, status: 'Completed' },
  { id: 3, name: 'Event C', date: '2025-09-20', location: 'Location C', instructor: 'Instructor C', ceus: 1.5, seats: 20, risk: 'High', crmTags: ['At Risk'], attendanceRate: 0.67, status: 'Cancelled' },
];

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'date', headerName: 'Date', flex: 1 },
  { field: 'location', headerName: 'Location', flex: 1 },
  { field: 'instructor', headerName: 'Instructor', flex: 1 },
  { field: 'ceus', headerName: 'CEUs', type: 'number', width: 100 },
  { field: 'seats', headerName: 'Seats', type: 'number', width: 100 },
  {
    field: 'attendanceRate',
    headerName: 'Attendance %',
    width: 130,
    type: 'number',
    valueGetter: (params) => (params.row.attendanceRate * 100).toFixed(1),
    renderCell: (params) => (
      <span>
        {(params.row.attendanceRate * 100).toFixed(1)}%
      </span>
    ),
  },
  {
    field: 'crmTags',
    headerName: 'CRM Tags',
    width: 180,
    renderCell: (params) =>
      params.value && Array.isArray(params.value) ? (
        params.value.map((tag: string) => (
          <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
        ))
      ) : null,
  },
  {
    field: 'risk',
    headerName: 'Risk',
    width: 120,
    renderCell: (params) => {
      let color: 'success' | 'warning' | 'error';
      if (params.value === 'High') color = 'error';
      else if (params.value === 'Medium') color = 'warning';
      else color = 'success';
      return <Chip label={params.value} color={color} size="small" />;
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip label={params.value} size="small" color={
        params.value === 'Completed' ? 'success' :
        params.value === 'Cancelled' ? 'error' : 'default'
      } />
    ),
  },
  {
    field: 'details',
    headerName: 'Details',
    width: 120,
    renderCell: (params) => (
      <Link href={`/events/${params.row.id}`} passHref>
        <Button component="a" variant="contained" size="small">
          View
        </Button>
      </Link>
    ),
  },
];

/* Export handled by AdvancedDataGrid */

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Graston Dashboard</title>
        <meta name="description" content="Events overview" />
      </Head>
      <Container>
        <Typography variant="h4" gutterBottom>
          Events
        </Typography>
        <AdvancedDataGrid
          title="Events"
          columns={columns}
          rows={mockEvents}
        />
      </Container>
    </Layout>
  );
}