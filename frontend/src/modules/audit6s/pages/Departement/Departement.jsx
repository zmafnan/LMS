import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Group, 
  ActionIcon, 
  Card, 
  Modal, 
  TextInput, 
  Select, 
  Title, 
  Paper, 
  Badge, 
  ScrollArea,
  Divider,
  Box,
  Text,
  ThemeIcon
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconBuildingFactory2, 
  IconBuildingSkyscraper,
  IconFilter,
  IconBuilding
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import api from '../../services/api';

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({
    typeFilter: ''
  });

  const form = useForm({
    initialValues: {
      name: '',
      type: ''
    },
    validate: {
      name: (value) => !value && 'Name is required',
      type: (value) => !value && 'Type is required'
    }
  });

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch departments',
        color: 'red'
      });
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (selectedId) {
        await api.put(`/departments/${selectedId}`, values);
      } else {
        await api.post('/departments', values);
      }
      notifications.show({
        title: 'Success',
        message: `Department ${selectedId ? 'updated' : 'created'} successfully`,
        color: 'green'
      });
      setOpened(false);
      form.reset();
      fetchDepartments();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'An error occurred',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department) => {
    setSelectedId(department.id);
    form.setValues(department);
    setOpened(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      notifications.show({
        title: 'Success',
        message: 'Department deleted successfully',
        color: 'green'
      });
      fetchDepartments();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete department',
        color: 'red'
      });
    }
  };

  const filteredDepartments = departments.filter((dept) => {
    const { typeFilter } = filters;
    return typeFilter ? dept.type === typeFilter : true;
  });

  // Count departments by type
  const productionCount = departments.filter(dept => dept.type === 'production').length;
  const nonProductionCount = departments.filter(dept => dept.type === 'non-production').length;

  return (
    <>
      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Group justify="space-between" mb="xl">
          <Group>
            <ThemeIcon size={42} radius="md" color="blue">
              <IconBuilding size={24} />
            </ThemeIcon>
            <Title>Departments</Title>
          </Group>
          <Button
            leftSection={<IconPlus size={16} />}
            size="md"
            onClick={() => {
              setSelectedId(null);
              form.reset();
              setOpened(true);
            }}
          >
            Add Department
          </Button>
        </Group>

        <Group mb="xl" position="apart">
          <Paper p="md" withBorder radius="md" shadow="xs" style={{ flex: 1 }}>
            <Group position="apart">
              <Group>
                <ThemeIcon size="lg" radius="md" color="blue">
                  <IconBuildingFactory2 size={18} />
                </ThemeIcon>
                <Text fw={500}>Production Departments</Text>
              </Group>
              <Badge size="xl" radius="md" color="blue">{productionCount}</Badge>
            </Group>
          </Paper>
          
          <Paper p="md" withBorder radius="md" shadow="xs" style={{ flex: 1 }}>
            <Group position="apart">
              <Group>
                <ThemeIcon size="lg" radius="md" color="teal">
                  <IconBuildingSkyscraper size={18} />
                </ThemeIcon>
                <Text fw={500}>Non-Production Departments</Text>
              </Group>
              <Badge size="xl" radius="md" color="teal">{nonProductionCount}</Badge>
            </Group>
          </Paper>
        </Group>

        {/* Filter Section */}
        <Paper withBorder p="md" radius="md" mb="xl" shadow="xs">
          <Group mb="md">
            <ThemeIcon size="md" radius="md" color="gray" variant="light">
              <IconFilter size={16} />
            </ThemeIcon>
            <Title order={4}>Filters</Title>
          </Group>
          
          <Divider mb="md" />
          
          <Select
            label="Department Type"
            placeholder="Filter by type"
            data={[
              { value: 'production', label: 'Production' },
              { value: 'non-production', label: 'Non-Production' }
            ]}
            value={filters.typeFilter}
            onChange={(value) => setFilters(prev => ({ ...prev, typeFilter: value }))}
            clearable
            w={300}
          />
        </Paper>

        {/* Departments Table */}
        <Paper withBorder p="md" radius="md" shadow="xs">
          <Group mb="md">
            <Title order={4}>Department List</Title>
            <Badge size="lg">
              {filteredDepartments.length} {filteredDepartments.length === 1 ? 'Department' : 'Departments'}
            </Badge>
          </Group>
          
          <Divider mb="md" />
          
          <ScrollArea h={400}>
            <Table highlightOnHover withColumnBorders striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th style={{ width: 120, textAlign: 'center' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept) => (
                    <Table.Tr key={dept.id}>
                      <Table.Td>
                        <Group>
                          <ThemeIcon size="sm" radius="xl" color={dept.type === 'production' ? 'blue' : 'teal'}>
                            {dept.type === 'production' ? 
                              <IconBuildingFactory2 size={14} /> : 
                              <IconBuildingSkyscraper size={14} />
                            }
                          </ThemeIcon>
                          <Text fw={500}>{dept.name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={dept.type === 'production' ? 'blue' : 'teal'}
                          variant="light"
                        >
                          {dept.type === 'production' ? 'Production' : 'Non-Production'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group position="center" spacing="xs">
                          <ActionIcon
                            variant="filled"
                            color="blue"
                            onClick={() => handleEdit(dept)}
                            size="lg"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="filled"
                            color="red"
                            onClick={() => handleDelete(dept.id)}
                            size="lg"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3} style={{ textAlign: 'center', padding: '30px' }}>
                      <Text c="dimmed" size="lg">No departments found</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          form.reset();
          setSelectedId(null);
        }}
        title={
          <Group>
            <ThemeIcon size="md" radius="md" color="blue">
              {selectedId ? <IconEdit size={16} /> : <IconPlus size={16} />}
            </ThemeIcon>
            <Text>{selectedId ? "Edit Department" : "Add Department"}</Text>
          </Group>
        }
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Department Name"
            placeholder="Enter department name"
            {...form.getInputProps('name')}
            mb="md"
            size="md"
          />

          <Select
            label="Department Type"
            placeholder="Select department type"
            data={[
              { value: 'production', label: 'Production', icon: IconBuildingFactory2 },
              { value: 'non-production', label: 'Non-Production', icon: IconBuildingSkyscraper }
            ]}
            {...form.getInputProps('type')}
            mb="xl"
            size="md"
            itemComponent={({ label, icon: Icon }) => (
              <Group>
                <Icon size={14} />
                <span>{label}</span>
              </Group>
            )}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setOpened(false)} size="md">
              Cancel
            </Button>
            <Button type="submit" loading={loading} size="md">
              {selectedId ? 'Update' : 'Create'}
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}
