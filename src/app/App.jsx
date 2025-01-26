import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisOutput, setAnalysisOutput] = useState("");
  const detectorRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      setIsStreaming(true);
    } catch (err) {
      setError("Error accessing camera: " + err.message);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setIsAnalyzing(false);
    }
  };

  const startAnalysis = () => {
    if (!window.ml5) {
      setError("ML5 library not loaded. Please refresh the page.");
      return;
    }

    // Initialize pose detection
    detectorRef.current = ml5.poseNet(videoRef.current, () => {
      console.log("Model loaded!");
      setAnalysisOutput("Model loaded, starting analysis...");
    });

    // Start detecting poses
    detectorRef.current.on("pose", (results) => {
      if (results && results.length > 0) {
        const pose = results[0].pose;
        setAnalysisOutput(JSON.stringify(pose, null, 2));
      }
    });

    setIsAnalyzing(true);
  };

  const stopAnalysis = () => {
    if (detectorRef.current) {
      detectorRef.current.removeAllListeners();
    }
    setIsAnalyzing(false);
    setAnalysisOutput("Analysis stopped");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopAnalysis();
    };
  }, []);

  return (
    <div className="container">
      {error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="video-section">
            <video ref={videoRef} autoPlay playsInline />
            <div className="controls">
              {!isStreaming ? (
                <button onClick={startCamera}>Start Camera</button>
              ) : (
                <>
                  <button onClick={stopCamera}>Stop Camera</button>
                  {!isAnalyzing ? (
                    <button onClick={startAnalysis}>Start Analysis</button>
                  ) : (
                    <button onClick={stopAnalysis}>Stop Analysis</button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="output-section">
            <h3>Analysis Output:</h3>
            <pre className="output-box">
              {analysisOutput || "No analysis data yet"}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
