import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProgressAnalytics = ({ exercises = [] }) => {
  // Filter and sort resistance exercises by date
  const resistanceExercises = exercises
    .filter(ex => ex.type === 'resistance')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Get last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, 'MMM d');
  });

  // Prepare volume data
  const volumeData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Volume (kg)',
        data: last7Days.map(day => {
          return resistanceExercises
            .filter(ex => format(new Date(ex.date), 'MMM d') === day)
            .reduce((total, ex) => total + (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0), 0);
        }),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div className="progress-analytics">
      <h3 className="mb-4">Workout Analytics</h3>
      
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Weekly Volume (Sets × Reps × Weight)</Card.Title>
              <div style={{ height: '300px' }}>
                <Line 
                  data={volumeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Total Volume (kg)' }
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProgressAnalytics;
