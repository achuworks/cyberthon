import React, { useEffect, useState } from "react";
import "./LegalClassification.css";

const LegalClassification = () => {
  const [groupedData, setGroupedData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/legal")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Data:", data); // Debugging

        const grouped = {};
        data.forEach(({ crime_type, legal_section }) => {
          if (!grouped[crime_type]) {
            grouped[crime_type] = new Set();
          }
          grouped[crime_type].add(legal_section);
        });

        const formattedData = Object.entries(grouped).map(([crime, sections]) => ({
          crime_type: crime,
          legal_section: Array.from(sections).join(", "),
        }));

        setGroupedData(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <>
      <h2 className="title">Legal Classification</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Crime Type</th>
            <th>Legal Section</th>
          </tr>
        </thead>
        <tbody>
          {groupedData.length > 0 ? (
            groupedData.map((item, index) => (
              <tr key={index}>
                <td>{item.crime_type}</td>
                <td>{item.legal_section}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default LegalClassification;
