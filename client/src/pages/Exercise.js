import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaHeartbeat, FaDumbbell, FaPlusCircle, FaHistory } from 'react-icons/fa';
import Auth from "../utils/auth";
import '../styles/Exercise.css';

export default function Exercise() {
  const navigate = useNavigate();
  const loggedIn = Auth.loggedIn();

  // If the user is not logged in, redirect to the login page
  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  const exerciseOptions = [
    {
      id: 'cardio',
      title: 'Cardio',
      icon: <FaHeartbeat size={48} className="exercise-icon" />,
      description: 'Track running, cycling, swimming, and other cardio exercises',
      color: '#4e73df'
    },
    {
      id: 'resistance',
      title: 'Resistance',
      icon: <FaDumbbell size={48} className="exercise-icon" />,
      description: 'Log weight training and strength exercises',
      color: '#1cc88a'
    },
    {
      id: 'quick-add',
      title: 'Quick Add',
      icon: <FaPlusCircle size={48} className="exercise-icon" />,
      description: 'Quickly add a basic workout',
      color: '#f6c23e',
      disabled: true
    },
    {
      id: 'template',
      title: 'From Template',
      icon: <FaHistory size={48} className="exercise-icon" />,
      description: 'Start a workout from a template',
      color: '#e74a3b',
      disabled: true
    }
  ];

  const handleExerciseSelect = (type) => {
    if (type === 'cardio') {
      navigate('/exercise/cardio');
    } else if (type === 'resistance') {
      navigate('/exercise/resistance');
    }
  };

  const RecentWorkout = ({ type, name, time }) => (
    <div className="recent-workout-item">
      <div className="recent-workout-icon">
        {type === 'cardio' ? <FaHeartbeat /> : <FaDumbbell />}
      </div>
      <div className="recent-workout-details">
        <div className="recent-workout-name">{name}</div>
        <div className="recent-workout-time">{time} ago</div>
      </div>
    </div>
  );

  return (
    <Container className="exercise-page py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Add Exercise</h2>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/history')}>
          <FaHistory className="me-1" /> View History
        </Button>
      </div>

      <Row className="g-4 mb-4">
        {exerciseOptions.map((option) => (
          <Col key={option.id} xs={12} sm={6} lg={3}>
            <Card 
              className={`exercise-option-card ${option.disabled ? 'disabled' : ''}`}
              onClick={() => !option.disabled && handleExerciseSelect(option.id)}
              style={{ '--card-color': option.color }}
            >
              <Card.Body className="text-center">
                <div className="exercise-icon-container" style={{ color: option.color }}>
                  {option.icon}
                </div>
                <h3 className="exercise-option-title">{option.title}</h3>
                <p className="exercise-option-desc">{option.description}</p>
                {option.disabled && (
                  <span className="badge bg-secondary">Coming Soon</span>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="recent-workouts-card mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Workouts</h5>
          <small className="text-muted">Last 7 days</small>
        </Card.Header>
        <Card.Body>
          <div className="recent-workouts-list">
            <RecentWorkout 
              type="cardio" 
              name="Morning Run" 
              time="2 hours" 
            />
            <RecentWorkout 
              type="resistance" 
              name="Upper Body Workout" 
              time="1 day" 
            />
            <div className="text-center py-3">
              <Button variant="link" onClick={() => navigate('/history')}>
                View All Workouts
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
