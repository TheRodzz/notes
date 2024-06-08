import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import NoteCard from '../../components/Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import AddEditNotes from './AddEditNotes';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import noData from '../../assets/images/no-data.svg';
import addNotesImg from '../../assets/images/add-notes.svg';
import ClipLoader from "react-spinners/ClipLoader"; // Import the spinner

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darken the overlay for better contrast
    zIndex: 1000, // Ensure the modal is on top of other elements
  },
  content: {
    width: '90%', // Default width for mobile
    maxWidth: '500px', // Maximum width for larger screens
    height: 'auto', // Adjust height automatically based on content
    maxHeight: '80vh', // Maximum height to avoid overflow on small screens
    margin: 'auto', // Center the modal
    borderRadius: '10px', // Rounded corners
    padding: '20px', // Padding inside the modal
    backgroundColor: 'white', // Background color
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Drop shadow for lifted appearance
    overflow: 'auto', // Enable scrolling for overflowing content
  },
};

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: '',
    type: 'add',
  });

  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const [isSearch, setIsSearch] = useState(false);

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShown: true,
      data: noteDetails,
      type: 'edit',
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: '',
    });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const getAllNotes = async () => {
    setLoading(true); // Set loading to true
    try {
      const response = await axiosInstance.get('/get-all-notes');
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log('An unexpected error occurred');
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete('/delete-note/' + noteId);
      if (response.data && !response.data.error) {
        showToastMessage('Note deleted successfully', 'delete');
        setAllNotes(allNotes.filter(note => note._id !== noteId));
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.log("An unexpected error occurred. Please try again");
      }
    }
  };

  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get('/search-notes', {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  const updateIsPinned = async (noteData) => {
    try {
      const noteId = noteData._id;
      const response = await axiosInstance.put('/update-note-pinned/' + noteId, {
        isPinned: !noteData.isPinned
      });
      if (response.data && response.data.note) {
        showToastMessage('Note updated successfully');
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />
      <div className='container mx-auto'>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <ClipLoader size={50} color={"#123abc"} loading={loading} />
          </div>
        ) : (
          <>
            {allNotes.length > 0 ? (
              <div className='grid grid-cols-3 gap-4 mt-8'>
                {allNotes.map((item) => (
                  <NoteCard
                    title={item.title}
                    key={item._id}
                    date={item.createdOn}
                    content={item.content}
                    tags={item.tags}
                    isPinned={item.isPinned}
                    onEdit={() => { handleEdit(item) }}
                    onDelete={() => { deleteNote(item) }}
                    onPinNote={() => { updateIsPinned(item) }}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard
                imgSrc={isSearch ? noData : addNotesImg}
                message={isSearch ? 'Oops! No matching notes found' : 'Start writing your first note! Click the add button to jot down your thoughts, ideas, and reminders.'}
              />
            )}
          </>
        )}
      </div>
      <button className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10'
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: "add",
            data: null,
          })
        }}>
        <MdAdd className='text-[32px] text-white' />
      </button>
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => { }}
        style={customStyles}
        contentLabel=''
        className='w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll'
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({
              isShown: false,
              type: "add",
              data: null,
            })
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
}

export default Home;