import { useRouter } from 'next/router';
import Head from 'next/head';
import React from 'react';
import { Container, Tabs, Tab, Box, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Comments from '../../components/Comments';

interface Student {
  id: number;
  name: string;
  license: string;
  certification: string;
}

const mockStudents: Student[] = [
  { id: 1, name: 'Alice Johnson', license: 'ABC123', certification: 'Graston Level 1' },
  { id: 2, name: 'Bob Smith', license: 'XYZ789', certification: 'Graston Level 2' },
  { id: 3, name: 'Carol Lee', license: 'DEF456', certification: 'Graston Level 1' },
];

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'license', headerName: 'License', flex: 1 },
  { field: 'certification', headerName: 'Certification', flex: 1 },
];

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [tabIndex, setTabIndex] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container>
      <Head>
        <title>Event {id} - Graston Dashboard</title>
        <meta name="description" content={`Details for event ${id}`} />
      </Head>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Roster" />
          <Tab label="Comments" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5">Event Details</Typography>
          <Typography>This is the detail page for event {id}.</Typography>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ mt: 2, height: 400 }}>
          <DataGrid rows={mockStudents} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
        </Box>
      )}

      {tabIndex === 2 && (
        <Box sx={{ mt: 2 }}>
          <Comments />
        </Box>
      )}
    </Container>
  );
}