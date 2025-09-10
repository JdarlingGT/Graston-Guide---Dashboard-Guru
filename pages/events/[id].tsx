import { useRouter } from 'next/router';
import Head from 'next/head';
import React from 'react';
import { Container, Tabs, Tab, Box, Typography } from '@mui/material';
import AdvancedDataGrid from '../../components/AdvancedDataGrid';
import { GridColDef } from '@mui/x-data-grid';
import Comments from '../../components/Comments';

interface Student {
  id: number;
  name: string;
  license: string;
  certification: string;
  crmTags: string[];
  tagged: boolean; // computed metric
  instructor: string;
}

const mockStudents: Student[] = [
  { id: 1, name: 'Alice Johnson', license: 'ABC123', certification: 'Graston Level 1', crmTags: ['Alumni'], tagged: true, instructor: 'Instructor A' },
  { id: 2, name: 'Bob Smith', license: 'XYZ789', certification: 'Graston Level 2', crmTags: ['Prospect', 'VIP'], tagged: true, instructor: 'Instructor B' },
  { id: 3, name: 'Carol Lee', license: 'DEF456', certification: 'Graston Level 1', crmTags: [], tagged: false, instructor: 'Instructor C' },
];

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'license', headerName: 'License', flex: 1 },
  { field: 'certification', headerName: 'Certification', flex: 1 },
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
    field: 'tagged',
    headerName: 'Tagged?',
    width: 100,
    renderCell: (params) =>
      params.value ? (
        <Chip label="Yes" color="success" size="small" />
      ) : (
        <Chip label="No" color="default" size="small" />
      ),
  },
  {
    field: 'instructor',
    headerName: 'Instructor',
    width: 140,
  },
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
        <Box sx={{ mt: 2 }}>
          <AdvancedDataGrid
            title="Roster"
            columns={columns}
            rows={mockStudents}
          />
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