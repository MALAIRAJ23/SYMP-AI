import { useEffect, useState } from 'react';
import Papa from 'papaparse';

export default function useDiseaseDataset() {
  const [diseases, setDiseases] = useState([]);

  useEffect(() => {
    // Fetch the new symptoms prediction dataset
    fetch('/symbipredict_2022.csv')
      .then(res => {
        if (!res.ok) {
          throw new Error('symbipredict_2022.csv not found');
        }
        return res.text();
      })
      .then(csv => {
        if (!csv.trim()) {
          throw new Error('CSV file is empty');
        }
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              // Process the disease-symptom data
              const diseaseData = results.data.map(row => {
                const disease = row.prognosis || 'Unknown Disease';
                const symptoms = {};
                Object.keys(row).forEach(key => {
                  if (key !== 'prognosis' && row[key] === 1) {
                    symptoms[key.trim()] = 1;
                  }
                });
                return { disease, symptoms };
              });
              setDiseases(diseaseData);
            } else {
              throw new Error('No data in CSV');
            }
          },
          error: (error) => {
            console.error('Error parsing symbipredict_2022.csv:', error);
            setDiseases([]);
          }
        });
      })
      .catch(error => {
        console.error('Error loading symbipredict_2022.csv:', error);
        setDiseases([]);
      });
  }, []);

  return diseases;
} 