import React, { useState } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelData {
  UserID: string;
  Date: string;
  Name: string;
  POC: string;
  Potential: number;
  'Last 30 days': number;
  ProRatedAch: number;
  ShortFall: number;
}

interface ExcelImportProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: (data: ExcelData[]) => Promise<void>;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ isOpen, onClose, onDataImported }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewData, setPreviewData] = useState<ExcelData[]>([]);

  const expectedHeaders = ['UserID', 'Date', 'Name', 'POC', 'Potential', 'Last 30 days', 'ShortFall'];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const validateHeaders = (headers: string[]): boolean => {
    return expectedHeaders.every(header => headers.includes(header));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadStatus('error');
      setErrorMessage('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      const headers = jsonData[0] as string[];
      
      if (!validateHeaders(headers)) {
        throw new Error(`Excel file must contain the following headers: ${expectedHeaders.join(', ')}`);
      }

      const processedData: ExcelData[] = jsonData.slice(1).map((row: any[], index) => {
        const rowData: any = {};
        headers.forEach((header, headerIndex) => {
          rowData[header] = row[headerIndex];
        });

        // Ensure string fields are converted to strings
        rowData.UserID = String(rowData.UserID || '');
        rowData.Name = String(rowData.Name || '');
        rowData.POC = String(rowData.POC || '');

        // Validate and convert numeric fields
        const numericFields = ['Potential', 'Last 30 days', 'ShortFall'];
        numericFields.forEach(field => {
          const value = parseFloat(rowData[field]);
          if (isNaN(value)) {
            throw new Error(`Invalid numeric value in row ${index + 2}, column ${field}`);
          }
          rowData[field] = value;
        });

        // Validate date format (mm/dd/yyyy)
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dateRegex.test(rowData.Date)) {
          throw new Error(`Invalid date format in row ${index + 2}. Expected format: dd/mm/yyyy`);
        }

        // Calculate ProRatedAch as (Last 30 days / Potential) * 100
        const potential = rowData.Potential;
        const last30Days = rowData['Last 30 days'];
        if (potential > 0) {
          rowData.ProRatedAch = Math.round((last30Days / potential) * 100 * 100) / 100; // Round to 2 decimal places
        } else {
          rowData.ProRatedAch = 0;
        }

        return rowData as ExcelData;
      }).filter(row => row.UserID && row.Name && row.POC); // Filter out empty rows

      setPreviewData(processedData);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsProcessing(true);
      await onDataImported(previewData);
      onClose();
      // Reset state
      setPreviewData([]);
      setUploadStatus('idle');
      setErrorMessage('');
    } catch (error) {
      console.error('Error importing data:', error);
      setUploadStatus('error');
      setErrorMessage('Failed to import data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
    setPreviewData([]);
    setUploadStatus('idle');
    setErrorMessage('');
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Import Excel Data
              </h3>
              <button onClick={handleClose} className="text-white hover:text-gray-200 transition-colors duration-200">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Upload Area */}
            {uploadStatus === 'idle' && (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  isDragging
                    ? 'border-[#9CE882] bg-green-50'
                    : 'border-gray-300 hover:border-[#9CE882] hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Excel File</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Required headers: {expectedHeaders.join(', ')} (ProRatedAch will be auto-calculated)
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="excel-upload"
                />
                <label
                  htmlFor="excel-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B] cursor-pointer transition-all duration-200"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9CE882] mx-auto mb-4"></div>
                <p className="text-gray-600">Processing Excel file...</p>
              </div>
            )}

            {/* Error State */}
            {uploadStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Upload Failed</h4>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                  disabled={isProcessing}
                    setUploadStatus('idle');
                    setErrorMessage('');
                  }}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B]'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </div>
                  ) : (
                    'Import Data'
                  )}
                </button>
              </div>
            )}

            {/* Success State with Preview */}
            {uploadStatus === 'success' && previewData.length > 0 && (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">File Processed Successfully</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Found {previewData.length} records ready for import
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> ProRatedAch is automatically calculated as (Last 30 days ÷ Potential) × 100
                    </p>
                  </div>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['UserID', 'Date', 'Name', 'POC', 'Potential', 'Last 30 days', 'ProRatedAch (Calculated)', 'ShortFall'].map(header => (
                            <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {previewData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{row.UserID}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{row.Date}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{row.Name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{row.POC}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{row.Potential}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{row['Last 30 days']}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                row.ProRatedAch < 50 
                                  ? 'bg-red-100 text-red-800' 
                                  : row.ProRatedAch < 75 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {row.ProRatedAch}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{row.ShortFall}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewData.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing first 5 rows of {previewData.length} total records
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setUploadStatus('idle');
                      setPreviewData([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Upload Different File
                  </button>
                  <button
                    onClick={handleImportData}
                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B] rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Import Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;