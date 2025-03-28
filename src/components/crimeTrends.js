import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CrimeTrendsPrediction = () => {
  const [crimeTrends, setCrimeTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrimeTrends = async () => {
      try {
        const response = await axios.get('http://localhost:5001/predict-crimes');
        setCrimeTrends(response.data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch crime trends: ${err.message}`);
        setLoading(false);
      }
    };

    fetchCrimeTrends();
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#4a5568',
        }}
      >
        Loading crime predictions...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          color: '#e53e3e',
          textAlign: 'center',
          fontWeight: '600',
          padding: '1rem',
        }}
      >
        {error}
      </div>
    );

  return (
    <div
      style={{
        padding: '2rem',
        background: 'linear-gradient(to bottom, #ebf8ff, #fff)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2
        style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: '#2a4365',
          marginBottom: '1.5rem',
          textDecoration: 'underline',
          textDecorationColor: '#38b2ac',
        }}
      >
        Crime Trends Prediction
      </h2>

      {crimeTrends && (
        <div style={{ width: '100%', maxWidth: '48rem', marginTop: '1.5rem' }}>
          {/* Training Accuracy */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem',
            }}
          >
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#2c5282',
                marginBottom: '0.5rem',
              }}
            >
              Training Accuracy
            </h3>
            <p style={{ color: '#718096', margin: '0.25rem 0' }}>
              🔍 <span style={{ fontWeight: '600', color: '#4a5568' }}>Prediction Error (MSE):</span>{' '}
              {crimeTrends.training_metrics.mean_squared_error.toFixed(2)}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0.25rem 0' }}>
              MSE measures how far off the predictions are. 
            </p>
            <p style={{ color: '#718096', margin: '0.25rem 0' }}>
              📈 <span style={{ fontWeight: '600', color: '#4a5568' }}>Average Error (MAE):</span>{' '}
              {crimeTrends.training_metrics.mean_absolute_error.toFixed(2)}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#718096', margin: '0.25rem 0' }}>
              MAE tells us how much the predictions typically differ from actual values. Smaller is better.
            </p>
          </div>

          {/* Predicted Incidents */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#2c5282',
                marginBottom: '1rem',
              }}
            >
              Predicted Incidents
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[{ name: 'Predicted', value: crimeTrends.predicted_incidents[0] }]}> 
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 14, fill: '#2b6cb0' }} />
                <YAxis tick={{ fontSize: 14, fill: '#2b6cb0' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#edf2f7',
                    borderColor: '#cbd5e0',
                    fontWeight: '600',
                  }}
                />
                <Legend wrapperStyle={{ color: '#4a5568', fontWeight: 'bold' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2b6cb0"
                  strokeWidth={4}
                  dot={{ fill: '#2b6cb0', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p
              style={{
                marginTop: '1rem',
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#4a5568',
              }}
            >
              🔍 Predicted Incidents: <span style={{ color: '#3182ce' }}>{crimeTrends.predicted_incidents[0]}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeTrendsPrediction;
