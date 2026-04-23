import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Container, Row, Col, Form, Button, Card, Alert, Badge, 
  FloatingLabel, Spinner, Tabs, Tab, ButtonGroup 
} from 'react-bootstrap';
import { 
  FaDumbbell, FaRunning, FaFire, 
  FaArrowLeft, FaSave, FaPlus, FaTrashAlt, 
  FaWeightHanging, FaRedo, FaDumbbell as FaDumbbellSolid,
  FaBolt, FaChevronDown, FaChevronUp, FaChevronRight, FaChevronLeft, FaCheck 
} from 'react-icons/fa';
import Auth from '../utils/auth';
import { createResistance } from '../utils/API';
import '../styles/Resistance.css';

// Exercise categories with icons and colors
const exerciseCategories = [
  { 
    value: 'strength', 
    label: 'Strength', 
    icon: <FaDumbbellSolid />, 
    color: '#4e73df',
    description: 'Focus on lifting heavy weights with lower repetitions (3-6 reps)'
  },
  { 
    value: 'hypertrophy', 
    label: 'Muscle Building', 
    icon: <FaDumbbell />, 
    color: '#1cc88a',
    description: 'Moderate weights with moderate repetitions (8-12 reps)'
  },
  { 
    value: 'power', 
    label: 'Power', 
    icon: <FaBolt />, 
    color: '#f6c23e',
    description: 'Explosive movements with lower repetitions (1-5 reps)'
  },
  { 
    value: 'endurance', 
    label: 'Endurance', 
    icon: <FaRedo />, 
    color: '#36b9cc',
    description: 'Lighter weights with higher repetitions (15+ reps)'
  },
  { 
    value: 'warmup', 
    label: 'Warm-up', 
    icon: <FaFire />, 
    color: '#e74a3b',
    description: 'Light activity to prepare for your workout'
  }
];

// Muscle groups with icons and colors
const muscleGroups = [
  { value: 'chest', label: 'Chest', icon: <FaDumbbell />, color: '#e74a3b' },
  { value: 'back', label: 'Back', icon: <FaDumbbell />, color: '#4e73df' },
  { value: 'shoulders', label: 'Shoulders', icon: <FaDumbbell />, color: '#1cc88a' },
  { value: 'biceps', label: 'Biceps', icon: <FaDumbbell />, color: '#f6c23e' },
  { value: 'triceps', label: 'Triceps', icon: <FaDumbbell />, color: '#e74a3b' },
  { value: 'legs', label: 'Legs', icon: <FaRunning />, color: '#4e73df' },
  { value: 'core', label: 'Core', icon: <FaDumbbell />, color: '#1cc88a' },
  { value: 'full body', label: 'Full Body', icon: <FaDumbbell />, color: '#f6c23e' },
  { value: 'bodyweight', label: 'Bodyweight', icon: <FaDumbbell />, color: '#36b9cc' },
  { value: 'other', label: 'Other', icon: <FaDumbbell />, color: '#858796' }
];

// Exercise suggestions by muscle group
const EXERCISE_SUGGESTIONS = {
  chest: ['Bench Press', 'Incline Bench Press', 'Dumbbell Flyes', 'Push-ups', 'Chest Dips'],
  back: ['Pull-ups', 'Deadlifts', 'Bent-over Rows', 'Lat Pulldowns', 'T-Bar Rows'],
  shoulders: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Face Pulls', 'Shrugs'],
  biceps: ['Bicep Curls', 'Tricep Dips', 'Hammer Curls', 'Skull Crushers', 'Preacher Curls'],
  triceps: ['Tricep Dips', 'Skull Crushers', 'Tricep Pushdowns', 'Close Grip Bench', 'Overhead Extensions'],
  legs: ['Squats', 'Lunges', 'Leg Press', 'Romanian Deadlifts', 'Calf Raises'],
  core: ['Sit-ups', 'Planks', 'Leg Raises', 'Russian Twists', 'Hanging Knee Raises'],
  'full body': ['Burpees', 'Kettlebell Swings', 'Box Jumps', 'Battle Ropes', 'Farmer\'s Walk'],
  'bodyweight': ['Push-ups', 'Wide Push-ups', 'Diamond Push-ups', 'Incline Push-ups', 'Decline Push-ups', 'Pike Push-ups', 'Pull-ups', 'Dips', 'Bodyweight Squats', 'Lunges', 'Planks', 'Burpees'],
  other: ['Burpees', 'Kettlebell Swings', 'Box Jumps', 'Battle Ropes', 'Farmer\'s Walk']
};

