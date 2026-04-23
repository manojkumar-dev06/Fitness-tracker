import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../utils/API';
import Auth from "../utils/auth";
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Card, Row, Col, Container, Spinner, ProgressBar } from 'react-bootstrap';
import { FaDumbbell, FaRunning, FaFire, FaTrophy, FaCalendarAlt, FaChartLine, FaPlus } from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    totalCalories: 0,
    cardioCalories: 0,
    resistanceCalories: 0,
    cardioCount: 0,
    resistanceCount: 0,
    favoriteExercise: { name: 'None', count: 0 },
    recentActivities: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Auth.loggedIn() ? Auth.getToken() : null;
        if (!token) return;

        const response = await getMe(token);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const user = await response.json();
        processUserData(user);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processUserData = (user) => {
    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 });
    const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 0 });
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
    
    // Combine cardio and resistance exercises
    const allExercises = [
      ...(user.cardio || []).map(ex => ({ ...ex, type: 'cardio' })),
      ...(user.resistance || []).map(ex => ({ ...ex, type: 'resistance' }))
    ];

    // Sort by date (newest first)
    allExercises.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate stats
    const weeklyWorkouts = allExercises.filter(ex => 
      isWithinInterval(new Date(ex.date), { start: startOfCurrentWeek, end: endOfCurrentWeek })
    ).length;

    const monthlyWorkouts = allExercises.filter(ex => 
      new Date(ex.date) >= oneMonthAgo
    ).length;

    // Calculate total calories burned and breakdown by type
    const totalCalories = allExercises.reduce((sum, ex) => {
      // Handle different calorie field names for cardio vs resistance
      const calories = ex.type === 'cardio' 
        ? (ex.caloriesBurned || ex.calories || 0)
        : (ex.calories || 0);
      return sum + (parseFloat(calories) || 0);
    }, 0);

    const cardioCalories = allExercises
      .filter(ex => ex.type === 'cardio')
      .reduce((sum, ex) => sum + (parseFloat(ex.caloriesBurned || ex.calories || 0)), 0);

    const resistanceCalories = allExercises
      .filter(ex => ex.type === 'resistance')
      .reduce((sum, ex) => sum + (parseFloat(ex.calories || 0)), 0);

    // Calculate exercise counts
    const cardioCount = allExercises.filter(ex => ex.type === 'cardio').length;
    const resistanceCount = allExercises.filter(ex => ex.type === 'resistance').length;

    // Find favorite exercise
    const exerciseCounts = {};
    allExercises.forEach(ex => {
      const key = ex.name;
      exerciseCounts[key] = (exerciseCounts[key] || 0) + 1;
    });
    
    const favoriteExercise = Object.entries(exerciseCounts).reduce((max, [name, count]) => 
      count > max.count ? { name, count } : max, 
      { name: 'None', count: 0 }
    );

    setStats({
      totalWorkouts: allExercises.length,
      weeklyWorkouts,
      monthlyWorkouts,
      totalCalories,
      cardioCalories,
      resistanceCalories,
      cardioCount,
      resistanceCount,
      favoriteExercise,
      recentActivities: allExercises.slice(0, 5)
    });
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
    <Card className="dashboard-card h-100">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0 text-muted small text-uppercase fw-bold">{title}</Card.Title>
          <div className={`icon-circle bg-soft-${color}`}>
            <Icon className={`text-${color}`} />
          </div>
        </div>
        <div className="d-flex align-items-end">
          <h2 className="mb-0 fw-bold">{value}</h2>
        </div>
        {title === 'Weekly Goal' && (
          <div className="mt-3">
            <div className="d-flex justify-content-between mb-1">
              <small>{stats.weeklyWorkouts} of 5 workouts</small>
              <small>{Math.min(100, (stats.weeklyWorkouts / 5) * 100)}%</small>
            </div>
            <ProgressBar 
              now={Math.min(100, (stats.weeklyWorkouts / 5) * 100)} 
              variant={stats.weeklyWorkouts >= 5 ? 'success' : 'primary'}
              className="rounded-pill"
              style={{ height: '6px' }}
            />
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const renderActivities = () => {
    return (
      <div className="list-group">
        {stats.recentActivities.map((activity, index) => (
          <div key={index} className="list-group-item">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{activity.name}</h5>
              <small>{format(new Date(activity.date), 'MMM d, yyyy')}</small>
            </div>
            <p className="mb-1">
              {activity.type === 'cardio' 
                ? `${activity.distance} km in ${activity.duration} min`
                : `${activity.sets} x ${activity.reps} @ ${activity.weight}kg`}
            </p>
            <small className="text-muted">{activity.type}</small>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading your fitness data...</p>
      </div>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1 fw-bold">Dashboard</h1>
          <p className="text-muted mb-0">Welcome back! Here's your fitness overview.</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => navigate('/exercise')}>
            <FaPlus className="me-2" /> Add Workout
          </button>
        </div>
      </div>
      
      <Row className="g-4 mb-4">
        <Col xl={3} md={6}>
          <StatCard 
            title="Total Workouts" 
            value={stats.totalWorkouts} 
            icon={FaDumbbell} 
            color="primary"
          />
        </Col>
        <Col xl={3} md={6}>
          <StatCard 
            title="This Week" 
            value={stats.weeklyWorkouts} 
            icon={FaCalendarAlt} 
            color="info"
          />
        </Col>
        <Col xl={3} md={6}>
          <StatCard 
            title="Calories Burned" 
            value={stats.totalCalories > 0 ? stats.totalCalories.toLocaleString() : '0'} 
            icon={FaFire} 
            color="warning"
          />
        </Col>
        <Col xl={3} md={6}>
          <StatCard 
            title="Weekly Goal" 
            value={`${Math.min(5, stats.weeklyWorkouts)}/5`} 
            icon={FaTrophy} 
            color={stats.weeklyWorkouts >= 5 ? 'success' : 'primary'}
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="mb-0 fw-bold">Activity Overview</h5>
                  <small className="text-muted">Your recent workout activities</small>
                </div>
                <div className="btn-group" role="group">
                  <button 
                    className={`btn btn-sm ${timeRange === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setTimeRange('week')}
                  >
                    This Week
                  </button>
                  <button 
                    className={`btn btn-sm ${timeRange === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setTimeRange('month')}
                  >
                    This Month
                  </button>
                </div>
              </div>
              {renderActivities()}
              {stats.recentActivities.length === 0 && (
                <div className="text-center py-5">
                  <FaChartLine className="text-muted mb-3" size={48} />
                  <h5>No activities yet</h5>
                  <p className="text-muted">Start adding workouts to see your activity here</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="dashboard-card h-100">
            <Card.Body>
              <h5 className="mb-4 fw-bold">Quick Stats</h5>
              <div className="activity-list">
                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="icon-circle-sm bg-soft-primary me-3">
                      <FaRunning className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-0">Cardio Sessions</h6>
                      <small className="text-muted">Total completed</small>
                    </div>
                  </div>
                  <span className="fw-bold">{stats.cardioCount || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="icon-circle-sm bg-soft-info me-3">
                      <FaDumbbell className="text-info" />
                    </div>
                    <div>
                      <h6 className="mb-0">Resistance Workouts</h6>
                      <small className="text-muted">Total completed</small>
                    </div>
                  </div>
                  <span className="fw-bold">{stats.resistanceCount || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="icon-circle-sm bg-soft-warning me-3">
                      <FaFire className="text-warning" />
                    </div>
                    <div>
                      <h6 className="mb-0">Cardio Calories</h6>
                      <small className="text-muted">Total burned</small>
                    </div>
                  </div>
                  <span className="fw-bold">{stats.cardioCalories > 0 ? stats.cardioCalories.toLocaleString() : '0'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <div className="icon-circle-sm bg-soft-success me-3">
                      <FaDumbbell className="text-success" />
                    </div>
                    <div>
                      <h6 className="mb-0">Resistance Calories</h6>
                      <small className="text-muted">Total burned</small>
                    </div>
                  </div>
                  <span className="fw-bold">{stats.resistanceCalories > 0 ? stats.resistanceCalories.toLocaleString() : '0'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-3">
                  <div className="d-flex align-items-center">
                    <div className="icon-circle-sm bg-soft-warning me-3">
                      <FaFire className="text-warning" />
                    </div>
                    <div>
                      <h6 className="mb-0">Total Duration</h6>
                      <small className="text-muted">Minutes this month</small>
                    </div>
                  </div>
                  <span className="fw-bold">{stats.totalDuration || 0} min</span>
                </div>
              </div>
              
              {stats.favoriteExercise.name !== 'None' && (
                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-2 fw-bold">Your Favorite</h6>
                  <div className="d-flex align-items-center">
                    <div className="icon-circle-sm bg-soft-success me-3">
                      <FaTrophy className="text-success" />
                    </div>
                    <div>
                      <h5 className="mb-0">{stats.favoriteExercise.name}</h5>
                      <small className="text-muted">Completed {stats.favoriteExercise.count} times</small>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;



