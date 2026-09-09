import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.neural_network import MLPRegressor

# 1. GENERATE SYNTHETIC HYDROLOGICAL DATA (Simulating Naga City Estero)
np.random.seed(42)
hours = 365 * 24  # 1 year of hourly data
time = np.arange(hours)

# Simulate rainfall (mm) - mostly 0, with occasional storm spikes
rainfall = np.random.exponential(scale=2, size=hours)
rainfall[rainfall < 1] = 0
# Add massive typhoon events
storm_indices = np.random.choice(hours, 10, replace=False)
for idx in storm_indices:
    rainfall[idx:idx+24] += np.random.uniform(15, 40)

# Simulate water level (cm) - correlates with rainfall with a slight lag
water_level = np.zeros(hours)
for i in range(2, hours):
    water_level[i] = 50 + (rainfall[i-1] * 2.5) + (rainfall[i-2] * 1.5) + np.random.normal(0, 3)
    water_level[i] = max(20, min(150, water_level[i]))  # Clamp between 20 and 150cm

# Create DataFrame
df = pd.DataFrame({
    'rain_t2': rainfall[:-2],
    'rain_t1': rainfall[1:-1],
    'rain_t0': rainfall[2:],
    'water_level': water_level[2:]
})

# 2. PREPARE DATA FOR EDGE-AI MODEL
features = ['rain_t2', 'rain_t1', 'rain_t0']
X = df[features].values
y = df['water_level'].values

scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()
X_scaled = scaler_X.fit_transform(X)
y_scaled = scaler_y.fit_transform(y.reshape(-1, 1)).ravel()

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_scaled, test_size=0.2, random_state=42)

# 3. BUILD & TRAIN LIGHTWEIGHT EDGE-AI MODEL (MLP Neural Network - no TensorFlow needed)
model = MLPRegressor(
    hidden_layer_sizes=(50, 50, 25),  # Mirrors the LSTM(50) -> LSTM(50) -> Dense(25) architecture
    activation='relu',
    solver='adam',
    max_iter=300,
    random_state=42,
    verbose=False
)

print("Training Edge-AI Neural Network Model...")
model.fit(X_train, y_train)
print("Training Complete!")

# 4. PREDICT AND GENERATE PITCH-DECK-READY GRAPH
y_pred_scaled = model.predict(X_test).reshape(-1, 1)
y_pred = scaler_y.inverse_transform(y_pred_scaled)
y_test_actual = scaler_y.inverse_transform(y_test.reshape(-1, 1))

plt.figure(figsize=(12, 6))
plt.plot(y_test_actual[:200], label='Actual Water Level (Sensor)', color='#007AFF', alpha=0.8, linewidth=2)
plt.plot(y_pred[:200], label='Edge-AI Predicted Level (Neural Net)', color='#FF3B30', linestyle='--', alpha=0.9, linewidth=2)
plt.axhline(y=120, color='#FF3B30', linestyle='-', alpha=0.5, label='Flood Alert Threshold (120cm)')

plt.title('Edge-AI: Real-Time Water Level Prediction', fontsize=14, fontweight='bold')
plt.xlabel('Time Step (Hours)', fontsize=12)
plt.ylabel('Water Level (cm)', fontsize=12)
plt.legend(fontsize=11, loc='upper left')
plt.grid(True, alpha=0.3)
plt.tight_layout()

# SAVE THE GRAPH FOR YOUR PDF AND GITHUB
plt.savefig('edge_ai_prediction_graph.png', dpi=300)
print("SUCCESS: Graph saved as 'edge_ai_prediction_graph.png' in your folder!")