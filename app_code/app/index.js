import React, { useState } from "react";
import {
  View,
  Button,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";


export default function Index() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [diseaseData, setDiseaseData] = useState(null);
  const [isHealthy, setIsHealthy] = useState(false); // New state to track healthy status

  // Function to pick an image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null); // Clear previous prediction
      setDiseaseData(null); // Clear previous disease data
      setIsHealthy(false); // Reset healthy status
    }
  };

  // Function to take a photo using the camera
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null); // Clear previous prediction
      setDiseaseData(null); // Clear previous disease data
      setIsHealthy(false); // Reset healthy status
    }
  };

  // Function to send the image to the API
  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", {
      uri: image,
      name: "image.jpg",
      type: "image/jpeg",
    });

    try {
      const res = await axios.post(
        "https://navpan2-testapinavn.hf.space/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPrediction(res.data.prediction);

      // Handle the response: Check if it's "Healthy"
      if (res.data.prediction === "normal") {
        setIsHealthy(true);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch disease data based on prediction
  const fetchDiseaseData = async (diseaseName) => {
    setDiseaseLoading(true);

    try {
      const response = await axios.get(
        `https://navpan2-sarva-ai-back.hf.space/disease/${diseaseName}`
      );
      setDiseaseData(response.data);
    } catch (error) {
      console.error("Error fetching disease data:", error);
      alert("Failed to fetch disease data. Please try again.");
    } finally {
      setDiseaseLoading(false);
    }
  };

  // Show disease data when prediction is available and not healthy
  React.useEffect(() => {
    if (prediction && prediction !== "normal" && prediction === "glaucoma") {
      fetchDiseaseData(prediction); // Fetch data for diseases like Glaucoma
    }
  }, [prediction]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Image Prediction App</Text>

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick Image from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take a Photo</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
        <Text style={styles.uploadButtonText}>Upload Image</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      {prediction && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Prediction Result</Text>
          <Text style={styles.resultText}>{prediction}</Text>
        </View>
      )}

      {isHealthy && (
        <View style={styles.healthyContainer}>
          <Text style={styles.healthyText}>Healthy ✔️</Text>
        </View>
      )}

      {diseaseLoading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      {diseaseData && (
        <View style={styles.diseaseInfoContainer}>
          <Text style={styles.diseaseName}>{diseaseData.diseaseName}</Text>
          <Text style={styles.description}>{diseaseData.description}</Text>

          {diseaseData.imageURL && (
            <Image
              source={{ uri: diseaseData.imageURL }}
              style={styles.diseaseImage}
            />
          )}

          <Text style={styles.sectionTitle}>Symptoms:</Text>
          {diseaseData.symptoms.map((symptom, index) => (
            <Text key={index} style={styles.sectionText}>
              - {symptom}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Treatments:</Text>
          {diseaseData.treatments.map((treatment, index) => (
            <Text key={index} style={styles.sectionText}>
              - {treatment}
            </Text>
          ))}

          {diseaseData.preventionTips.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Prevention Tips:</Text>
              {diseaseData.preventionTips.map((tip, index) => (
                <Text key={index} style={styles.sectionText}>
                  - {tip}
                </Text>
              ))}
            </>
          )}

          <Text style={styles.createdAt}>
            Created At: {new Date(diseaseData.createdAt).toLocaleString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignSelf: "center",
  },
  uploadButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
  resultContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
    marginHorizontal: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  resultText: {
    fontSize: 16,
    color: "#555",
  },
  diseaseInfoContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    width: "100%",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  diseaseImage: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    color: "#333",
  },
  sectionText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
  },
  createdAt: {
    fontSize: 14,
    color: "#777",
    marginTop: 20,
    textAlign: "center",
  },
  healthyContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#e6ffe6",
    borderRadius: 8,
    alignItems: "center",
  },
  healthyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
  },
});
