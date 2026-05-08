/**
 * Timetable Upload Page
 * Allows Admin to upload Excel files (.xls, .xlsx) to generate the timetable
 * Design: Premium, pastel colors, drag-and-drop support
 */

import React, { useState } from 'react';
import { uploadTimetable } from '../../services/admin_service';
import styles from './TimetableUpload.module.css';

const TimetableUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const extension = selectedFile.name.split('.').pop().toLowerCase();
        if (['xls', 'xlsx'].includes(extension)) {
            setFile(selectedFile);
            setError('');
            setResult(null); // ✅ Clear previous result
            console.log("📁 File selected:", selectedFile.name, selectedFile.size, "bytes");
        } else {
            setError('Please upload a valid Excel file (.xls or .xlsx)');
            setFile(null);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError('');
        setResult(null);

        console.log("🚀 Starting upload for:", file.name);

        const response = await uploadTimetable(file);
        
        console.log("📬 Upload response:", response);
        
        if (response.success) {
            setResult(response.data);
            setFile(null);
            // ✅ Reset file input
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';
        } else {
            setError(response.message || 'Upload failed');
        }
        setUploading(false);
    };

    return (
        <div className={styles.uploadContainer}>
            <div className={styles.uploadHeader}>
                <h1 className={styles.title}>Timetable Generator</h1>
                <p className={styles.subtitle}>Upload your master XLS file to automatically generate schedules and assign rooms.</p>
            </div>

            <div 
                className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    id="file-upload" 
                    style={{ display: 'none' }} 
                    accept=".xls,.xlsx" 
                    onChange={handleFileChange}
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                    <div className={styles.dropZoneIcon}>📊</div>
                    <h3 className={styles.dropZoneTitle}>
                        {file ? file.name : "Drag and drop your Excel file"}
                    </h3>
                    <p className={styles.dropZoneDesc}>
                        Supports .xls and .xlsx formats
                    </p>
                    <div className={styles.browseBtn}>
                        Browse Files
                    </div>
                </label>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    ⚠️ {error}
                </div>
            )}

            {result && (
                <div className={styles.successMessage}>
                    <h4 className={styles.successTitle}>✅ Upload Successful!</h4>
                    <p className={styles.successText}>{result.message}</p>
                    {result.total_records && (
                        <div className={styles.successDetails}>
                            Processed <strong>{result.total_records}</strong> schedule entries into the database.
                        </div>
                    )}
                </div>
            )}

            <button 
                onClick={handleUpload}
                disabled={!file || uploading}
                className={styles.submitBtn}
            >
                {uploading ? "Processing Timetable..." : "Generate Timetable Now"}
            </button>

            <div className={styles.guidelines}>
                <h4 className={styles.guidelinesTitle}>
                    Guidelines for Upload
                </h4>
                <ul className={styles.guidelinesList}>
                    <li>Ensure the file has the standard structure (Days in Column A, Rooms in Column B).</li>
                    <li>Each time slot should span 9 columns as per the university standard.</li>
                    <li>Avoid merged cells within the data grid area.</li>
                    <li>Course names and sections will be automatically extracted.</li>
                </ul>
            </div>
        </div>
    );
};

export default TimetableUpload;