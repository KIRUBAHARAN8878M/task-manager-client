import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "../features/task/taskSlice";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.task || {});
  const { user } = useSelector((state) => state.auth);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "Pending",
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5; // Customize as needed

  useEffect(() => {
    dispatch(fetchTasks({ page, limit }));
  }, [dispatch, page]);

  const handleEdit = (task) => {
    setEditId(task._id);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    try {
      if (editId) {
        await dispatch(updateTask({ id: editId, data: taskForm })).unwrap();
        toast.success("Task updated successfully!");
      } else {
        await dispatch(createTask(taskForm)).unwrap();
        toast.success("Task created successfully!");
      }
      setTaskForm({ title: "", description: "", status: "Pending" });
      setEditId(null);
      setShowModal(false);
    } catch (err) {
      toast.error("Something went wrong while saving the task.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await dispatch(deleteTask(id)).unwrap();
        toast.success("Task deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete the task.");
      }
    }
  };
  console.log("task user check", user);
  const visibleTasks =
    user.role === "Admin"
      ? tasks
      : tasks.filter((task) => task.createdBy === user._id);

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <button
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setTaskForm({ title: "", description: "", status: "Pending" });
            }}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5 text-white" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditId(null);
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h3 className="text-xl font-semibold mb-4">
                {editId ? "Edit Task" : "Create Task"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Title *"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className={`w-full border p-2 rounded ${
                    !taskForm.title.trim() && "border-red-500"
                  }`}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
                <select
                  name="status"
                  value={taskForm.status}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, status: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  {editId ? "Update Task" : "Create Task"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <p>Loading tasks...</p>
          ) : visibleTasks.length === 0 ? (
            <p className="text-gray-500 italic">No tasks found.</p>
          ) : (
            visibleTasks.map((task) => (
              <div
                key={task._id}
                className="border p-4 rounded shadow relative"
              >
                <h3 className="text-lg font-bold">{task.title}</h3>
                <p>{task.description}</p>
                <p>
                  Status: <strong>{task.status}</strong>
                </p>
                {(user.role === "Admin" || user._id === task.createdBy) && (
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-yellow-500 hover:text-yellow-600"
                      title="Edit"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {/* Pagination Controls */}
        {tasks.length > 0 && (
          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">Page {page}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={tasks.length < limit}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
