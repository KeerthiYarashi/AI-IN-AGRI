import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { MinimalFooter } from '@/components/MinimalFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, Camera, Bug, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { activityService } from '@/services/activityService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CROPS } from '@/utils/constants';
import { PestDetectionResult } from '@/types';

const PestDetection = () => {
  const { farmer } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PestDetectionResult | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Simulate AI detection (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sample detection results
      const sampleResults: PestDetectionResult[] = [
        {
          diseaseName: 'Healthy Plant',
          confidence: 95,
          severity: 'low',
          remedies: ['Plant is healthy', 'Continue regular care', 'Monitor regularly'],
          isHealthy: true,
        },
        {
          diseaseName: 'Early Blight',
          confidence: 87,
          severity: 'medium',
          remedies: [
            'Remove affected leaves immediately',
            'Apply copper-based fungicide',
            'Improve air circulation',
            'Avoid overhead watering',
          ],
          isHealthy: false,
        },
        {
          diseaseName: 'Late Blight',
          confidence: 82,
          severity: 'high',
          remedies: [
            'Apply fungicide immediately',
            'Remove and destroy infected plants',
            'Avoid working with wet plants',
            'Use disease-resistant varieties next season',
          ],
          isHealthy: false,
        },
        {
          diseaseName: 'Leaf Mold',
          confidence: 78,
          severity: 'medium',
          remedies: [
            'Increase ventilation in greenhouse',
            'Reduce humidity levels',
            'Apply appropriate fungicide',
            'Remove lower leaves',
          ],
          isHealthy: false,
        },
      ];

      const detectionResult = sampleResults[Math.floor(Math.random() * sampleResults.length)];
      setResult(detectionResult);

      // Track activity
      if (farmer && detectionResult) {
        activityService.addPestDetection(farmer.id, {
          crop: selectedCrop,
          disease: detectionResult.diseaseName,
          confidence: detectionResult.confidence,
        });
      }

      toast({
        title: detectionResult.isHealthy ? '✓ Plant is healthy' : '⚠ Disease detected',
        description: detectionResult.isHealthy
          ? 'No diseases found in the image'
          : `${detectionResult.diseaseName} detected with ${detectionResult.confidence}% confidence`,
      });
    } catch (error) {
      console.error('Detection failed:', error);
      toast({
        title: 'Analysis failed',
        description: 'Please try again with a different image',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isOnline={true} />

      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Page Header */}
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-3">
                <Bug className="h-8 w-8 text-primary" />
                {t('pestDetection')}
              </h1>
              <p className="text-muted-foreground">
                Upload a plant image to detect diseases and get treatment recommendations
              </p>
            </div>

            {/* Crop Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Select Crop Type</CardTitle>
                <CardDescription>Choose the crop you want to analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROPS.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.icon} {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-primary" />
                    Upload Plant Image
                  </CardTitle>
                  <CardDescription>
                    Take a clear photo of the affected leaves for best results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!selectedImage ? (
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('dragDropImage')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports: JPG, PNG, WEBP (Max 5MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative aspect-video rounded-lg overflow-hidden border">
                        <img
                          src={selectedImage}
                          alt="Selected plant"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Image
                        </Button>
                        <Button
                          onClick={analyzeImage}
                          disabled={isAnalyzing}
                          className="flex-1"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('scanning')}
                            </>
                          ) : (
                            <>
                              <Bug className="h-4 w-4 mr-2" />
                              Analyze Image
                            </>
                          )}
                        </Button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Tips for best results:</strong>
                    </p>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 mt-2 space-y-1 ml-4 list-disc">
                      <li>Use good lighting conditions</li>
                      <li>Focus on affected leaves</li>
                      <li>Keep camera steady and close</li>
                      <li>Avoid shadows and blurry images</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Detection Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!result ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bug className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Upload an image and analyze to see results
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Disease Status */}
                      <div
                        className={`p-6 rounded-xl border ${
                          result.isHealthy
                            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                            : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {result.isHealthy ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          ) : (
                            <AlertCircle className="h-8 w-8 text-red-600" />
                          )}
                          <div>
                            <div className="text-2xl font-bold">
                              {result.diseaseName}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  result.confidence > 80
                                    ? 'default'
                                    : result.confidence > 60
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {t('confidence')}: {result.confidence}%
                              </Badge>
                              {!result.isHealthy && (
                                <Badge
                                  variant={
                                    result.severity === 'low'
                                      ? 'default'
                                      : result.severity === 'medium'
                                      ? 'secondary'
                                      : 'destructive'
                                  }
                                >
                                  {result.severity.toUpperCase()} Severity
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remedies */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <span className="text-xl">💊</span>
                          {result.isHealthy ? 'Recommendations' : t('remedies')}
                        </h3>
                        <div className="space-y-2">
                          {result.remedies.map((remedy, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">
                                  {index + 1}
                                </span>
                              </div>
                              <p className="text-sm">{remedy}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {result.confidence < 70 && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className="text-sm text-amber-900 dark:text-amber-100">
                            <strong>⚠ Low Confidence Warning:</strong> The
                            detection confidence is below 70%. Consider taking a
                            clearer image or consulting an agricultural expert
                            for accurate diagnosis.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default PestDetection;