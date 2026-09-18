import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../theme/colors';
import { Node } from '../data/mockData';

interface GisMapViewProps {
  nodes: Node[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
}

export const getMarkerColor = (waterLevel: number): string => {
  if (waterLevel < 80) return Colors.safe;
  if (waterLevel <= 119) return Colors.warning;
  return Colors.critical;
};

export const GisMapView: React.FC<GisMapViewProps> = ({
  nodes,
  onSelectNode,
  selectedNodeId,
}) => {
  const webViewRef = useRef<WebView>(null);

  // When nodes or selection change, we push the data into the WebView
  useEffect(() => {
    if (webViewRef.current) {
      const data = {
        type: 'UPDATE_NODES',
        nodes: nodes.map(n => ({
          id: n.id,
          lat: n.lat,
          lng: n.lng,
          color: getMarkerColor(n.waterLevel),
          isSelected: n.id === selectedNodeId
        }))
      };
      // Inject javascript to call our global function inside the WebView
      webViewRef.current.injectJavaScript(`
        if (window.updateMarkers) {
          window.updateMarkers(${JSON.stringify(data.nodes)});
        }
        true;
      `);
    }
  }, [nodes, selectedNodeId]);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'NODE_CLICKED') {
        onSelectNode(data.nodeId);
      }
    } catch (e) {
      // ignore
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background: #E5E7EB; }
          #map { width: 100vw; height: 100vh; }
          
          .custom-marker {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .inner-dot {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid white;
            z-index: 10;
          }
          
          .ping-ring {
            position: absolute;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid;
            opacity: 0.6;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          
          @keyframes ping {
            75%, 100% {
              transform: scale(2.5);
              opacity: 0;
            }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([13.6264, 123.1833], 14);
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
          }).addTo(map);

          var markers = {};

          function createMarkerIcon(node) {
            var html = '<div class="custom-marker">' +
                         '<div class="inner-dot" style="background-color: ' + node.color + '"></div>';
                         
            if (node.isSelected) {
              html += '<div class="ping-ring" style="border-color: ' + node.color + '"></div>';
            }
            
            html += '</div>';

            return L.divIcon({
              html: html,
              className: '',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
          }

          window.updateMarkers = function(nodes) {
            // Remove old markers
            for (var id in markers) {
              map.removeLayer(markers[id]);
            }
            markers = {};

            // Add new markers
            nodes.forEach(function(node) {
              var marker = L.marker([node.lat, node.lng], {
                icon: createMarkerIcon(node)
              }).addTo(map);
              
              marker.on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'NODE_CLICKED',
                  nodeId: node.id
                }));
              });
              
              markers[node.id] = marker;
            });
          };
        </script>
      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={{ textAlign: 'center', padding: 20 }}>
          WebView Leaflet map is not supported on Expo Web preview. Please view on Android/iOS device.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.webContainer}>
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.map}
          scrollEnabled={false}
          bounces={false}
          onMessage={onMessage}
          originWhitelist={['*']}
          javaScriptEnabled={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  container: {
    width: '100%',
    aspectRatio: 380 / 280,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
});
