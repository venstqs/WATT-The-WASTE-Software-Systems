# EstaGo — AI Analysis & Geospatial Figures

> Python scripts and generated figures for the **EstaGo** water monitoring system.
> Part of the **JA WE Challenge 2026-2027** project proposal.

---

## Folder Structure

```
estago-ai-analysis/
├── edge_ai_prediction_graph.py       # Simulates 1-yr hydrological data + MLP model
├── edge_ai_performance_metrics.py    # Generates the 6-panel model performance figure
├── generate_bicol_map.py             # GeoPandas + Contextily geospatial deployment map
└── figures/
    ├── edge_ai_prediction_graph.png       # Basic predicted vs actual water level
    ├── edge_ai_performance_metrics.png    # Full 6-panel performance metrics dashboard
    └── bicol_deployment_map.png           # Bicol Region scalability & deployment map
```

---

## Edge-AI Model (Section 6.1)

| Metric | Value |
|--------|-------|
| Training dataset | 8,760 hours of synthetic hydrological data |
| Model architecture | MLP 2-layer (50 > 50 > 25 neurons, ReLU) |
| MAE | 4.2 cm |
| RMSE | 5.8 cm |
| R2 Score | 0.91 |
| Inference time on ESP32 | < 150 ms |
| Model size (quantized INT8) | 85 KB |

## Requirements

```
pip install numpy pandas matplotlib scikit-learn geopandas contextily shapely pyproj matplotlib-scalebar scipy
```

## Run

```
python edge_ai_performance_metrics.py   # 6-panel performance figure
python generate_bicol_map.py            # Bicol deployment map
python edge_ai_prediction_graph.py      # Basic prediction graph
```

---
*EstaGo | Estero-Integrated Smart Water Monitoring | JA WE Challenge 2026-2027 | Bicol Region, Philippines*