// Common resistance exercises by muscle group
const commonExercises = {
  chest: ['Barbell Bench Press', 'Dumbbell Flyes', 'Incline Press', 'Cable Crossovers', 'Push-ups'],
  back: ['Deadlifts', 'Pull-ups', 'Bent-over Rows', 'Lat Pulldowns', 'T-Bar Rows'],
  shoulders: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Face Pulls', 'Shrugs'],
  biceps: ['Barbell Curls', 'Dumbbell Curls', 'Hammer Curls', 'Preacher Curls', 'Chin-ups'],
  triceps: ['Tricep Dips', 'Skull Crushers', 'Tricep Pushdowns', 'Close Grip Bench', 'Overhead Extensions'],
  legs: ['Squats', 'Lunges', 'Leg Press', 'Romanian Deadlifts', 'Calf Raises'],
  core: ['Planks', 'Russian Twists', 'Leg Raises', 'Cable Woodchops', 'Hanging Knee Raises'],
  'full body': ['Burpees', 'Kettlebell Swings', 'Clean and Press', 'Thrusters', 'Squat to Press'],
  'bodyweight': ['Push-ups', 'Wide Push-ups', 'Diamond Push-ups', 'Incline Push-ups', 'Decline Push-ups', 'Pike Push-ups', 'Pull-ups', 'Dips', 'Bodyweight Squats', 'Lunges', 'Planks', 'Burpees'],
  other: ['Farmer\'s Walk', 'Battle Ropes', 'Medicine Ball Slams', 'Sled Push', 'Tire Flips']
};

