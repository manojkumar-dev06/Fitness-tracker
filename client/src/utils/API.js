// get logged in user's info 

export const getMe = (token) => {
  return fetch('/api/user/me', {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });
};

export const createUser = (userData) => {
  return fetch("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
};

export const updateUser = (userData, token) => {
  return fetch('/api/user/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
};

export const loginUser = (userData) => {
  return fetch("/api/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
};

export const createCardio = (cardioData, token) => {
  return fetch("/api/exercise/cardio", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cardioData)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.message || 'Failed to create cardio exercise');
      }).catch(() => {
        throw new Error(`HTTP error! status: ${response.status}`);
      });
    }
    return response.json();
  })
  .catch(error => {
    console.error('Error creating cardio exercise:', error);
    throw error;
  });
}

export const createResistance = (resistanceData, token) => {
  return fetch("/api/exercise/resistance", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(resistanceData)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.message || 'Failed to create resistance exercise');
      }).catch(() => {
        throw new Error(`HTTP error! status: ${response.status}`);
      });
    }
    return response.json();
  })
  .catch(error => {
    console.error('Error creating resistance exercise:', error);
    throw error;
  });
}

export const getCardioById = (cardioId, token) => {
  return fetch(`/api/exercise/cardio/${cardioId}`, {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    }
  })
}

export const getResistanceById = (resistanceId, token) => {
  return fetch(`/api/exercise/resistance/${resistanceId}`, {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    }
  })
}

export const deleteCardio = (cardioId, token) => {
  return fetch(`/api/exercise/cardio/${cardioId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    }
  })
}

export const deleteResistance = (resistanceId, token) => {
  return fetch(`/api/exercise/resistance/${resistanceId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    }
  })
}

export const updateCardio = (exerciseId, exerciseData, token) => {
  console.log('Sending cardio update request to:', `/api/exercise/cardio/${exerciseId}`);
  console.log('Cardio update data:', exerciseData);
  
  return fetch(`/api/exercise/cardio/${exerciseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(exerciseData)
  })
  .then(response => {
    console.log('Cardio response status:', response.status);
    if (!response.ok) {
      return response.json().then(err => {
        console.error('Cardio error response:', err);
        throw new Error(err.message || 'Failed to update cardio exercise');
      }).catch(() => {
        throw new Error(`HTTP error! status: ${response.status}`);
      });
    }
    return response.json();
  })
  .catch(error => {
    console.error('Cardio fetch error:', error);
    throw error;
  });
};

export const updateResistanceExercise = (exerciseId, exerciseData, token) => {
  console.log('Sending update request to:', `/api/exercise/resistance/${exerciseId}`);
  console.log('Update data:', exerciseData);
  
  return fetch(`/api/exercise/resistance/${exerciseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(exerciseData)
  })
  .then(response => {
    console.log('Response status:', response.status);
    if (!response.ok) {
      return response.json().then(err => {
        console.error('Error response:', err);
        throw new Error(err.message || 'Failed to update exercise');
      }).catch(() => {
        throw new Error(`HTTP error! status: ${response.status}`);
      });
    }
    return response.json();
  })
  .catch(error => {
    console.error('Fetch error:', error);
    throw error;
  });
};

// Nutrition API functions
// Helper function to get base URL based on environment
const getBaseUrl = () => {
  return process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
};

export const getTodaysLog = (token) => {
  return fetch(`${getBaseUrl()}/api/nutrition/today`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    mode: 'cors',
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
};

export const addMeal = (token, mealData) => {
  return fetch(`${getBaseUrl()}/api/nutrition/meals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(mealData),
    credentials: 'include',
    mode: 'cors',
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.message || 'Failed to add meal');
      });
    }
    return response.json();
  });
};

export const updateMeal = (token, mealId, mealData) => {
  return fetch(`${getBaseUrl()}/api/nutrition/meals/${mealId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(mealData),
    credentials: 'include',
    mode: 'cors',
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.message || 'Failed to update meal');
      });
    }
    return response.json();
  });
};

export const deleteMeal = (token, mealId) => {
  return fetch(`${getBaseUrl()}/api/nutrition/meals/${mealId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    mode: 'cors',
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.message || 'Failed to delete meal');
      });
    }
    return response.json();
  });
};

export const updateWaterIntake = (token, waterData) => {
  return fetch(`${getBaseUrl()}/api/nutrition/water`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(waterData),
    credentials: 'include',
    mode: 'cors',
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.message || 'Failed to update water intake');
      });
    }
    return response.json();
  });
};