import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib
import datetime
import numpy as np

app = Flask(__name__)
CORS(app)

class CrimeTrendPredictor:
    def __init__(self):
        self.connection = None
        self.data = None
        self.model = None

    def connect_to_db(self):
        try:
            self.connection = mysql.connector.connect(
                host='localhost',
                user='root',
                password='',
                database='crime_data'
            )
            return True
        except Exception as e:
            print(f"Database connection error: {e}")
            return False
    
    def load_data(self):
        try:
            query = "SELECT * FROM hotspots"
            self.data = pd.read_sql(query, self.connection)
            return True
        except Exception as e:
            print(f"Data loading error: {e}")
            return False

    def preprocess_data(self):
        try:
            # Convert date strings to datetime objects
            self.data['last_crime_date'] = pd.to_datetime(self.data['last_crime_date'])
            
            # Extract temporal features
            self.data['month'] = self.data['last_crime_date'].dt.month
            self.data['day_of_week'] = self.data['last_crime_date'].dt.dayofweek
            self.data['day_of_month'] = self.data['last_crime_date'].dt.day
            
            # Features for the model
            features = [
                'latitude', 'longitude', 'month', 'day_of_week', 
                'day_of_month', 'severity', 'reported_incidents'
            ]
            
            # Add crime_type as categorical feature if available
            if 'crime_type' in self.data.columns:
                features.append('crime_type')
                
            # Add season as categorical feature if available
            if 'season' in self.data.columns:
                features.append('season')
            
            target = 'reported_incidents'  # Predicting number of incidents
            
            X = self.data[features]
            y = self.data[target]
            
            return train_test_split(X, y, test_size=0.2, random_state=42)
        except Exception as e:
            print(f"Data preprocessing error: {e}")
            return None, None, None, None

    def create_preprocessing_pipeline(self):
        try:
            # Define numeric and categorical features
            numeric_features = ['latitude', 'longitude', 'day_of_month', 
                               'day_of_week', 'month', 'severity', 'reported_incidents']
            
            categorical_features = []
            
            # Add crime_type as categorical feature if it exists in data
            if 'crime_type' in self.data.columns:
                categorical_features.append('crime_type')
                
            # Add season as categorical feature if it exists in data
            if 'season' in self.data.columns:
                categorical_features.append('season')
            
            transformers = []
            
            # Add numeric transformer
            transformers.append(('num', StandardScaler(), numeric_features))
            
            # Add categorical transformer if we have categorical features
            if categorical_features:
                transformers.append(('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features))
            
            preprocessor = ColumnTransformer(transformers=transformers)
            
            return preprocessor
        except Exception as e:
            print(f"Preprocessing pipeline error: {e}")
            return None

    def train_model(self):
        try:
            X_train, X_test, y_train, y_test = self.preprocess_data()
            
            if X_train is None:
                return {"error": "Failed to preprocess data"}
                
            preprocessor = self.create_preprocessing_pipeline()
            
            if preprocessor is None:
                return {"error": "Failed to create preprocessing pipeline"}
            
            # Create and train the model
            model = Pipeline([
                ('preprocessor', preprocessor),
                ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
            ])
            
            model.fit(X_train, y_train)
            self.model = model
            
            # Evaluate the model
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            
            # Save the model
            joblib.dump(model, 'crime_prediction_model.pkl')
            
            return {
                'mean_squared_error': float(mse),
                'mean_absolute_error': float(mae)
            }
        except Exception as e:
            print(f"Model training error: {e}")
            return {"error": str(e)}
    
    def predict_for_date(self, prediction_date):
        try:
            # Load or train model if not already loaded
            if self.model is None:
                try:
                    self.model = joblib.load('crime_prediction_model.pkl')
                except:
                    training_result = self.train_model()
                    if "error" in training_result:
                        return {"error": training_result["error"]}
            
            # Convert string date to datetime object
            if isinstance(prediction_date, str):
                prediction_date = pd.to_datetime(prediction_date)
            
            # Create prediction data from existing hotspots
            prediction_data = self.data.copy()
            
            # Update temporal features for the prediction date
            prediction_data['month'] = prediction_date.month
            prediction_data['day_of_week'] = prediction_date.dayofweek
            prediction_data['day_of_month'] = prediction_date.day
            
            # Determine season based on month
            seasons = {
                1: 'Winter', 2: 'Winter', 3: 'Spring',
                4: 'Spring', 5: 'Spring', 6: 'Summer',
                7: 'Summer', 8: 'Summer', 9: 'Fall',
                10: 'Fall', 11: 'Fall', 12: 'Winter'
            }
            
            if 'season' in prediction_data.columns:
                prediction_data['season'] = prediction_date.month
                prediction_data['season'] = prediction_data['season'].map(lambda m: seasons.get(m, 'Unknown'))
            
            # Select features for prediction
            features = ['latitude', 'longitude', 'month', 'day_of_week', 
                      'day_of_month', 'severity', 'reported_incidents']
            
            if 'crime_type' in prediction_data.columns:
                features.append('crime_type')
                
            if 'season' in prediction_data.columns:
                features.append('season')
                
            input_data = prediction_data[features]
            
            # Make predictions
            predictions = self.model.predict(input_data)
            
            # Apply some randomness to make predictions more varied
            randomness = np.random.normal(1.0, 0.15, size=len(predictions))
            predictions = predictions * randomness
            
            # Format results for response
            result = []
            for i, row in prediction_data.iterrows():
                # Calculate severity (potentially modifying based on prediction)
                predicted_severity = min(10, max(1, int(row['severity'] * (predictions[i] / max(1, row['reported_incidents'])))))
                
                prediction_item = {
                    'id': int(row.get('id', i)),
                    'hotspot_name': row.get('hotspot_name', f"Hotspot {i}"),
                    'latitude': float(row['latitude']),
                    'longitude': float(row['longitude']),
                    'crime_type': row.get('crime_type', 'Unknown'),
                    'severity': int(predicted_severity),
                    'predicted_incidents': int(max(1, predictions[i])),
                }
                
                # Add optional fields if they exist
                if 'legal_section' in row and not pd.isna(row['legal_section']):
                    prediction_item['legal_section'] = row['legal_section']
                    
                if 'patrol_recommendations' in row and not pd.isna(row['patrol_recommendations']):
                    prediction_item['patrol_recommendations'] = row['patrol_recommendations']
                
                result.append(prediction_item)
            
            return result
        except Exception as e:
            print(f"Prediction error: {e}")
            return {"error": str(e)}

@app.route('/predict-crimes', methods=['GET'])
def predict_crimes():
    try:
        # Get prediction date from request, default to today if not provided
        prediction_date = request.args.get('prediction_date')
        if prediction_date:
            prediction_date = pd.to_datetime(prediction_date)
        else:
            prediction_date = datetime.datetime.now()
        
        predictor = CrimeTrendPredictor()
        
        if not predictor.connect_to_db():
            return jsonify({"error": "Failed to connect to database"}), 500
        
        if not predictor.load_data():
            return jsonify({"error": "Failed to load data"}), 500
        
        # Get training metrics
        training_metrics = predictor.train_model()
        
        if "error" in training_metrics:
            return jsonify({"error": training_metrics["error"]}), 500
        
        # Get predictions for the specified date
        predictions = predictor.predict_for_date(prediction_date)
        
        if isinstance(predictions, dict) and "error" in predictions:
            return jsonify({"error": predictions["error"]}), 500
        
        return jsonify({
            'training_metrics': training_metrics,
            'predictions': predictions,
            'prediction_date': prediction_date.strftime('%Y-%m-%d')
        })
    except Exception as e:
        import traceback
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500
    finally:
        if predictor.connection:
            predictor.connection.close()

if __name__ == '__main__':
    app.run(port=5001, debug=True)