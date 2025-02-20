import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle file change event
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setExtractedText("");
      setAdvice("");
      setError("");
    }
  };

  // Extract text from PDF
  const extractTextFromPDF = async (file) => {
    setLoading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = async () => {
        try {
          const pdfData = reader.result;
          const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" ");
            fullText += pageText + "\n\n";
          }
          setExtractedText(fullText);
          await getMedicalAdvice(fullText);
        } catch (error) {
          setError("Error extracting text from PDF.");
        } finally {
          setLoading(false);
        }
      };
    } catch (error) {
      setError("Failed to read the PDF file.");
      setLoading(false);
    }
  };

  const handleExtractText = () => {
    if (!selectedFile) {
      setError("Please select a PDF file first.");
      return;
    }
    extractTextFromPDF(selectedFile);
  };

  // Call the Gemini API to get medical advice
  const getMedicalAdvice = async (text) => {
    setLoading(true);
    setAdvice("");
    setError("");

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setError("API key is missing. Check your .env file.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent",
        { contents: [{ parts: [{ text }] }] },
        { params: { key: apiKey }, headers: { "Content-Type": "application/json" } }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        setAdvice(response.data.candidates[0]?.content?.parts?.[0]?.text || "No advice available.");
      } else {
        setError("Unexpected response from Gemini API.");
      }
    } catch (error) {
      setError("Failed to fetch advice from Gemini AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f5f7fa", color: "#333" }}>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: "#ffffff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div className="container">
          <a className="navbar-brand" href="#">Med AI Health Assistant</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className="nav-link" href="#upload">Upload</a></li>
              <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link" href="#faq">FAQ</a></li>
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5 text-center" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff" }}>
        <div className="container">
          <h1 className="display-4">Your AI Health Assistant</h1>
          <p className="lead">Transform your medical reports into actionable insights with AI-driven analysis.</p>
          <a href="#upload" className="btn btn-light btn-lg mt-3">Get Started</a>
        </div>
      </section>

      {/* Upload & Analysis Section */}
      <section id="upload" className="container py-5">
        <h2 className="mb-4 text-center">Analyze Your Medical Report</h2>
        <div className="text-center mb-4">
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="form-control w-50 mx-auto" />
        </div>
        <div className="text-center">
          <button className="btn btn-primary" onClick={handleExtractText} disabled={loading}>
            {loading ? "Processing..." : "Extract & Get Advice"}
          </button>
        </div>
        {error && <p className="text-danger mt-3 text-center">{error}</p>}
        {extractedText && (
          <div className="mt-4 p-3 border rounded">
            <h5>Extracted Text:</h5>
            <pre style={{ whiteSpace: "pre-wrap" }}>{extractedText}</pre>
          </div>
        )}
        {advice && (
          <div className="mt-4 p-3 border rounded bg-light">
            <h5>Medical Advice:</h5>
            <p>{advice}</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="container py-5">
        <h2 className="mb-4 text-center">Features</h2>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">PDF Text Extraction</h5>
                <p className="card-text">Quickly extract text from your medical reports with precision.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">AI-Powered Analysis</h5>
                <p className="card-text">Receive detailed insights and actionable advice powered by advanced AI.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h5 className="card-title">User-Friendly Interface</h5>
                <p className="card-text">Experience a sleek, modern design optimized for all devices.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container py-5">
        <h2 className="mb-4 text-center">Frequently Asked Questions</h2>
        <div className="accordion" id="faqAccordion">
          {/* FAQ 1 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                How does the AI health assistant work?
              </button>
            </h2>
            <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Our AI extracts text from your PDF reports and processes it to generate actionable insights.
              </div>
            </div>
          </div>
          {/* FAQ 2 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                Is my data secure?
              </button>
            </h2>
            <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Absolutely. Your data is processed securely and isn’t stored after analysis.
              </div>
            </div>
          </div>
          {/* FAQ 3 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThree">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                What file formats are supported?
              </button>
            </h2>
            <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                We currently support PDF files.
              </div>
            </div>
          </div>
          {/* FAQ 4 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFour">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour">
                Is this service free to use?
              </button>
            </h2>
            <div id="collapseFour" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Yes, our service is free for personal use.
              </div>
            </div>
          </div>
          {/* FAQ 5 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingFive">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive">
                Can I use this on mobile devices?
              </button>
            </h2>
            <div id="collapseFive" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Yes, our platform is fully responsive.
              </div>
            </div>
          </div>
          {/* FAQ 6 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSix">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSix">
                Do I need to create an account?
              </button>
            </h2>
            <div id="collapseSix" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                No registration is required.
              </div>
            </div>
          </div>
          {/* FAQ 7 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSeven">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSeven">
                How long does the analysis take?
              </button>
            </h2>
            <div id="collapseSeven" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Analysis typically takes only a few seconds.
              </div>
            </div>
          </div>
          {/* FAQ 8 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingEight">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEight">
                Can I get a detailed report?
              </button>
            </h2>
            <div id="collapseEight" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Yes, you will receive a detailed analysis that you can share with your healthcare provider.
              </div>
            </div>
          </div>
          {/* FAQ 9 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingNine">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNine">
                What if my file is too large?
              </button>
            </h2>
            <div id="collapseNine" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Larger files may take longer to process. Consider compressing your file if needed.
              </div>
            </div>
          </div>
          {/* FAQ 10 */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTen">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTen">
                Who should use this service?
              </button>
            </h2>
            <div id="collapseTen" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                This service is ideal for anyone seeking quick, AI-powered insights from their medical reports.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container py-5">
        <h2 className="mb-4 text-center">Contact Us</h2>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <p>Email: support@docus.ai</p>
            <p>Phone: +1 234 567 890</p>
            <p>Address: 1234 Health St, Wellness City, Country</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <div className="container">
          <p>Follow us on:</p>
          <a href="#" className="text-white me-3">Facebook</a>
          <a href="#" className="text-white me-3">Twitter</a>
          <a href="#" className="text-white me-3">LinkedIn</a>
          <p className="mt-2">&copy; 2025 Med AI Health Assistant. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
