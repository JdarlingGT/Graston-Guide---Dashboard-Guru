import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import {
  Button,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Divider,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  MenuItem as MuiMenuItem,
  Stack,
  TextField,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface AdvancedDataGridProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  title?: string;
  // Future: viewType, user/org, computedFields, crmTags, etc.
}

const AdvancedDataGrid: React.FC<AdvancedDataGridProps> = ({
  columns,
  rows,
  title,
}) => {
  // Column picker state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((col) => col.field)
  );

  // Filter builder state
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  type FilterRule = {
    field: string;
    operator: string;
    value: any;
    logic?: 'AND' | 'OR';
  };
  // Persist filters per user/grid
  const gridKey = `datagrid-filters-${title || 'default'}-${userId}`;
  const [filterRules, setFilterRules] = useState<FilterRule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(gridKey);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  // Save filters to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(gridKey, JSON.stringify(filterRules));
    }
  }, [filterRules, gridKey]);
  // Supported operators
  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'notEquals', label: 'Not Equals' },
  ];
  // Add/remove filter rules
  const addFilterRule = () => {
    setFilterRules((prev) => [
      ...prev,
      {
        field: columns[0]?.field || '',
        operator: 'equals',
        value: '',
        logic: prev.length > 0 ? 'AND' : undefined,
      },
    ]);
  };
  const removeFilterRule = (idx: number) => {
    setFilterRules((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateFilterRule = (idx: number, rule: Partial<FilterRule>) => {
    setFilterRules((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, ...rule } : r))
    );
  };
  // Apply filter rules to rows
  const applyFilters = (rows: GridRowsProp): GridRowsProp => {
    if (filterRules.length === 0) return rows;
    return rows.filter((row) => {
      let result = true;
      for (let i = 0; i < filterRules.length; i++) {
        const rule = filterRules[i];
        const cellValue = row[rule.field];
        let match = false;
        if (rule.operator === 'equals') {
          match = String(cellValue) === String(rule.value);
        } else if (rule.operator === 'notEquals') {
          match = String(cellValue) !== String(rule.value);
        } else if (rule.operator === 'contains') {
          match = String(cellValue).toLowerCase().includes(String(rule.value).toLowerCase());
        } else if (rule.operator === 'startsWith') {
          match = String(cellValue).toLowerCase().startsWith(String(rule.value).toLowerCase());
        } else if (rule.operator === 'endsWith') {
          match = String(cellValue).toLowerCase().endsWith(String(rule.value).toLowerCase());
        }
        if (i === 0) {
          result = match;
        } else {
          if (rule.logic === 'AND') {
            result = result && match;
          } else if (rule.logic === 'OR') {
            result = result || match;
          }
        }
      }
      return result;
    });
  };

  // Bulk actions state
  const [bulkAnchorEl, setBulkAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkInstructor, setBulkInstructor] = useState('');

  // Column picker handlers
  const handleColumnPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleColumnPickerClose = () => {
    setAnchorEl(null);
  };
  const handleToggleColumn = (field: string) => {
    setVisibleColumns((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };
  // Drag-and-drop reorder handler
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(visibleColumns);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setVisibleColumns(reordered);
  };

  // Filter builder handlers (placeholder)
  const handleFilterBuilderOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterBuilderClose = () => {
    setFilterAnchorEl(null);
  };

  // Bulk actions handlers (placeholder)
  const handleBulkActionsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setBulkAnchorEl(event.currentTarget);
  };
  const handleBulkActionsClose = () => {
    setBulkAnchorEl(null);
  };

  // Export handlers (CSV and PDF)
  const getExportData = () => {
    const filteredRows = applyFilters(rows);
    const exportCols = columns.filter(
      (c) => visibleColumns.includes(c.field) && c.field !== 'details'
    );
    const header = exportCols.map((c) => c.headerName);
    const dataRows = filteredRows.map((row) =>
      exportCols.map((c) => row[c.field])
    );
    return { header, dataRows };
  };

  const handleExportCSV = () => {
    const { header, dataRows } = getExportData();
    const csv = [header.join(','), ...dataRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title || 'data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const { header, dataRows } = getExportData();
    const doc = new jsPDF();
    doc.text(title || 'Data Export', 14, 14);
    (doc as any).autoTable({
      head: [header],
      body: dataRows,
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save(`${title || 'data'}.pdf`);
  };

  // Filtered/visible columns
  const displayedColumns = columns.filter((col) =>
    visibleColumns.includes(col.field)
  );

  // Views state
  const [viewsAnchorEl, setViewsAnchorEl] = useState<null | HTMLElement>(null);
  const [savedViews, setSavedViews] = useState<any[]>([]);
  const [viewName, setViewName] = useState('');
  const [loadingViews, setLoadingViews] = useState(false);

  // Placeholder: Replace with real user/org context
  const userId = 'demo-user';
  const orgId = 'demo-org';

  // Load views from Supabase
  const loadViews = async () => {
    setLoadingViews(true);
    const { data, error } = await supabase
      .from('datagrid_views')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) setSavedViews(data);
    setLoadingViews(false);
  };

  useEffect(() => {
    loadViews();
    // eslint-disable-next-line
  }, []);

  // Save current view
  const saveView = async () => {
    if (!viewName) return;
    const config = {
      visibleColumns,
      filterRules,
    };
    await supabase.from('datagrid_views').insert([
      {
        user_id: userId,
        org_id: orgId,
        name: viewName,
        config,
      },
    ]);
    setViewName('');
    setViewsAnchorEl(null);
    loadViews();
  };

  // Load a saved view
  const applyView = (view: any) => {
    if (view.config) {
      setVisibleColumns(view.config.visibleColumns || visibleColumns);
      setFilterRules(view.config.filterRules || []);
    }
    setViewsAnchorEl(null);
  };

  // Delete a view
  const deleteView = async (id: string) => {
    await supabase.from('datagrid_views').delete().eq('id', id);
    loadViews();
  };

  // Custom toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer>
      <Tooltip title="Views">
        <IconButton onClick={e => setViewsAnchorEl(e.currentTarget)}>
          <span role="img" aria-label="views">👁️</span>
        </IconButton>
      </Tooltip>
      <Tooltip title="Column Picker">
        <IconButton onClick={handleColumnPickerOpen}>
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Advanced Filter">
        <IconButton onClick={handleFilterBuilderOpen}>
          <FilterListIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bulk Actions">
        <IconButton onClick={handleBulkActionsOpen}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export CSV">
        <IconButton onClick={handleExportCSV}>
          <SaveAltIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export PDF">
        <IconButton onClick={handleExportPDF}>
          <PictureAsPdfIcon />
        </IconButton>
      </Tooltip>
      <GridToolbarExport />
    </GridToolbarContainer>
  );

  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={applyFilters(rows)}
          columns={displayedColumns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25]}
          components={{
            Toolbar: CustomToolbar,
          }}
          checkboxSelection
          onSelectionModelChange={(ids) => {
            const selected = applyFilters(rows).filter((row) =>
              ids.includes(row.id)
            );
            setSelectedRows(selected);
          }}
        />
      </div>
      {/* Column Picker Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleColumnPickerClose}
        PaperProps={{ style: { minWidth: 260 } }}
      >
        <Typography sx={{ px: 2, pt: 1, fontWeight: 600 }}>
          Show/Hide & Reorder Columns
        </Typography>
        <Divider />
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns-droppable">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ maxHeight: 350, overflowY: 'auto' }}
              >
                {visibleColumns.map((field, idx) => {
                  const col = columns.find((c) => c.field === field);
                  if (!col) return null;
                  return (
                    <Draggable key={field} draggableId={field} index={idx}>
                      {(dragProvided, dragSnapshot) => (
                        <MenuItem
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          dense
                          sx={{
                            background: dragSnapshot.isDragging
                              ? 'rgba(0,0,0,0.04)'
                              : undefined,
                            userSelect: 'none',
                          }}
                          onClick={() => handleToggleColumn(field)}
                        >
                          <Checkbox checked={visibleColumns.includes(field)} />
                          <ListItemText primary={col.headerName} />
                        </MenuItem>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <Divider sx={{ mt: 1 }} />
        <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Drag to reorder. Click to show/hide.
        </Typography>
      </Menu>
      {/* Filter Builder */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterBuilderClose}
        PaperProps={{ style: { minWidth: 350 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Advanced Filter Builder
          </Typography>
          <Stack spacing={2}>
            {filterRules.map((rule, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {idx > 0 && (
                  <FormControl size="small" sx={{ minWidth: 70 }}>
                    <Select
                      value={rule.logic || 'AND'}
                      onChange={e =>
                        updateFilterRule(idx, { logic: e.target.value as 'AND' | 'OR' })
                      }
                    >
                      <MuiMenuItem value="AND">AND</MuiMenuItem>
                      <MuiMenuItem value="OR">OR</MuiMenuItem>
                    </Select>
                  </FormControl>
                )}
                <FormControl size="small" sx={{ minWidth: 90 }}>
                  <Select
                    value={rule.field}
                    onChange={e => updateFilterRule(idx, { field: e.target.value })}
                  >
                    {columns.map(col => (
                      <MuiMenuItem key={col.field} value={col.field}>
                        {col.headerName}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <Select
                    value={rule.operator}
                    onChange={e => updateFilterRule(idx, { operator: e.target.value })}
                  >
                    {operators.map(op => (
                      <MuiMenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  value={rule.value}
                  onChange={e => updateFilterRule(idx, { value: e.target.value })}
                  placeholder="Value"
                  sx={{ minWidth: 80 }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeFilterRule(idx)}
                  sx={{ minWidth: 0, px: 1 }}
                >
                  ×
                </Button>
              </Box>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={addFilterRule}
              sx={{ mt: 1 }}
            >
              Add Rule
            </Button>
            {filterRules.length > 0 && (
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={handleFilterBuilderClose}
                sx={{ mt: 1 }}
              >
                Apply Filters
              </Button>
            )}
          </Stack>
        </Box>
      </Menu>
      {/* Bulk Actions */}
      <Menu
        anchorEl={bulkAnchorEl}
        open={Boolean(bulkAnchorEl)}
        onClose={handleBulkActionsClose}
        PaperProps={{ style: { minWidth: 260 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Bulk Actions
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="body2" sx={{ mb: 1 }}>
            Selected: {selectedRows.length}
          </Typography>
          {/* Status assignment (for Events) */}
          {title === 'Events' && (
            <Box sx={{ mb: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={bulkStatus}
                  label="Status"
                  onChange={e => setBulkStatus(e.target.value)}
                >
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                disabled={!bulkStatus || selectedRows.length === 0}
                onClick={() => {
                  // Update status for selected rows (mock, local only)
                  selectedRows.forEach(row => {
                    row.status = bulkStatus;
                  });
                  setBulkStatus('');
                  setBulkAnchorEl(null);
                }}
              >
                Set Status
              </Button>
            </Box>
          )}
          {/* Instructor assignment (for Roster) */}
          {title === 'Roster' && (
            <Box sx={{ mb: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Instructor</InputLabel>
                <Select
                  value={bulkInstructor}
                  label="Instructor"
                  onChange={e => setBulkInstructor(e.target.value)}
                >
                  <MenuItem value="Instructor A">Instructor A</MenuItem>
                  <MenuItem value="Instructor B">Instructor B</MenuItem>
                  <MenuItem value="Instructor C">Instructor C</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                disabled={!bulkInstructor || selectedRows.length === 0}
                onClick={() => {
                  // Update instructor for selected rows (mock, local only)
                  selectedRows.forEach(row => {
                    row.instructor = bulkInstructor;
                  });
                  setBulkInstructor('');
                  setBulkAnchorEl(null);
                }}
              >
                Assign Instructor
              </Button>
            </Box>
          )}
        </Box>
      </Menu>
    </Box>
  );
};

export default AdvancedDataGrid;