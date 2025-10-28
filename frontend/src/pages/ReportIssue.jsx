import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MapPin, Mic, Square, Upload, Send } from "lucide-react";

export default function ReportIssue() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [location, setLocation] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState("");

  const handleLocation = async () => {
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const res = await fetch("http://127.0.0.1:5000/get_location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      const data = await res.json();
      setLocation(data.address || "Unable to fetch address");
    } catch (err) {
      console.error(err);
      setLocation("Location permission denied");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudio(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
      setMediaRecorder(recorder);
    } catch (err) {
      console.error("Audio permission denied", err);
      alert("Please allow microphone access!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!description || !image || !location) {
        alert("Please fill description, select image, and attach location.");
        return;
      }

      const formData = new FormData();
      formData.append("description", description);
      formData.append("location", location);
      formData.append("image", image);
      if (audio) formData.append("audio", audio);

      const res = await axios.post("http://127.0.0.1:5000/report", formData);
      alert("✅ Issue Submitted Successfully!\n" + JSON.stringify(res.data, null, 2));

      setDescription("");
      setImage(null);
      setAudio(null);
      setAudioURL("");
      setLocation("");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit issue");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
      <motion.div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          🚀 Report an Issue
        </h1>

        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-semibold">📷 Upload Image</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              className="block w-full border rounded-lg p-2"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <Upload className="text-gray-500" />
          </div>
          {image && (
            <p className="text-green-600 text-sm mt-1">📁 {image.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-semibold">📝 Description</label>
          <textarea
            className="border rounded-lg p-3 w-full shadow-sm focus:ring-2 focus:ring-blue-400"
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Audio Recording */}
        <div className="space-y-2">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white font-semibold shadow-md ${
              recording ? "bg-red-500" : "bg-blue-600"
            }`}
          >
            {recording ? <Square size={18} /> : <Mic size={18} />}
            {recording ? "Stop Recording" : "Start Recording"}
          </button>
          {audioURL && (
            <div className="p-2 border rounded-lg bg-gray-50">
              <audio controls src={audioURL} className="w-full" />
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <button
            onClick={handleLocation}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-200 hover:bg-gray-300 border rounded-lg"
          >
            <MapPin size={18} /> Attach Location
          </button>
          {location && (
            <p className="text-sm text-gray-700 mt-2">📍 {location}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-all"
        >
          <Send size={18} /> Submit Issue
        </button>
      </motion.div>
    </div>
  );
}
