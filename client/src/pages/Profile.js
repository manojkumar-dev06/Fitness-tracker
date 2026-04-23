import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMe, updateUser } from '../utils/API';
import Auth from "../utils/auth";
import { format } from 'date-fns';
import { 
  Container, Row, Col, Card, Button, 
  Form, Spinner, Image, Tabs, Tab, Alert
} from 'react-bootstrap';
import { 
  FaEnvelope, FaCalendarAlt, 
  FaTrophy, FaEdit, FaSave,
  FaChartLine
} from 'react-icons/fa';
import '../styles/Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    joinDate: '',
    stats: {
      totalWorkouts: 0,
      favoriteExercise: 'None',
      achievements: []
    },
    preferences: {
      weightUnit: 'kg',
      heightUnit: 'cm',
      theme: 'light'
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Starting to fetch user data...');
      try {
        setIsLoading(true);
        const token = Auth.loggedIn() ? Auth.getToken() : null;
        console.log('Auth token:', token ? 'exists' : 'missing');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          return;
        }

        console.log('Fetching user data...');
        const response = await getMe(token);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error('Failed to fetch user data');
        }

        const user = await response.json();
        console.log('User data received:', user);
        
        setUserData({
          ...user,
          joinDate: user.joinDate || new Date().toISOString(),
          stats: {
            totalWorkouts: user.cardio?.length + user.resistance?.length || 0,
            favoriteExercise: user.favoriteExercise || 'None',
            achievements: user.achievements || []
          },
          preferences: {
            weightUnit: user.preferences?.weightUnit || 'kg',
            heightUnit: user.preferences?.heightUnit || 'cm',
            theme: user.preferences?.theme || 'light'
          }
        });
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError('Failed to load profile data: ' + err.message);
      } finally {
        console.log('Finished loading, setting isLoading to false');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Auth.getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await updateUser(userData, token);
      if (!response.ok) throw new Error('Failed to update profile');

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Debug render
  console.log('Rendering Profile component', { isLoading, error, userData });

  if (!Auth.loggedIn()) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <h4>Authentication Required</h4>
          <p>You need to be logged in to view this page.</p>
          <Button as={Link} to="/login" variant="primary" className="me-2">
            Log In
          </Button>
          <Button as={Link} to="/signup" variant="outline-primary">
            Sign Up
          </Button>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card className="profile-card">
            <Card.Body className="text-center">
              <div className="profile-image-container mb-3">
                <Image 
                  src={`https://ui-avatars.com/api/?name=${userData.username}&background=0D6EFD&color=fff&size=150`} 
                  roundedCircle 
                  className="profile-image"
                  alt={userData.username}
                />
                {isEditing && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="edit-photo-btn"
                  >
                    <FaEdit className="me-1" /> Change Photo
                  </Button>
                )}
              </div>
              <h3>{userData.username}</h3>
              <p className="text-muted">
                <FaEnvelope className="me-2" />
                {userData.email}
              </p>
              <p className="text-muted small">
                <FaCalendarAlt className="me-2" />
                Member since {format(new Date(userData.joinDate), 'MMMM yyyy')}
              </p>
              
              <div className="stats-container mt-4">
                <div className="stat-item">
                  <div className="stat-value">{userData.stats.totalWorkouts}</div>
                  <div className="stat-label">Workouts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {userData.stats.achievements?.length || 0}
                  </div>
                  <div className="stat-label">Achievements</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab eventKey="profile" title="Profile">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Profile Information</h4>
                    {!isEditing ? (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <FaEdit className="me-1" /> Edit Profile
                      </Button>
                    ) : (
                      <div>
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          type="submit"
                          form="profileForm"
                        >
                          <FaSave className="me-1" /> Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Form id="profileForm" onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <Form.Group as={Col} md={6} className="mb-3">
                        <Form.Label>Username</Form.Label>
                        {isEditing ? (
                          <Form.Control
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleInputChange}
                            required
                          />
                        ) : (
                          <Form.Control plaintext readOnly defaultValue={userData.username} />
                        )}
                      </Form.Group>
                      
                      <Form.Group as={Col} md={6} className="mb-3">
                        <Form.Label>Email</Form.Label>
                        {isEditing ? (
                          <Form.Control
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            required
                          />
                        ) : (
                          <Form.Control plaintext readOnly defaultValue={userData.email} />
                        )}
                      </Form.Group>
                    </Row>
                    
                    {isEditing && (
                      <div className="preferences-section mt-4">
                        <h5 className="mb-3">Preferences</h5>
                        <Row>
                          <Form.Group as={Col} md={4} className="mb-3">
                            <Form.Label>Weight Unit</Form.Label>
                            <Form.Select 
                              name="weightUnit"
                              value={userData.preferences?.weightUnit || 'kg'}
                              onChange={handlePreferenceChange}
                            >
                              <option value="kg">Kilograms (kg)</option>
                              <option value="lbs">Pounds (lbs)</option>
                            </Form.Select>
                          </Form.Group>
                          
                          <Form.Group as={Col} md={4} className="mb-3">
                            <Form.Label>Height Unit</Form.Label>
                            <Form.Select 
                              name="heightUnit"
                              value={userData.preferences?.heightUnit || 'cm'}
                              onChange={handlePreferenceChange}
                            >
                              <option value="cm">Centimeters (cm)</option>
                              <option value="in">Inches (in)</option>
                            </Form.Select>
                          </Form.Group>
                          
                          <Form.Group as={Col} md={4} className="mb-3">
                            <Form.Label>Theme</Form.Label>
                            <Form.Select 
                              name="theme"
                              value={userData.preferences?.theme || 'light'}
                              onChange={handlePreferenceChange}
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="system">System</option>
                            </Form.Select>
                          </Form.Group>
                        </Row>
                      </div>
                    )}
                  </Form>
                </Tab>
                
                <Tab eventKey="achievements" title="Achievements">
                  <h4 className="mb-4">Your Achievements</h4>
                  {userData.stats.achievements?.length > 0 ? (
                    <Row>
                      {userData.stats.achievements.map((achievement, index) => (
                        <Col md={6} key={index} className="mb-3">
                          <Card className="achievement-card">
                            <Card.Body className="d-flex align-items-center">
                              <div className="achievement-icon me-3">
                                <FaTrophy className="text-warning" size={24} />
                              </div>
                              <div>
                                <h5 className="mb-1">{achievement.title}</h5>
                                <p className="mb-0 text-muted">{achievement.description}</p>
                                <small className="text-muted">
                                  Earned on {format(new Date(achievement.date), 'MMM d, yyyy')}
                                </small>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <div className="text-center py-4">
                      <FaTrophy size={48} className="text-muted mb-3" />
                      <h5>No achievements yet</h5>
                      <p className="text-muted">Complete workouts to earn achievements!</p>
                    </div>
                  )}
                </Tab>
                
                <Tab eventKey="activity" title="Activity">
                  <h4 className="mb-4">Recent Activity</h4>
                  {/* Activity feed will be implemented here */}
                  <div className="text-center py-4">
                    <FaChartLine size={48} className="text-muted mb-3" />
                    <h5>Activity feed coming soon</h5>
                    <p className="text-muted">Your recent workouts and activities will appear here.</p>
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

export default Profile;
