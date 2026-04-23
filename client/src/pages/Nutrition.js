import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import { FaPlus, FaTint, FaFire, FaDrumstickBite, FaBreadSlice, FaCheese, FaEdit, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import { getTodaysLog, addMeal, updateWaterIntake, updateMeal, deleteMeal } from '../utils/API';
import Auth from '../utils/auth';

const Nutrition = () => {
  const [nutritionLog, setNutritionLog] = useState(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);
  const [mealForm, setMealForm] = useState({ 
    name: '', 
    calories: '', 
    protein: '', 
    carbs: '', 
    fat: '',
    category: 'other' 
  });
  const [waterAmount, setWaterAmount] = useState(0);
  
  const mealCategories = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch today's nutrition log
  const fetchTodaysLog = async () => {
    try {
      const token = Auth.getToken();
      if (!token) return;
      const response = await getTodaysLog(token);
      if (response.ok) {
        const data = await response.json();
        setNutritionLog(data);
        setWaterAmount(data?.waterIntake?.amount || 0);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => { fetchTodaysLog(); }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMealForm({ ...mealForm, [name]: value });
  };

  // Handle edit meal
  const handleEditMeal = (meal) => {
    setMealForm({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      category: meal.category || 'other',
      notes: meal.notes || ''
    });
    setEditingMealId(meal._id);
    setShowAddMeal(true);
    // Scroll to form
    window.scrollTo({
      top: document.querySelector('.meal-form-container')?.offsetTop - 20,
      behavior: 'smooth'
    });
  };

  // Handle delete meal
  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        const token = Auth.getToken();
        if (!token) return;
        
        const response = await deleteMeal(token, mealId);
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Failed to delete meal:', responseData);
          return;
        }
        
        console.log('Meal deleted successfully');
        await fetchTodaysLog();
      } catch (err) {
        console.error('Error deleting meal:', err);
      }
    }
  };

  // Helper function to get badge color based on category
  const getCategoryBadgeColor = (category) => {
    const colors = {
      breakfast: 'warning',
      lunch: 'info',
      dinner: 'primary',
      snack: 'success',
      other: 'secondary'
    };
    return colors[category] || 'secondary';
  };

  // Handle water intake change
  const handleWaterChange = (amount) => {
    const newAmount = Math.max(0, waterAmount + amount);
    setWaterAmount(newAmount);
    updateWaterIntakeLocal(newAmount);
  };

  // Update water intake in the backend
  const updateWaterIntakeLocal = async (amount) => {
    try {
      const token = Auth.getToken();
      if (!token) return;
      await updateWaterIntake(token, { amount });
      await fetchTodaysLog();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Handle meal form submission
  const handleMealSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Auth.getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const mealData = {
        ...mealForm,
        calories: Number(mealForm.calories) || 0,
        protein: Number(mealForm.protein) || 0,
        carbs: Number(mealForm.carbs) || 0,
        fat: Number(mealForm.fat) || 0
      };
      
      if (editingMealId) {
        // Update existing meal
        const response = await updateMeal(token, editingMealId, mealData);
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Failed to update meal:', responseData);
          return;
        }
        
        console.log('Meal updated successfully:', responseData);
        setEditingMealId(null);
      } else {
        // Add new meal
        const response = await addMeal(token, mealData);
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Failed to add meal:', responseData);
          return;
        }
        
        console.log('Meal added successfully:', responseData);
      }
      
      // Reset form and refresh data
      setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '', category: 'other' });
      setShowAddMeal(false);
      await fetchTodaysLog();
    } catch (err) {
      console.error('Error saving meal:', err);
    }
  };

  // Calculate total macros
  const calculateTotals = () => {
    if (!nutritionLog?.meals?.length) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return nutritionLog.meals.reduce((totals, meal) => ({
      calories: totals.calories + (Number(meal.calories) || 0),
      protein: totals.protein + (Number(meal.protein) || 0),
      carbs: totals.carbs + (Number(meal.carbs) || 0),
      fat: totals.fat + (Number(meal.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();
  const waterGoal = nutritionLog?.waterIntake?.goal || 2000;

  return (
    <Container className="my-4">
      <h2 className="mb-4">Nutrition Tracker</h2>
      
      {/* Water Intake */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <Card.Title className="mb-0">
              <FaTint className="me-2 text-primary" />
              Water Intake
            </Card.Title>
            <div className="d-flex align-items-center">
              <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleWaterChange(-100)}>-</Button>
              <div className="text-center" style={{ minWidth: '80px' }}>
                <div className="h4 mb-0">{waterAmount}ml</div>
                <small className="text-muted">of {waterGoal}ml</small>
              </div>
              <Button variant="outline-primary" size="sm" className="ms-2" onClick={() => handleWaterChange(100)}>+</Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Macros Summary */}
      <Row className="mb-4 g-3">
        {[
          { title: 'Calories', value: totals.calories, unit: 'kcal', icon: <FaFire className="text-danger me-2" /> },
          { title: 'Protein', value: totals.protein, unit: 'g', icon: <FaDrumstickBite className="text-primary me-2" /> },
          { title: 'Carbs', value: totals.carbs, unit: 'g', icon: <FaBreadSlice className="text-warning me-2" /> },
          { title: 'Fat', value: totals.fat, unit: 'g', icon: <FaCheese className="text-warning me-2" /> }
        ].map((item, index) => (
          <Col md={3} sm={6} key={index}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="d-flex justify-content-center align-items-center mb-2">
                  {item.icon}
                  <h5 className="mb-0">{item.title}</h5>
                </div>
                <h3>{item.value}</h3>
                <small className="text-muted">{item.unit}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Meal Section */}
      <div className="meal-form-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>{editingMealId ? 'Edit Meal' : 'Add New Meal'}</h4>
          <Button 
            variant={showAddMeal ? 'outline-secondary' : 'primary'}
            onClick={() => {
              setShowAddMeal(!showAddMeal);
              if (showAddMeal) {
                setEditingMealId(null);
                setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '', category: 'other' });
              }
            }}
          >
            {showAddMeal ? (
              <><FaTimes className="me-1" /> Cancel</>
            ) : (
              <><FaPlus className="me-1" /> Add Meal</>
            )}
          </Button>
        </div>

      {/* Add/Edit Meal Form */}
      {showAddMeal && (
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleMealSubmit}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="meal-name">Meal Name</Form.Label>
                    <Form.Control
                      id="meal-name"
                      type="text"
                      name="name"
                      value={mealForm.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Grilled Chicken Salad"
                      autoComplete="off"
                      aria-required="true"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="meal-category">Category</Form.Label>
                    <Form.Select
                      id="meal-category"
                      name="category"
                      value={mealForm.category}
                      onChange={handleInputChange}
                      aria-label="Select meal category"
                    >
                      {mealCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                {[
                  { field: 'calories', label: 'Calories (kcal)', step: '1' },
                  { field: 'protein', label: 'Protein (g)', step: '0.1' },
                  { field: 'carbs', label: 'Carbs (g)', step: '0.1' },
                  { field: 'fat', label: 'Fat (g)', step: '0.1' }
                ].map(({ field, label, step }) => (
                  <Col md={2} key={field}>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor={`meal-${field}`}>
                      {label}
                    </Form.Label>
                    <Form.Control
                      id={`meal-${field}`}
                      type="number"
                      name={field}
                      value={mealForm[field]}
                      onChange={handleInputChange}
                      min="0"
                      step={step}
                      placeholder="0"
                      autoComplete="off"
                      aria-required={field === 'calories' ? 'true' : 'false'}
                    />
                    </Form.Group>
                  </Col>
                ))}
              </Row>
              
              <div className="d-flex justify-content-between">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setShowAddMeal(false);
                    setEditingMealId(null);
                    setMealForm({ name: '', calories: '', protein: '', carbs: '', fat: '', category: 'other' });
                  }}
                >
                  <FaTimes className="me-1" /> Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingMealId ? (
                    <><FaCheck className="me-1" /> Update Meal</>
                  ) : (
                    <><FaPlus className="me-1" /> Add Meal</>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      </div> {/* Closing tag for meal-form-container */}

      {/* Meals List */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Today's Meals</h5>
          <div className="text-muted">
            {nutritionLog?.meals?.length || 0} meals today
          </div>
        </Card.Header>
        <ListGroup variant="flush">
          {nutritionLog?.meals?.length > 0 ? (
            nutritionLog.meals.map((meal, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                <div className="me-3">
                  <div className="d-flex align-items-center mb-1">
                    <span className={`badge bg-${getCategoryBadgeColor(meal.category || 'other')} me-2`}>
                      {mealCategories.find(c => c.value === (meal.category || 'other'))?.label || 'Other'}
                    </span>
                    <h6 className="mb-0">{meal.name}</h6>
                  </div>
                  <small className="text-muted">
                    {new Date(meal.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="text-end me-3">
                    <div className="fw-bold">{meal.calories} kcal</div>
                    <small className="text-muted">
                      P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                    </small>
                  </div>
                  <div className="btn-group">
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleEditMeal(meal)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteMeal(meal._id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="text-center text-muted py-4">
              No meals logged yet. Add your first meal above!
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>
    </Container>
  );
};

export default Nutrition;
