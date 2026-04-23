import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  Container, Row, Col, Form, Button, 
  Card, Alert, Spinner, 
  FloatingLabel, Badge
} from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  FaArrowLeft, FaRunning, FaBicycle, 
  FaSwimmer, FaShip, FaWalking, 
  FaFireAlt, FaHeartbeat, FaMountain, 
  FaSave, FaStopwatch
} from 'react-icons/fa';
import Auth from "../utils/auth";
import { createCardio } from '../utils/API';
import '../styles/Cardio.css';

// Cardio exercise types with icons and colors
const cardioTypes = [
  { value: 'Running', label: 'Running', icon: <FaRunning />, color: '#4e73df' },
  { value: 'Cycling', label: 'Cycling', icon: <FaBicycle />, color: '#1cc88a' },
  { value: 'Swimming', label: 'Swimming', icon: <FaSwimmer />, color: '#36b9cc' },
  { value: 'Rowing', label: 'Rowing', icon: <FaShip />, color: '#f6c23e' },
  { value: 'Walking', label: 'Walking', icon: <FaWalking />, color: '#e74a3b' },
  { value: 'Elliptical', label: 'Elliptical', icon: <FaRunning />, color: '#6f42c1' },
  { value: 'Stair Climber', label: 'Stair Climber', icon: <FaMountain />, color: '#fd7e14' },
  { value: 'Jump Rope', label: 'Jump Rope', icon: <FaFireAlt />, color: '#e83e8c' },
  { value: 'Other', label: 'Other', icon: <FaFireAlt />, color: '#858796' }
];

const cardioCategories = [
  { 
    value: 'steady_state', 
    label: 'Steady State',
    description: 'Maintaining a consistent pace and intensity',
    icon: <FaStopwatch />
  },
  { 
    value: 'hiit', 
    label: 'HIIT',
    description: 'High-Intensity Interval Training',
    icon: <FaFireAlt />
  },
  { 
    value: 'intervals', 
    label: 'Intervals',
    description: 'Structured work/rest periods',
    icon: <FaStopwatch />
  },
  { 
    value: 'fartlek', 
    label: 'Fartlek',
    description: 'Speed play with varying intensity',
    icon: <FaRunning />
  },
  { 
    value: 'recovery', 
    label: 'Recovery',
    description: 'Low intensity active recovery',
    icon: <FaHeartbeat />
  }
];

