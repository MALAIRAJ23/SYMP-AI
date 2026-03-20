import { useEffect, useState } from 'react';
import Papa from 'papaparse';

export default function useSymptomsDataset() {
  const [symptoms, setSymptoms] = useState([]);

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
              // Get all symptom column names except 'prognosis' and trim them
              const columns = results.meta.fields.filter(f => f !== 'prognosis').map(f => f.trim());
              setSymptoms(columns);
            } else {
              throw new Error('No data in CSV');
            }
          },
          error: (error) => {
            console.error('Error parsing symbipredict_2022.csv:', error);
            setSymptoms([]);
          }
        });
      })
      .catch(error => {
        console.error('Error loading symbipredict_2022.csv:', error);
        setSymptoms([]);
      });
  }, []);

  return symptoms;
} 