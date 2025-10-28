# TensorFlow.js Model Setup

This directory should contain the TensorFlow.js model files for pest detection.

## Converting TensorFlow SavedModel to TensorFlow.js

If you have a trained TensorFlow model, follow these steps to convert it:

### 1. Install TensorFlow.js Converter
```bash
pip install tensorflowjs
```

### 2. Convert SavedModel to TensorFlow.js format
```bash
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --signature_name=serving_default \
    --saved_model_tags=serve \
    /path/to/saved_model \
    ./public/models/pest_tfjs_model/
```

### 3. Expected file structure after conversion:
```
/public/models/pest_tfjs_model/
├── model.json          # Model architecture and metadata
├── group1-shard1of2.bin # Model weights (shard 1)
├── group1-shard2of2.bin # Model weights (shard 2)
└── labels.json         # Class labels mapping
```

### 4. Create labels.json file
Create a `labels.json` file with your model's class mappings:

```json
{
  "0": "healthy",
  "1": "leaf_blight", 
  "2": "powdery_mildew",
  "3": "bacterial_spot",
  "4": "late_blight"
}
```

## Using Pre-trained Models

If you don't have a custom model, you can use existing plant disease datasets:

### PlantVillage Dataset
- Download from: https://www.kaggle.com/emmarex/plantdisease
- Contains 38 classes of plant diseases
- Suitable for tomato, potato, and other crop diseases

### Alternative: Use Plant.id API
If you don't want to host a local model, the app can fallback to Plant.id API:
1. Get API key from: https://plant.id/
2. Set environment variable: `REACT_APP_PLANT_ID_API_KEY=your_key_here`

## Model Performance Tips

1. **Optimize for web**: Use quantization during conversion
```bash
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --quantize_float16 \
    /path/to/saved_model \
    ./public/models/pest_tfjs_model/
```

2. **Model size**: Keep model under 10MB for good loading performance

3. **Input preprocessing**: Ensure your model expects 224x224 RGB images (standard for mobile net architectures)

## TODO for Implementation

- [ ] Add actual TensorFlow.js model files
- [ ] Update labels.json with your model's classes  
- [ ] Test model loading in browser
- [ ] Verify preprocessing pipeline matches training
- [ ] Add model performance metrics to UI