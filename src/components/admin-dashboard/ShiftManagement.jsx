import React, { useState, useEffect } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import Modal from "react-modal";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FloatingContainer = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-in-out;
  padding: 1rem 2rem;  /* <-- Add this */
`;

const CenteredTableWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const FloatingTable = styled.table`
  width: 98%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  margin: 1.5rem 0;
  th, td {
    padding: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  th {
    background: rgba(27, 43, 60, 0.9);
    color: white;
  }
`;

const FloatingButton = styled.button`
  background: ${props => props.danger ? 'rgba(231, 76, 60, 0.9)' : 'rgba(27, 43, 60, 0.9)'};
  color: white;
  border: none;
  padding: ${props => props.small ? '0.5rem 1rem' : '0.8rem 1.5rem'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 0.5rem;
  &:hover {
    background: ${props => props.danger ? 'rgba(231, 76, 60, 1)' : 'rgba(27, 43, 60, 1)'};
    transform: translateY(-2px);
  }
`;

const ActionSection = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0 2rem 0; 
`;

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  min-width: 500px;
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.8);
  }
  input, select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.8);
    &:focus {
      outline: 2px solid rgba(27, 43, 60, 0.5);
    }
  }
`;

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(5px)"
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    background: 'none',
    border: 'none',
    padding: '0'
  }
};

const ShiftManagement = () => {
  const [shiftTypes, setShiftTypes] = useState([]);
  const [showShiftTypeModal, setShowShiftTypeModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const shiftTypesRes = await api.get("/shift-types");
        setShiftTypes(shiftTypesRes?.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShiftTypeSubmit = async () => {
    const newErrors = {};
    if (!formData.shiftname) newErrors.shiftname = "Required";
    if (!formData.defaultduration || formData.defaultduration < 1) 
      newErrors.defaultduration = "Must be at least 1 hour";

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      const method = isEditMode ? "put" : "post";
      const url = isEditMode ? `/shift-types/${formData.id}` : "/shift-types";
      
      // Create payload without UUID field for POST
      const payload = {
        shiftname: formData.shiftname,
        defaultduration: formData.defaultduration,
        shiftcategory: formData.shiftcategory
      };

      const { data } = await api[method](url, isEditMode ? payload : formData);
      
      setShiftTypes(prev => isEditMode ? 
        prev.map(st => st.id === data.id ? data : st) : 
        [...prev, data]
      );
      setShowShiftTypeModal(false);
      setFormData({});
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Operation failed" });
    }
  };

  const handleDeleteShiftType = async (id) => {
    if (!id) {
      console.error('No shift type ID provided');
      setError('Cannot delete: Invalid shift type ID');
      return;
    }

    try {
      console.log('Deleting shift type with ID:', id);
      await api.delete(`/shift-types/${id}`);
      setShiftTypes(prev => prev.filter(st => st.shifttypeid !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting shift type:', err);
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleEditShiftType = (shiftType) => {
    setFormData({
      id: shiftType.id, // UUID should come from backend
      shiftname: shiftType.shiftname,
      defaultduration: shiftType.defaultduration,
      shiftcategory: shiftType.shiftcategory
    });
    setIsEditMode(true);
    setShowShiftTypeModal(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <FloatingContainer>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}

      <ActionSection>
        <FloatingButton onClick={() => setShowShiftTypeModal(true)}>
          + New Shift Type
        </FloatingButton>
      </ActionSection>

      <CenteredTableWrapper>
        <FloatingTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration (h)</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shiftTypes.map(type => (
              <tr key={type.id}>
                <td>{type.shiftname}</td>
                <td>{type.defaultduration}</td>
                <td>{type.shiftcategory || '-'}</td>
                <td>
                  <FloatingButton small onClick={() => handleEditShiftType(type)}>
                    Edit
                  </FloatingButton>
                  <FloatingButton 
                    small 
                    danger 
                    onClick={() => handleDeleteShiftType(type.shifttypeid)}
                  >
                    Delete
                  </FloatingButton>
                </td>
              </tr>
            ))}
          </tbody>
        </FloatingTable>
      </CenteredTableWrapper>

      {/* Shift Type Modal */}
      <Modal
        isOpen={showShiftTypeModal}
        onRequestClose={() => {
          setShowShiftTypeModal(false);
          setFormData({});
          setErrors({});
        }}
        style={customStyles}
      >
        <ModalContent>
          <h3>{isEditMode ? 'Edit' : 'Create New'} Shift Type</h3>
          <FormField>
            <label>Shift Name</label>
            <input
              value={formData.shiftname || ''}
              onChange={e => setFormData({...formData, shiftname: e.target.value})}
            />
            {errors.shiftname && <div style={{ color: 'red' }}>{errors.shiftname}</div>}
          </FormField>
          <FormField>
            <label>Default Duration (hours)</label>
            <input
              type="number"
              value={formData.defaultduration || ''}
              onChange={e => setFormData({...formData, defaultduration: parseInt(e.target.value) || 0})}
              min="1"
            />
            {errors.defaultduration && <div style={{ color: 'red' }}>{errors.defaultduration}</div>}
          </FormField>
          <FormField>
            <label>Category</label>
            <select
              value={formData.shiftcategory || ''}
              onChange={e => setFormData({...formData, shiftcategory: e.target.value})}
            >
              <option value="">Select Category</option>
              <option value="Normal">Normal</option>
              <option value="Overtime">Overtime</option>
            </select>
          </FormField>
          {errors.submit && <div style={{ color: 'red' }}>{errors.submit}</div>}
          <ActionSection>
            <FloatingButton onClick={handleShiftTypeSubmit}>
              {isEditMode ? 'Update' : 'Create'}
            </FloatingButton>
            <FloatingButton onClick={() => {
              setShowShiftTypeModal(false);
              setFormData({});
              setErrors({});
            }}>
              Cancel
            </FloatingButton>
          </ActionSection>
        </ModalContent>
      </Modal>
    </FloatingContainer>
  );
};

export default ShiftManagement;