function Resistance() {
  const navigate = useNavigate();
  const [resistanceForm, setResistanceForm] = useState({
    name: '',
    category: 'strength',
    muscleGroup: 'other',
    weight: '',
    sets: '',
    reps: '',
    restPeriod: '60',
    notes: '',
    date: new Date(),
    setsData: [
      { id: 1, weight: '', reps: '', completed: false },
      { id: 2, weight: '', reps: '', completed: false },
      { id: 3, weight: '', reps: '', completed: false }
    ]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const loggedIn = Auth.loggedIn();
  
  // Calculate total reps
  const totalReps = resistanceForm.setsData.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0);
  
  // Calculate average weight
  const avgWeight = resistanceForm.setsData.length > 0
    ? (resistanceForm.setsData.reduce((sum, set) => sum + (parseFloat(set.weight) || 0), 0) / resistanceForm.setsData.length).toFixed(1)
    : 0;
    
  // Calculate total volume
  const totalVolume = resistanceForm.setsData
    .reduce((sum, set) => sum + ((parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0)), 0)
    .toFixed(1);
  
  // Calculate estimated calories (client-side for preview)
  const estimatedCalories = (() => {
    const avgWeight = resistanceForm.setsData.length > 0
      ? resistanceForm.setsData.reduce((sum, set) => sum + (parseFloat(set.weight) || 0), 0) / resistanceForm.setsData.length
      : 0;
    const avgReps = resistanceForm.setsData.length > 0
      ? resistanceForm.setsData.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0) / resistanceForm.setsData.length
      : 0;
    const sets = resistanceForm.setsData.length;
    const restPeriod = parseInt(resistanceForm.restPeriod) || 60;
    
    if (!avgWeight || !avgReps || !sets) return 0;
    
    // Same formula as server-side
    const setTime = sets * 3;
    const restTime = sets * restPeriod;
    const totalWorkoutMinutes = (setTime + restTime) / 60;
    
    const bodyWeightKg = 70;
    const metValue = 6.0;
    const workoutHours = totalWorkoutMinutes / 60;
    
    const baseCalories = metValue * bodyWeightKg * workoutHours;
    const workCalories = (avgWeight * avgReps * sets) * 0.035;
    
    const totalCalories = Math.round(baseCalories + workCalories);
    return Math.max(totalCalories, sets * 5);
  })();
  
  // Get selected category
  const selectedCategory = exerciseCategories.find(cat => cat.value === resistanceForm.category) || exerciseCategories[0];
  
  // Get selected muscle group
  const selectedMuscleGroup = muscleGroups.find(group => group.value === resistanceForm.muscleGroup) || muscleGroups[0];
  
  // Add a new set
  const addSet = () => {
    const newId = resistanceForm.setsData.length > 0 
      ? Math.max(...resistanceForm.setsData.map(s => s.id)) + 1 
      : 1;
      
    setResistanceForm({
      ...resistanceForm,
      setsData: [
        ...resistanceForm.setsData,
        { id: newId, weight: '', reps: '', completed: false }
      ]
    });
  };
  
  // Remove a set by index
  const removeSet = (index) => {
    const newSets = [...resistanceForm.setsData];
    newSets.splice(index, 1);
    setResistanceForm({
      ...resistanceForm,
      setsData: newSets
    });
  };
  
  // Toggle set completion status
  const toggleSetCompletion = (index) => {
    const newSets = [...resistanceForm.setsData];
    newSets[index] = {
      ...newSets[index],
      completed: !newSets[index].completed
    };
    setResistanceForm({
      ...resistanceForm,
      setsData: newSets
    });
  };
  
  // Handle set field changes
  const handleSetChange = (index, field, value) => {
    const newSets = [...resistanceForm.setsData];
    newSets[index] = {
      ...newSets[index],
      [field]: value
    };
    setResistanceForm({
      ...resistanceForm,
      setsData: newSets
    });
    
    // Clear any existing errors when user starts filling sets
    if (error) setError('');
  };
  
  // Handle exercise type selection
  const handleTypeSelect = (exerciseName) => {
    setResistanceForm({
      ...resistanceForm,
      name: exerciseName
    });
    setShowSuggestions(false);
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    setResistanceForm({
      ...resistanceForm,
      category
    });
  };
  
  // Handle muscle group selection
  const handleMuscleGroupSelect = (muscleGroup) => {
    setResistanceForm({
      ...resistanceForm,
      muscleGroup
    });
    // Update exercise suggestions based on muscle group
    setExerciseSuggestions(EXERCISE_SUGGESTIONS[muscleGroup] || []);
  };
  
  // Add multiple sets at once
  const addMultipleSets = (count) => {
    const newSets = [];
    const startId = resistanceForm.setsData.length > 0 
      ? Math.max(...resistanceForm.setsData.map(s => s.id)) + 1 
      : 1;
      
    for (let i = 0; i < count; i++) {
      newSets.push({
        id: startId + i,
        weight: '',
        reps: '',
        completed: false
      });
    }
    
    setResistanceForm({
      ...resistanceForm,
      setsData: [...resistanceForm.setsData, ...newSets]
    });
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setResistanceForm({
      name: '',
      category: 'strength',
      muscleGroup: 'other',
      weight: '',
      sets: '',
      reps: '',
      restPeriod: '60',
      notes: '',
      date: new Date(),
      setsData: [
        { id: 1, weight: '', reps: '', completed: false },
        { id: 2, weight: '', reps: '', completed: false },
        { id: 3, weight: '', reps: '', completed: false }
      ]
    });
  };
  
  // Handle form submission
  const handleResistanceSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Form validation
    if (!resistanceForm.name.trim()) {
      setError('Please enter an exercise name');
      return;
    }
    
    if (resistanceForm.setsData.length === 0) {
      setError('Please add at least one set');
      return;
    }
    
    const hasValidSets = resistanceForm.setsData.some(set => 
      set.reps && parseInt(set.reps) > 0 && 
      (resistanceForm.muscleGroup === 'bodyweight' || (set.weight && parseFloat(set.weight) > 0))
    );
    
    if (!hasValidSets) {
      setError(resistanceForm.muscleGroup === 'bodyweight' 
        ? 'Please fill in reps for at least one set' 
        : 'Please fill in weight and reps for at least one set');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = Auth.loggedIn() ? Auth.getToken() : null;
      
      if (!token) {
        throw new Error('You need to be logged in to save an exercise!');
      }
      
      // Get user ID from token
      const user = Auth.getProfile();
      const userId = user.data._id;
      
      // Format the data for the API
      const exerciseData = {
        name: resistanceForm.name,
        category: resistanceForm.category,
        muscleGroup: resistanceForm.muscleGroup,
        sets: resistanceForm.setsData.length,
        reps: resistanceForm.setsData.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0) / resistanceForm.setsData.length,
        weight: resistanceForm.muscleGroup === 'bodyweight' 
          ? 0 
          : resistanceForm.setsData.reduce((sum, set) => sum + (parseFloat(set.weight) || 0), 0) / resistanceForm.setsData.length,
        restPeriod: parseInt(resistanceForm.restPeriod) || 60,
        notes: resistanceForm.notes,
        date: resistanceForm.date.toISOString(),
        userId: userId, // Add userId here
        setsData: resistanceForm.setsData
      };
      
      const response = await createResistance(exerciseData, token);
      
      // The API function returns the data directly, not a response object
      if (!response) {
        throw new Error('Something went wrong!');
      }
      
      setSuccess('Exercise saved successfully!');
      setTimeout(() => {
        navigate('/history');
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while saving the exercise.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form field changes
  const handleResistanceChange = (e) => {
    const { name, value } = e.target;
    setResistanceForm({
      ...resistanceForm,
      [name]: value
    });
    
    // Clear any existing errors when user starts typing
    if (error) setError('');
    
    // Update exercise suggestions when muscle group changes
    if (name === 'muscleGroup') {
      setExerciseSuggestions(EXERCISE_SUGGESTIONS[value] || []);
    }
  };
  
  // Handle date changes
  
  // Calculate completed sets for average weight calculation

  // Update exercise suggestions when muscle group changes
  useEffect(() => {
    if (resistanceForm.muscleGroup && commonExercises[resistanceForm.muscleGroup]) {
      setExerciseSuggestions(commonExercises[resistanceForm.muscleGroup]);
    }
  }, [resistanceForm.muscleGroup]);


  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <Container className="resistance-page py-4">
      <Button 
        variant="outline-secondary" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-2" /> Back
      </Button>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">
          <span className="exercise-icon" style={{ color: selectedCategory.color }}>
            {selectedCategory.icon}
          </span>
          {resistanceForm.name || 'New Resistance Exercise'}
        </h2>
        
        <div>
          <Badge bg="light" text="dark" className="me-2" style={{ backgroundColor: selectedCategory.color + '20', color: selectedCategory.color }}>
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
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
              
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
                fill
              >
                <Tab eventKey="details" title="Exercise Details">
                  <Form onSubmit={handleResistanceSubmit} className="mt-3">
                    <div className="mb-4">
                      <h5 className="mb-3">Exercise Information</h5>
                      
                      {/* Exercise Name with Suggestions */}
                      <Form.Group className="mb-3 position-relative">
                        <FloatingLabel controlId="exerciseName" label="Exercise Name">
                          <Form.Control
                            type="text"
                            name="name"
                            value={resistanceForm.name}
                            onChange={handleResistanceChange}
                            placeholder=" "
                            autoComplete="off"
                            onFocus={() => setShowSuggestions(true)}
                            required
                          />
                        </FloatingLabel>
                        
                        {showSuggestions && exerciseSuggestions.length > 0 && (
                          <div className="suggestions-dropdown">
                            <div className="suggestions-header p-2 border-bottom">
                              <small className="text-muted">Common {selectedMuscleGroup.label} Exercises</small>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 ms-2"
                                onClick={() => setShowSuggestions(false)}
                              >
                                <FaChevronUp size={12} />
                              </Button>
                            </div>
                            <div className="suggestions-list">
                              {exerciseSuggestions.map((exercise, idx) => (
                                <div 
                                  key={idx} 
                                  className="suggestion-item p-2"
                                  onClick={() => handleTypeSelect(exercise)}
                                >
                                  {exercise}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Form.Group>
                      
                      {/* Exercise Category */}
                      <div className="mb-4">
                        <h6 className="mb-3">Exercise Type</h6>
                        <div className="exercise-type-selector">
                          {exerciseCategories.map((category) => (
                            <div 
                              key={category.value}
                              className={`exercise-type-option ${resistanceForm.category === category.value ? 'active' : ''}`}
                              onClick={() => handleCategorySelect(category.value)}
                              style={{
                                '--option-color': category.color,
                                borderColor: resistanceForm.category === category.value ? category.color : 'transparent'
                              }}
                            >
                              <div className="exercise-type-icon" style={{ color: category.color }}>
                                {category.icon}
                              </div>
                              <span>{category.label}</span>
                            </div>
                          ))}
                        </div>
                        <Form.Text className="text-muted">
                          {selectedCategory.description}
                        </Form.Text>
                      </div>
                      
                      {/* Muscle Group */}
                      <div className="mb-4">
                        <h6 className="mb-3">Target Muscle Group</h6>
                        <div className="muscle-group-selector d-flex flex-wrap gap-2">
                          {muscleGroups.map((group) => (
                            <Button
                              key={group.value}
                              variant={resistanceForm.muscleGroup === group.value ? 'primary' : 'outline-secondary'}
                              className="d-flex align-items-center gap-2"
                              onClick={() => handleMuscleGroupSelect(group.value)}
                              style={{
                                '--option-color': group.color,
                                borderColor: resistanceForm.muscleGroup === group.value ? group.color : 'var(--bs-gray-300)'
                              }}
                            >
                              {group.icon}
                              {group.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Rest Period */}
                      <div className="mb-4">
                        <h6 className="mb-3">Rest Period</h6>
                        <div className="d-flex align-items-center gap-3">
                          <div className="flex-grow-1">
                            <Form.Range
                              min="0"
                              max="300"
                              step="15"
                              value={resistanceForm.restPeriod}
                              onChange={(e) => handleResistanceChange({
                                target: { name: 'restPeriod', value: e.target.value }
                              })}
                            />
                          </div>
                          <div className="text-nowrap" style={{ width: '80px' }}>
                            <Form.Control
                              type="number"
                              name="restPeriod"
                              value={resistanceForm.restPeriod}
                              onChange={handleResistanceChange}
                              min="0"
                              step="15"
                              className="text-center"
                            />
                            <Form.Text className="d-block text-center small">
                              seconds
                            </Form.Text>
                          </div>
                        </div>
                      </div>
                      
                      {/* Notes */}
                      <div className="mb-4">
                        <h6 className="mb-3">Notes</h6>
                        <FloatingLabel controlId="notes" label="Any additional notes about this exercise">
                          <Form.Control
                            as="textarea"
                            name="notes"
                            value={resistanceForm.notes}
                            onChange={handleResistanceChange}
                            style={{ height: '100px' }}
                            placeholder="Technique cues, variations, or other notes..."
                          />
                        </FloatingLabel>
                      </div>
                      
                      <div className="d-flex justify-content-end mt-4">
                        <Button 
                          variant="primary" 
                          onClick={() => setActiveTab('sets')}
                          className="d-flex align-items-center gap-2"
                        >
                          Continue to Sets <FaChevronRight />
                        </Button>
                      </div>
                    </div>
                  </Form>
                </Tab>
                
                <Tab eventKey="sets" title="Sets & Reps">
                  <div className="mt-3">
                    <h5 className="mb-4">Track Your Sets</h5>
                    
                    {/* Exercise Summary */}
                    <div className="exercise-summary mb-4 p-3 rounded" style={{ backgroundColor: selectedCategory.color + '15' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">{resistanceForm.name || 'Your Exercise'}</h6>
                        <Badge bg="light" text="dark" style={{ backgroundColor: selectedCategory.color + '30' }}>
                          {selectedCategory.label}
                        </Badge>
                      </div>
                      <div className="exercise-stats">
                        <div className="stat-card">
                          <div className="stat-value" style={{ color: selectedCategory.color }}>
                            {resistanceForm.setsData.length}
                          </div>
                          <div className="stat-label">Sets</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value" style={{ color: selectedCategory.color }}>
                            {totalReps}
                          </div>
                          <div className="stat-label">Total Reps</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value" style={{ color: selectedCategory.color }}>
                            {avgWeight || '0'}
                          </div>
                          <div className="stat-label">Avg. Weight (kg)</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value" style={{ color: selectedCategory.color }}>
                            {totalVolume}
                          </div>
                          <div className="stat-label">Total Volume (kg)</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value" style={{ color: selectedCategory.color }}>
                            {estimatedCalories}
                          </div>
                          <div className="stat-label">Est. Calories</div>
                        </div>
                      </div>
                    </div>
                    {/* Sets List */}
                    <div className="sets-list mb-4">
                      {resistanceForm.setsData.map((set, index) => (
                        <div key={set.id} className={`set-group mb-3 p-3 rounded ${set.completed ? 'completed' : ''}`} 
                          style={{ backgroundColor: set.completed ? selectedCategory.color + '10' : 'var(--bs-light)' }}>
                          
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center">
                              <h6 className="mb-0 me-2">Set {index + 1}</h6>
                              {set.completed && (
                                <Badge bg="success" className="d-flex align-items-center">
                                  <FaCheck className="me-1" /> Completed
                                </Badge>
                              )}
                            </div>
                            <div className="d-flex align-items-center">
                              <Form.Check
                                type="switch"
                                id={`set-${set.id}-completed`}
                                checked={set.completed}
                                onChange={() => toggleSetCompletion(index)}
                                label=""
                                className="me-3"
                              />
                              {resistanceForm.setsData.length > 1 && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); removeSet(index); }}
                                  className="p-0 px-2"
                                >
                                  <FaTrashAlt size={12} />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>
                                  {resistanceForm.muscleGroup === 'bodyweight' ? 'Type' : 'Weight (kg)'}
                                </Form.Label>
                                <div className="input-group">
                                  {resistanceForm.muscleGroup === 'bodyweight' ? (
                                    <Form.Control
                                      type="text"
                                      value="Bodyweight"
                                      disabled
                                      className="bg-light"
                                    />
                                  ) : (
                                    <>
                                      <Form.Control
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={set.weight}
                                        onChange={(e) => handleSetChange(index, 'weight', e.target.value)}
                                        placeholder="0.0"
                                        disabled={set.completed}
                                        className={set.completed ? 'bg-light' : ''}
                                      />
                                      <span className="input-group-text">kg</span>
                                    </>
                                  )}
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Reps</Form.Label>
                                <div className="input-group">
                                  <Form.Control
                                    type="number"
                                    min="1"
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(index, 'reps', e.target.value)}
                                    placeholder="10"
                                    disabled={set.completed}
                                    className={set.completed ? 'bg-light' : ''}
                                  />
                                  <span className="input-group-text">reps</span>
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex flex-column justify-content-end">
                              <div className="volume-badge p-2 text-center rounded" 
                                style={{ backgroundColor: selectedCategory.color + '20' }}>
                                <div className="small text-muted">Volume</div>
                                <div className="fw-bold" style={{ color: selectedCategory.color }}>
                                  {((parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0)).toFixed(1)} kg
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Set Button */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button 
                        variant="outline-primary" 
                        onClick={addSet}
                        className="d-flex align-items-center gap-2"
                      >
                        <FaPlus /> Add Set
                      </Button>
                      
                      <div className="d-flex align-items-center">
                        <span className="me-2">Quick Add:</span>
                        <ButtonGroup size="sm">
                          {[1, 3, 5].map(num => (
                            <Button 
                              key={num} 
                              variant="outline-secondary"
                              onClick={() => addMultipleSets(num)}
                            >
                              {num} Set{num > 1 ? 's' : ''}
                            </Button>
                          ))}
                        </ButtonGroup>
                      </div>
                    </div>
                    
                    {/* Form Actions */}
                    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setActiveTab('details')}
                        className="d-flex align-items-center gap-2"
                      >
                        <FaChevronLeft /> Back to Details
                      </Button>
                      
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-secondary" 
                          onClick={resetForm}
                          className="d-flex align-items-center gap-2"
                        >
                          <FaRedo /> Reset
                        </Button>
                        
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={isSubmitting}
                          className="d-flex align-items-center gap-2"
                          onClick={handleResistanceSubmit}
                        >
                          {isSubmitting ? (
                            <>
                              <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" className="me-1" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave /> Save Exercise
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Resistance;
