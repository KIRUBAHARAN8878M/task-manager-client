import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';


export const fetchTasks = createAsyncThunk(
    'task/fetchTasks',
    async ({ page = 1, limit = 5 } = {}, thunkAPI) => {
      try {
        const res = await api.get(`/tasks?page=${page}&limit=${limit}`);
        return res.data; 
      } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Error fetching tasks');
      }
    }
  );
export const createTask = createAsyncThunk('task/createTask', async (data) => {
  const res = await api.post('/tasks', data);
  return res.data;
});

export const updateTask = createAsyncThunk('task/updateTask', async ({ id, data }) => {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data;
});

export const deleteTask = createAsyncThunk('task/deleteTask', async (id) => {
  await api.delete(`/tasks/${id}`);
  return id;
});

const taskSlice = createSlice({
  name: 'task',
  initialState: {
    tasks: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
    .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
      });
  },
});

export default taskSlice.reducer;