export default function Cardio() {
  const navigate = useNavigate();
  const loggedIn = Auth.loggedIn();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [cardioForm, setCardioForm] = useState({
    name: "Running",
    category: "steady_state",
    distance: "",
    duration: "",
    intensity: 5,
    caloriesBurned: "",
    avgHeartRate: "",
    elevationGain: "",
    notes: "",
    date: new Date()
  });

  // Calculate calories if distance and duration are provided
  useEffect(() => {
    if (cardioForm.distance && cardioForm.duration) {
      // Simple estimation - in a real app, use a more accurate formula
      const calories = Math.round((parseFloat(cardioForm.distance) * 100) + 
                     (parseFloat(cardioForm.duration) * 5) * 
                     (cardioForm.intensity / 5));
      setCardioForm(prev => ({
        ...prev,
        caloriesBurned: isNaN(calories) ? '' : calories.toString()
      }));
    }
  }, [cardioForm.distance, cardioForm.duration, cardioForm.intensity]);

  const handleCardioChange = (event) => {
    const { name, value } = event.target;
    setCardioForm({ ...cardioForm, [name]: value });
  };
  
  const handleIntensityChange = (value) => {
    setCardioForm({ ...cardioForm, intensity: parseInt(value, 10) });
  };
  
  const handleDateChange = (date) => {
    setCardioForm({ ...cardioForm, date });
  };
  
  const handleTypeSelect = (type) => {
    setCardioForm({ ...cardioForm, name: type });
  };
  
  const handleCategorySelect = (category) => {
    setCardioForm({ ...cardioForm, category });
  };

  const validateForm = () => {
    if (!cardioForm.name) {
      setError('Please select an exercise type');
      return false;
    }
    if (!cardioForm.distance) {
      setError('Please enter distance');
      return false;
    }
    if (!cardioForm.duration) {
      setError('Please enter duration');
      return false;
    }
    if (!cardioForm.date) {
      setError('Please select a date');
      return false;
    }
    return true;
  };

  const handleCardioSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const token = Auth.getToken();
      if (!token) throw new Error('Not authenticated');
      
      const userId = Auth.getUserId();
      const submissionData = {
        ...cardioForm,
        userId,
        date: cardioForm.date.toISOString()
      };
      
      const response = await createCardio(submissionData, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save workout');
      }
      
      setSuccess('Workout saved successfully!');
      
      // Reset form but keep exercise type and category
      setCardioForm({
        ...cardioForm,
        distance: "",
        duration: "",
        caloriesBurned: "",
        avgHeartRate: "",
        elevationGain: "",
        notes: "",
        date: new Date()
      });
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error saving workout:', err);
      setError(err.message || 'Failed to save workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

  const selectedExercise = cardioTypes.find(t => t.value === cardioForm.name) || cardioTypes[0];
  const selectedCategory = cardioCategories.find(c => c.value === cardioForm.category) || cardioCategories[0];

  return (
    <Container className="cardio-page py-4">
      <Button 
        variant="outline-secondary" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-2" /> Back
      </Button>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <span className="exercise-icon" style={{ color: selectedExercise.color }}>
            {selectedExercise.icon}
          </span>
          {selectedExercise.label} Workout
        </h2>
        
        <div>
          <Badge bg="light" text="dark" className="me-2">
            {selectedCategory.label}
          </Badge>
          <Badge bg="light" text="dark">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </Badge>
        </div>
      </div>
      
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="mb-4">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleCardioSubmit}>
                <div className="mb-4">
                  <h5 className="mb-3">Exercise Type</h5>
                  <div className="exercise-type-selector">
                    {cardioTypes.map((type) => (
                      <div 
                        key={type.value}
                        className={`exercise-type-option ${cardioForm.name === type.value ? 'active' : ''}`}
                        onClick={() => handleTypeSelect(type.value)}
                        style={{
                          '--option-color': type.color,
                          borderColor: cardioForm.name === type.value ? type.color : 'transparent'
                        }}
                      >
                        <div className="exercise-type-icon">
                          {type.icon}
                        </div>
                        <span>{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-3">Workout Details</h5>
                  <Row className="g-3">
                    <Col md={6}>
                      <FloatingLabel controlId="distance" label="Distance (miles)" className="mb-3">
                        <Form.Control
                          type="number"
                          name="distance"
                          value={cardioForm.distance}
                          onChange={handleCardioChange}
                          min="0"
                          step="0.1"
                          placeholder=" "
                          required
                        />
                      </FloatingLabel>
                    </Col>
                    
                    <Col md={6}>
                      <FloatingLabel controlId="duration" label="Duration (minutes)" className="mb-3">
                        <Form.Control
                          type="number"
                          name="duration"
                          value={cardioForm.duration}
                          onChange={handleCardioChange}
                          min="0"
                          step="1"
                          placeholder=" "
                          required
                        />
                      </FloatingLabel>
                    </Col>
                    
                    <Col xs={12}>
                      <Form.Label>Intensity: <strong>{cardioForm.intensity}/10</strong></Form.Label>
                      <Form.Range
                        min="1"
                        max="10"
                        value={cardioForm.intensity}
                        onChange={(e) => handleIntensityChange(e.target.value)}
                        className="mb-3"
                      />
                      <div className="d-flex justify-content-between text-muted small">
                        <span>Light</span>
                        <span>Moderate</span>
                        <span>Intense</span>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <FloatingLabel controlId="caloriesBurned" label="Calories Burned" className="mb-3">
                        <Form.Control
                          type="number"
                          name="caloriesBurned"
                          value={cardioForm.caloriesBurned}
                          onChange={handleCardioChange}
                          min="0"
                          placeholder=" "
                        />
                      </FloatingLabel>
                    </Col>
                    
                    <Col md={6}>
                      <FloatingLabel controlId="avgHeartRate" label="Avg. Heart Rate (bpm)" className="mb-3">
                        <Form.Control
                          type="number"
                          name="avgHeartRate"
                          value={cardioForm.avgHeartRate}
                          onChange={handleCardioChange}
                          min="0"
                          placeholder=" "
                        />
                      </FloatingLabel>
                    </Col>
                    
                    <Col xs={12}>
                      <FloatingLabel controlId="elevationGain" label="Elevation Gain (feet)" className="mb-3">
                        <Form.Control
                          type="number"
                          name="elevationGain"
                          value={cardioForm.elevationGain}
                          onChange={handleCardioChange}
                          min="0"
                          placeholder=" "
                        />
                      </FloatingLabel>
                    </Col>
                    
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Workout Type</Form.Label>
                        <div className="category-selector d-flex flex-wrap gap-2">
                          {cardioCategories.map((category) => (
                            <Button
                              key={category.value}
                              variant={cardioForm.category === category.value ? 'primary' : 'outline-secondary'}
                              className="d-flex align-items-center gap-2"
                              onClick={() => handleCategorySelect(category.value)}
                            >
                              {category.icon}
                              {category.label}
                            </Button>
                          ))}
                        </div>
                        <Form.Text className="text-muted">
                          {selectedCategory.description}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date & Time</Form.Label>
                        <DatePicker
                          selected={cardioForm.date}
                          onChange={handleDateChange}
                          className="form-control"
                          showTimeSelect
                          timeFormat="h:mm aa"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          timeCaption="Time"
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col xs={12}>
                      <FloatingLabel controlId="notes" label="Notes (optional)">
                        <Form.Control
                          as="textarea"
                          name="notes"
                          value={cardioForm.notes}
                          onChange={handleCardioChange}
                          style={{ height: '100px' }}
                          placeholder="How did it go? Any additional notes..."
                        />
                      </FloatingLabel>
                    </Col>
                  </Row>
                </div>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate(-1)}
                    className="me-md-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Workout
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="text-center text-muted small">
            <p>Your workout data will be saved to your fitness history.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
