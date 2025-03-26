from flask import Flask, request, jsonify
import mysql.connector
import pandas as pd
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

# Connect to MySQL database
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",  # Add your MySQL password here
    "database": "crime_data"
}

def fetch_data():
    """Fetch crime data from MySQL and return a DataFrame."""
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        query = "SELECT YEAR(last_crime_date) AS year, SUM(reported_incidents) AS incidents FROM hotspots GROUP BY year;"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        connection.close()
        return pd.DataFrame(rows)
    except mysql.connector.Error as e:
        print(f"Error connecting to MySQL: {e}")
        return pd.DataFrame(columns=["year", "incidents"])  # Return an empty DataFrame if an error occurs

@app.route('/predict', methods=['GET'])
def predict():
    df = fetch_data()
    if df.empty:
        return jsonify({"error": "No data available"}), 500

    # Train the model
    model = LinearRegression()
    model.fit(df[['year']], df['incidents'])

    # Predict future crime incidents
    year = int(request.args.get("year", 2023))
    prediction = model.predict([[year]])

    return jsonify({"year": year, "predicted_incidents": int(prediction[0])})

if __name__ == '__main__':
    app.run(port=5001)
