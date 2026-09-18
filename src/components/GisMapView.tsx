import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
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
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Center of Naga City Bicol River approximately
  const initialRegion = {
    latitude: 13.6264,
    longitude: 123.1833,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  return (
    <View style={styles.webContainer}>
      <View style={styles.osmHeader}>
        <View style={styles.osmBadgeRow}>
          <View style={styles.osmLogoDot} />
          <Text style={styles.osmTitle}>OPENSTREETMAP • NAGA BASIN RADAR</Text>
        </View>
        <Text style={styles.osmCoord}>13.6218° N, 123.1948° E</Text>
      </View>

      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          provider={Platform.OS === 'web' ? undefined : PROVIDER_DEFAULT}
          mapType="none" // we use UrlTile instead of default Apple/Google map tiles
        >
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {nodes.map((node) => {
            const pinColor = getMarkerColor(node.waterLevel);
            const isSelected = selectedNodeId === node.id;
            
            return (
              <Marker
                key={node.id}
                coordinate={{ latitude: node.lat, longitude: node.lng }}
                onPress={() => onSelectNode(node.id)}
              >
                <View style={styles.pinIndicatorContainer}>
                  <View style={[styles.innerPinDot, { backgroundColor: pinColor }]} />
                  {isSelected && (
                    <Animated.View 
                      style={[
                        styles.pingRing, 
                        { 
                          borderColor: pinColor,
                          transform: [{
                            scale: pulseAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 2.5]
                            })
                          }],
                          opacity: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 0]
                          })
                        }
                      ]} 
                    />
                  )}
                </View>
              </Marker>
            );
          })}
        </MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  osmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  osmBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  osmLogoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.safe,
    marginRight: 6,
  },
  osmTitle: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  osmCoord: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
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
  },
  pinIndicatorContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerPinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pingRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    opacity: 0.6,
  },
});
