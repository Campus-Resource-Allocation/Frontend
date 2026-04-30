/**
 * Timetable Upload Page
 * Allows Admin to upload Excel files (.xls, .xlsx) to generate the timetable
 * Design: Premium, pastel colors, drag-and-drop support
 */

import React, { useState } from 'react';
import { uploadTimetable } from '../../services/admin_service';

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
        if (!file) return;

        setUploading(true);
        setError('');
        setResult(null);

        const response = await uploadTimetable(file);
        
        if (response.success) {
            setResult(response.data);
            setFile(null);
        } else {
            setError(response.message);
        }
        setUploading(false);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Timetable Generator</h1>
                <p style={{ color: '#64748b', fontSize: '15px' }}>Upload your master XLS file to automatically generate schedules and assign rooms.</p>
            </div>

            <div 
                style={{
                    background: 'white',
                    border: `2px dashed ${dragActive ? '#7c3aed' : '#e2e8f0'}`,
                    borderRadius: '24px',
                    padding: '60px 40px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    cursor: 'pointer'
                }}
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
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                        {file ? file.name : "Drag and drop your Excel file"}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                        Supports .xls and .xlsx formats
                    </p>
                    <div style={{ 
                        display: 'inline-block',
                        padding: '12px 24px',
                        background: '#f1f5f9',
                        color: '#475569',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}>
                        Browse Files
                    </div>
                </label>
            </div>

            {error && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '16px',
                    background: '#fef2f2',
                    color: '#b91c1c',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '1px solid #fecaca'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {result && (
                <div style={{ 
                    marginTop: '20px',
                    padding: '24px',
                    background: '#f0fdf4',
                    color: '#166534',
                    borderRadius: '16px',
                    border: '1px solid #dcfce7'
                }}>
                    <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>✅ Upload Successful!</h4>
                    <p style={{ fontSize: '14px' }}>{result.message}</p>
                    <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>
                        Processed {result.total_records} schedule entries into the database.
                    </div>
                </div>
            )}

            <button 
                onClick={handleUpload}
                disabled={!file || uploading}
                style={{
                    width: '100%',
                    marginTop: '32px',
                    padding: '16px',
                    borderRadius: '16px',
                    background: !file || uploading ? '#ddd6fe' : '#7c3aed',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: !file || uploading ? 'not-allowed' : 'pointer',
                    boxShadow: !file || uploading ? 'none' : '0 10px 15px -3px rgba(124, 58, 237, 0.3)',
                    transition: 'all 0.2s'
                }}
            >
                {uploading ? "Processing Timetable..." : "Generate Timetable Now"}
            </button>

            <div style={{ marginTop: '40px', background: '#f8fafc', padding: '24px', borderRadius: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Guidelines for Upload
                </h4>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
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
