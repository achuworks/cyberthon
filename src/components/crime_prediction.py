import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib

app = Flask(__name__)
CORS(app)

class CrimeTrendPredictor:
    def __init__(self):
        self.connection = None
        self.data = None

    def connect_to_db(self):
        self.connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='crime_data'
        )
    
    def load_data(self):
        query = "SELECT * FROM hotspots"
        self.data = pd.read_sql(query, self.connection)

    def preprocess_data(self):
        self.data['month'] = pd.to_datetime(self.data['last_crime_date']).dt.month
        self.data['year'] = pd.to_datetime(self.data['last_crime_date']).dt.year
        
        features = [
            'latitude', 'longitude', 'crime_type', 'severity', 
            'month', 'season', 'reported_incidents'
        ]
        target = 'average_incidents'
        
        X = self.data[features]
        y = self.data[target]
        
        return train_test_split(X, y, test_size=0.2, random_state=42)

    def create_preprocessing_pipeline(self):
        numeric_features = ['latitude', 'longitude', 'severity', 'reported_incidents']
        categorical_features = ['crime_type', 'season', 'month']
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
            ])
        
        return preprocessor

    def train_model(self):
        X_train, X_test, y_train, y_test = self.preprocess_data()
        preprocessor = self.create_preprocessing_pipeline()
        
        model = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
        ])
        
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        
        joblib.dump(model, 'crime_prediction_model.pkl')
        
        return {
            'mean_squared_error': mse,
            'mean_absolute_error': mae
        }
    
    def predict_future_crimes(self, input_data):
        model = joblib.load('crime_prediction_model.pkl')
        predictions = model.predict(input_data)
        return predictions.tolist()

@app.route('/predict-crimes', methods=['GET'])
def predict_crimes():
    predictor = CrimeTrendPredictor()
    predictor.connect_to_db()
    predictor.load_data()
    
    try:
        training_metrics = predictor.train_model()
        
        input_data = predictor.data[['latitude', 'longitude', 'crime_type', 'severity', 'month', 'season', 'reported_incidents']]
        
        predictions = predictor.predict_future_crimes(input_data)
        
        return jsonify({
            'training_metrics': training_metrics,
            'predicted_incidents': predictions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if predictor.connection:
            predictor.connection.close()

if __name__ == '__main__':
    app.run(port=5001, debug=True)
