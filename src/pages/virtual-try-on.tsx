import React, { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';

// Sample hair products for virtual try-on
const hairProducts = [
  {
    id: 1,
    name: 'Straight Long Black Wig',
    imageSrc: '/images/hair-style-1.png',
    category: 'Wigs',
    price: '$249.99',
  },
  {
    id: 2,
    name: 'Wavy Medium Brown Wig',
    imageSrc: '/images/hair-style-2.png',
    category: 'Wigs',
    price: '$229.99',
  },
  {
    id: 3,
    name: 'Curly Long Ombre Wig',
    imageSrc: '/images/hair-style-3.png',
    category: 'Wigs',
    price: '$279.99',
  },
  {
    id: 4,
    name: 'Straight Bob Blonde Wig',
    imageSrc: '/images/hair-style-4.png',
    category: 'Wigs',
    price: '$199.99',
  },
  {
    id: 5,
    name: 'Wavy Long Red Extensions',
    imageSrc: '/images/hair-style-5.png',
    category: 'Extensions',
    price: '$159.99',
  },
  {
    id: 6,
    name: 'Curly Medium Black Extensions',
    imageSrc: '/images/hair-style-6.png',
    category: 'Extensions',
    price: '$149.99',
  },
];

export default function VirtualTryOn() {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const resetCapture = () => {
    setCapturedImage(null);
    setShowResult(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = () => {
    if (!selectedProduct) {
      alert('Please select a hair style first');
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsProcessing(false);
      setShowResult(true);
    }, 2000);
  };

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
  };

  return (
    <Layout>
      <Head>
        <title>Virtual Try-On | Luxe Hair Collection</title>
        <meta name="description" content="Try on our luxury hair products virtually before you buy. See how our wigs and extensions look on you with our AI-powered virtual try-on tool." />
      </Head>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-gray-900 sm:text-4xl">
              Virtual Try-On Experience
            </h1>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              See how our premium hair products look on you before making a purchase. Our AI-powered tool gives you a realistic preview.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-8">
            {/* Product Selection */}
            <div className="lg:col-span-4">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Select a Hair Style</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
                {hairProducts.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedProduct === product.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full">
                      <Image
                        src={product.imageSrc}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 bg-white">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.category} • {product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Camera/Upload Section */}
            <div className="lg:col-span-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab('camera')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'camera'
                        ? 'text-primary-600 border-b-2 border-primary-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Use Camera
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'upload'
                        ? 'text-primary-600 border-b-2 border-primary-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Upload Photo
                  </button>
                </div>

                {activeTab === 'camera' ? (
                  <div>
                    {!capturedImage ? (
                      <div className="relative">
                        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={capture}
                            className="btn-primary px-6"
                          >
                            Take Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={capturedImage}
                            alt="Captured"
                            width={720}
                            height={720}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-4 flex justify-center space-x-4">
                          <button
                            onClick={resetCapture}
                            className="btn-secondary px-6"
                          >
                            Retake
                          </button>
                          <button
                            onClick={processImage}
                            disabled={isProcessing || !selectedProduct}
                            className={`btn-primary px-6 ${
                              (!selectedProduct || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isProcessing ? 'Processing...' : 'Try It On'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {!uploadedImage ? (
                      <div className="flex justify-center items-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                        <div className="space-y-2 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={uploadedImage}
                            alt="Uploaded"
                            width={720}
                            height={720}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-4 flex justify-center space-x-4">
                          <button
                            onClick={() => setUploadedImage(null)}
                            className="btn-secondary px-6"
                          >
                            Change Photo
                          </button>
                          <button
                            onClick={processImage}
                            disabled={isProcessing || !selectedProduct}
                            className={`btn-primary px-6 ${
                              (!selectedProduct || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isProcessing ? 'Processing...' : 'Try It On'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Result Section */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-8"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Your Virtual Try-On Result</h3>
                    <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                      <div className="relative w-full h-full">
                        <Image
                          src={capturedImage || uploadedImage || ''}
                          alt="Base"
                          width={720}
                          height={720}
                          className="w-full h-full object-cover"
                        />
                        {selectedProduct && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Image
                              src={hairProducts.find(p => p.id === selectedProduct)?.imageSrc || ''}
                              alt="Hair style"
                              width={720}
                              height={720}
                              className="w-full h-full object-contain opacity-80"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          if (activeTab === 'camera') {
                            resetCapture();
                          } else {
                            setUploadedImage(null);
                            setShowResult(false);
                          }
                        }}
                        className="btn-secondary px-6"
                      >
                        Try Another Photo
                      </button>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="btn-secondary px-6"
                      >
                        Try Another Style
                      </button>
                      {selectedProduct && (
                        <button
                          className="btn-primary px-6"
                          onClick={() => {
                            // In a real app, this would navigate to the product page
                            alert('This would take you to the product page in a real app');
                          }}
                        >
                          Shop This Look
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-gray-900 text-center mb-8">
              Tips for the Best Virtual Try-On Experience
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-primary-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Good Lighting</h3>
                <p className="text-gray-600">
                  Ensure you're in a well-lit environment. Natural light works best for the most accurate results.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-primary-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Face Position</h3>
                <p className="text-gray-600">
                  Position your face in the center of the frame and look directly at the camera for the best fit.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-primary-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Clear Image</h3>
                <p className="text-gray-600">
                  Use a high-quality camera or upload a clear photo where your face is fully visible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
