import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { Container, Typography, Button, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { SaveAlt as SaveAltIcon } from '@mui/icons-material';

interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  instructor: string;
  ceus: number;
  seats: number;
  risk: 'High' | 'Medium' | 'Low';
}

const mockEvents: Event[] = [
  { id: 1, name: 'Event A', date: '2025-09-01', location: 'Location A', instructor: 'Instructor A', ceus: 3, seats: 30, risk: 'Low' },
  { id: 2, name: 'Event B', date: '2025-09-10', location: 'Location B', instructor: 'Instructor B', ceus: 2, seats: 25, risk: 'Medium' },
  { id: 3, name: 'Event C', date: '2025-09-20', location: 'Location C', instructor: 'Instructor C', ceus: 1.5, seats: 20, risk: 'High' },
];

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'date', headerName: 'Date', flex: 1 },
  { field: 'location', headerName: 'Location', flex: 1 },
  { field: 'instructor', headerName: 'Instructor', flex: 1 },
  { field: 'ceus', headerName: 'CEUs', type: 'number', width: 100 },
  { field: 'seats', headerName: 'Seats', type: 'number', width: 100 },
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

const exportCSV = () => {
  const header = columns.filter(c => c.field !== 'details').map(c => c.headerName);
  const rows = mockEvents.map(evt =>
    [evt.name, evt.date, evt.location, evt.instructor, evt.ceus, evt.seats, evt.risk].join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'events.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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
        <Button
          variant="outlined"
          startIcon={<SaveAltIcon />}
          onClick={exportCSV}
          sx={{ mb: 2 }}
        >
          Export CSV
        </Button>
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid rows={mockEvents} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
        </div>
      </Container>
    </Layout>
);
}