import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { getMe, updateResistanceExercise, updateCardio } from '../utils/API';
import Auth from "../utils/auth"
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Spinner, Form, InputGroup, Dropdown, ButtonGroup
} from 'react-bootstrap';
import { 
  FaCalendarAlt, FaFilter, FaSearch, FaSortAmountDown, 
  FaPlus, FaRunning, FaDumbbell, FaClock, FaList, FaCheck, FaChartLine
} from 'react-icons/fa';
import ProgressAnalytics from '../components/ProgressAnalytics';
import '../styles/History.css';

// ExerciseCard component to display individual exercise items
const ExerciseCard = ({ exercise, onViewDetails, onToggleComplete, isUpdating = false }) => {
  const isCardio = exercise.type === 'cardio';
  const exerciseDate = parseISO(exercise.date);
  // Default to false if not explicitly set to true
  const isCompleted = exercise.completed === true;
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleToggle = async () => {
    if (isProcessing || !onToggleComplete) return;
    
    try {
      setIsProcessing(true);
      await onToggleComplete(exercise._id, !isCompleted);
    } catch (error) {
      console.error('Error toggling completion:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className={`mb-3 exercise-card ${isCompleted ? 'border-success' : ''} ${isProcessing ? 'opacity-75' : ''}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <div 
              className={`icon-circle me-3 ${isCardio ? 'bg-soft-primary' : 'bg-soft-info'} ${isCompleted ? 'completed-exercise' : ''} ${isProcessing ? 'opacity-50' : ''}`}
              onClick={handleToggle}
              style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
            >
              {isProcessing ? (
                <div className="spinner-border spinner-border-sm text-white" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : isCompleted ? (
                <div className="checkmark">
                  <FaCheck className="text-white" />
                </div>
              ) : isCardio ? (
                <FaRunning className="text-primary" />
              ) : (
                <FaDumbbell className="text-info" />
              )}
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0 d-flex align-items-center">
                {exercise.name}
                {isCompleted && (
                  <Badge bg="success" className="ms-2" pill>Completed</Badge>
                )}
              </h5>
              <small className="text-muted">
                {format(exerciseDate, 'MMM d, yyyy')} • {format(exerciseDate, 'h:mm a')}
              </small>
            </div>
          </div>
          <Badge bg={isCompleted ? 'success' : isCardio ? 'primary' : 'info'} className="text-uppercase">
            {exercise.type}
          </Badge>
        </div>
        
        <div className="d-flex justify-content-between mt-3">
          {isCardio ? (
            <div className="text-center">
              <div className="text-muted small">Distance</div>
              <div className="fw-bold">{exercise.distance} km</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-muted small">Sets x Reps</div>
              <div className="fw-bold">{exercise.sets} x {exercise.reps}</div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-muted small">Duration</div>
            <div className="fw-bold">{exercise.duration} min</div>
          </div>
          
          <div className="text-center">
            <div className="text-muted small">Calories</div>
            <div className="fw-bold">{exercise.calories || '--'}</div>
          </div>
          
          <div className="d-flex gap-2">
            <Button 
              variant={isCompleted ? "outline-success" : "outline-primary"} 
              size="sm"
              onClick={handleToggle}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  {isCompleted ? 'Marking Incomplete...' : 'Marking Complete...'}
                </>
              ) : isCompleted ? (
                'Mark Incomplete'
              ) : (
                'Mark Complete'
              )}
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => onViewDetails(exercise)}
              disabled={isProcessing}
            >
              Details
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default function History() {
  const [exerciseData, setExerciseData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isUpdating, setIsUpdating] = useState({});
  const navigate = useNavigate();
  
  const loggedIn = Auth.loggedIn();

  // Fetch and process exercise data
  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setIsLoading(true);
        const token = loggedIn ? Auth.getToken() : null;
        if (!token) return false;

        const response = await getMe(token);
        if (!response.ok) throw new Error("Failed to fetch exercise data");

        const user = await response.json();
        
        // Process and combine exercise data
        const processExercises = (exercises, type) => {
          return exercises.map(exercise => {
            // Ensure we have all required fields with defaults
            const processedExercise = {
              ...exercise,
              type,
              date: exercise.date || new Date().toISOString(),
              calories: exercise.calories || 0,
              distance: exercise.distance || 0,
              duration: exercise.duration || 0,
              sets: exercise.sets || 0,
              reps: exercise.reps || 0,
              weight: exercise.weight || 0,
              completed: Boolean(exercise.completed) // Ensure boolean value
            };
            
            console.log(`Processed ${type} exercise:`, processedExercise);
            return processedExercise;
          });
        };

        // Process cardio and resistance exercises
        const cardio = processExercises(user.cardio || [], 'cardio');
        const resistance = processExercises(user.resistance || [], 'resistance');
        
        // Separate completed and active exercises
        const allExercises = [...cardio, ...resistance];
        const completed = allExercises.filter(ex => ex.completed === true);
        const active = allExercises.filter(ex => ex.completed !== true); // Explicit check for non-completed
        
        // Sort exercises by date (newest first)
        const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
        const sortedActive = [...active].sort(sortByDate);
        const sortedCompleted = [...completed].sort(sortByDate);
        
        console.log('Active exercises count:', sortedActive.length);
        console.log('Completed exercises count:', sortedCompleted.length);
        
        // Update state in a single batch
        setExerciseData(sortedActive);
        setFilteredData(sortedActive);
        setCompletedWorkouts(sortedCompleted);
      } catch (err) {
        console.error('Error fetching exercise data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExerciseData();
  }, [loggedIn]);

  // Filter and sort exercises based on user selection
  useEffect(() => {
    let result = [...exerciseData];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(ex => 
        ex.name.toLowerCase().includes(term) ||
        ex.type.toLowerCase().includes(term)
      );
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      result = result.filter(ex => {
        const exDate = new Date(ex.date);
        if (timeFilter === 'today') return isToday(exDate);
        if (timeFilter === 'week') return isThisWeek(exDate);
        if (timeFilter === 'month') return isThisMonth(exDate);
        return true;
      });
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(ex => ex.type === typeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'duration') return b.duration - a.duration;
      return 0;
    });

    setFilteredData(result);
  }, [exerciseData, searchTerm, timeFilter, typeFilter, sortBy]);

  const handleViewDetails = (exercise) => {
    navigate(`/history/${exercise.type}/${exercise._id}`);
  };

  // Toggle exercise completion status
  const handleToggleComplete = async (exerciseId, completed) => {
    console.log('handleToggleComplete called with:', { exerciseId, completed });
    if (!loggedIn) {
      console.log('User not logged in');
      return;
    }
    
    try {
      console.log('Setting loading state for exercise:', exerciseId);
      setIsUpdating(prev => ({ ...prev, [exerciseId]: true }));
      const token = Auth.getToken();
      
      // Find the exercise to get its type
      const allExercises = [...exerciseData, ...completedWorkouts];
      const exercise = allExercises.find(ex => ex._id === exerciseId);
      
      if (!exercise) {
        console.error('Exercise not found:', exerciseId);
        return;
      }
      
      console.log('Found exercise:', exercise);
      
      // Update the exercise in the database
      try {
        console.log('Sending update request to API...');
        let response;
        
        if (exercise.type === 'cardio') {
          response = await updateCardio(exerciseId, { completed }, token);
        } else if (exercise.type === 'resistance') {
          response = await updateResistanceExercise(exerciseId, { completed }, token);
        } else {
          throw new Error('Unknown exercise type');
        }
        
        const updatedExercise = response; // API functions now return the data directly
        console.log('API Response:', updatedExercise);
        
        // Create the updated exercise object with all required fields
        const exerciseToUpdate = {
          ...exercise,
          ...updatedExercise,
          completed: Boolean(updatedExercise.completed)
        };
        
        console.log('Exercise to update with:', exerciseToUpdate);
        
        // Update state based on the new completion status
        if (exerciseToUpdate.completed) {
          console.log('Moving exercise to completed');
          // Remove from active and add to completed
          setExerciseData(prev => prev.filter(ex => ex._id !== exerciseId));
          setFilteredData(prev => prev.filter(ex => ex._id !== exerciseId));
          setCompletedWorkouts(prev => [
            ...prev.filter(ex => ex._id !== exerciseId),
            exerciseToUpdate
          ]);
        } else {
          console.log('Moving exercise to active');
          // Remove from completed and add to active
          setCompletedWorkouts(prev => prev.filter(ex => ex._id !== exerciseId));
          
          // Add to active and sort by date
          setExerciseData(prev => {
            const updated = [
              ...prev.filter(ex => ex._id !== exerciseId),
              exerciseToUpdate
            ].sort((a, b) => new Date(b.date) - new Date(a.date));
            return updated;
          });
          
          setFilteredData(prev => {
            const updated = [
              ...prev.filter(ex => ex._id !== exerciseId),
              exerciseToUpdate
            ].sort((a, b) => new Date(b.date) - new Date(a.date));
            return updated;
          });
        }
      } catch (err) {
        console.error('Error updating exercise in database:', err);
        throw err; // Re-throw to be caught by the outer catch
      }
    } catch (err) {
      console.error('Error updating exercise status:', err);
      // Optionally show an error message to the user
    } finally {
      setIsUpdating(prev => ({ ...prev, [exerciseId]: false }));
    }
  };

  const renderEmptyState = (isCompletedSection = false) => (
    <div className="empty-state">
      <div className="empty-state-icon">
        <FaCalendarAlt size={48} />
      </div>
      <h3>No {isCompletedSection ? 'completed' : ''} workouts found</h3>
      <p className="text-muted mb-4">
        {!isCompletedSection && (searchTerm || timeFilter !== 'all' || typeFilter !== 'all')
          ? 'Try adjusting your filters'
          : isCompletedSection 
            ? 'Complete some workouts to see them here!'
            : 'Get started by adding your first workout'}
      </p>
      {!isCompletedSection && (
        <Button as={Link} to="/exercise" variant="primary">
          <FaPlus className="me-2" /> Add Workout
        </Button>
      )}
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading your workout history...</p>
        </div>
      );
    }

    return (
      <>
        {/* Active Workouts */}
        <div className="mb-4">
          <h4 className="mb-3 d-flex justify-content-between align-items-center">
            Active Workouts
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="d-md-none"
            >
              {showCompleted ? 'Hide' : 'Show'} Completed
            </Button>
          </h4>
          
          {filteredData.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="exercise-list">
              {filteredData.map((exercise) => (
                <ExerciseCard 
                  key={`active-${exercise._id}-${exercise.type}`} 
                  exercise={exercise} 
                  onViewDetails={handleViewDetails}
                  onToggleComplete={handleToggleComplete}
                  isUpdating={isUpdating[exercise._id] || false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed Workouts */}
        <div className={`${!showCompleted ? 'd-none d-md-block' : ''}`}>
          <h4 className="mb-3 d-flex justify-content-between align-items-center">
            Completed Workouts
            <span className="badge bg-success">{completedWorkouts.length}</span>
          </h4>
          
          {completedWorkouts.length === 0 ? (
            renderEmptyState(true)
          ) : (
            <div className="completed-workouts">
              {completedWorkouts.map((exercise) => (
                <ExerciseCard 
                  key={`completed-${exercise._id}-${exercise.type}`} 
                  exercise={exercise} 
                  onViewDetails={handleViewDetails}
                  onToggleComplete={handleToggleComplete}
                  isUpdating={isUpdating[exercise._id] || false}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  // If the user is not logged in, redirect to the login page
  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">Workout History</h1>
            <Button as={Link} to="/exercise" variant="primary">
              <FaPlus className="me-2" /> Add Workout
            </Button>
          </div>
        </Col>
      </Row>

      {/* Toggle Analytics */}
      <Row className="mb-3">
        <Col>
          <Button 
            variant={showAnalytics ? 'primary' : 'outline-primary'} 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="mb-3"
          >
            <FaChartLine className="me-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
        </Col>
      </Row>

      {/* Progress Analytics */}
      {showAnalytics && (
        <div className="mb-4">
          <ProgressAnalytics exercises={[...exerciseData, ...completedWorkouts]} />
        </div>
      )}

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <InputGroup>
            <InputGroup.Text id="search-addon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex">
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-secondary" id="time-filter">
              <FaClock className="me-1" /> {timeFilter === 'all' ? 'All Time' : timeFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={timeFilter === 'all'} onClick={() => setTimeFilter('all')}>All Time</Dropdown.Item>
              <Dropdown.Item active={timeFilter === 'today'} onClick={() => setTimeFilter('today')}>Today</Dropdown.Item>
              <Dropdown.Item active={timeFilter === 'week'} onClick={() => setTimeFilter('week')}>This Week</Dropdown.Item>
              <Dropdown.Item active={timeFilter === 'month'} onClick={() => setTimeFilter('month')}>This Month</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown className="me-2">
            <Dropdown.Toggle variant="outline-secondary" id="type-filter">
              <FaFilter className="me-1" /> {typeFilter === 'all' ? 'All Types' : typeFilter}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All Types</Dropdown.Item>
              <Dropdown.Item active={typeFilter === 'cardio'} onClick={() => setTypeFilter('cardio')}>Cardio</Dropdown.Item>
              <Dropdown.Item active={typeFilter === 'resistance'} onClick={() => setTypeFilter('resistance')}>Resistance</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="sort-by">
              <FaSortAmountDown className="me-1" /> Sort
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item active={sortBy === 'newest'} onClick={() => setSortBy('newest')}>Newest First</Dropdown.Item>
              <Dropdown.Item active={sortBy === 'oldest'} onClick={() => setSortBy('oldest')}>Oldest First</Dropdown.Item>
              <Dropdown.Item active={sortBy === 'duration'} onClick={() => setSortBy('duration')}>Longest Duration</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {/* View Toggle */}
      <div className="d-flex justify-content-end mb-3">
        <ButtonGroup>
          <Button
            variant={activeView === 'list' ? 'primary' : 'outline-secondary'}
            onClick={() => setActiveView('list')}
          >
            <FaList className="me-1" /> List
          </Button>
          <Button
            variant={activeView === 'calendar' ? 'primary' : 'outline-secondary'}
            onClick={() => setActiveView('calendar')}
          >
            <FaCalendarAlt className="me-1" /> Calendar
          </Button>
        </ButtonGroup>
      </div>

      {/* Main Content */}
      <Row>
        <Col>
          {activeView === 'list' ? (
            <div className="exercise-list">
              {renderContent()}
            </div>
          ) : (
            <Card className="calendar-view">
              <Card.Body className="text-center">
                <FaCalendarAlt size={48} className="text-muted mb-3" />
                <h4>Calendar View</h4>
                <p className="text-muted">Coming soon! For now, please use the list view.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
