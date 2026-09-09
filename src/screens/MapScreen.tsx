import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../theme/colors';
import { MOCK_NODES, Node } from '../data/mockData';
import { GisMapView } from '../components/GisMapView';
import { MapStackParamList } from '../navigation/types';

type MapScreenNavigationProp = StackNavigationProp<MapStackParamList, 'MapScreen'>;

interface MapScreenProps {
  navigation: MapScreenNavigationProp;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [nodes] = useState<Node[]>(MOCK_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-07');

  const handleNodePress = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    navigation.navigate('NodeDetailScreen', { nodeId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryHeader} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Royal Blue Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroHeaderRow}>
            <View>
              <Text style={styles.heroTitle}>Estero-Volt</Text>
              <Text style={styles.heroTitleSub}>Network Status</Text>
            </View>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineText}>ONLINE</Text>
            </View>
          </View>
        </View>

        {/* 3 Floating Summary Cards Over the Seam */}
        <View style={styles.summaryRow}>
          {/* Card 1: Active Nodes */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>Active Nodes:</Text>
            <Text style={styles.cardGreenText}>24/24</Text>
          </View>

          {/* Card 2: Avg SOC */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>Avg SOC:</Text>
            <Text style={styles.cardBlueText}>94%</Text>
          </View>

          {/* Card 3: Last Sync */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>Last Sync:</Text>
            <Text style={styles.cardGrayText}>2m ago</Text>
          </View>
        </View>

        {/* OpenStreetMap GIS Map View */}
        <GisMapView
          nodes={nodes}
          onSelectNode={handleNodePress}
          selectedNodeId={selectedNodeId}
        />

        {/* Monitored Estero Nodes (Matching Screen_2_MapScreen.png layout) */}
        <View style={styles.nodeListContainer}>
          {nodes.map((node) => {
            return (
              <TouchableOpacity
                key={node.id}
                style={styles.nodeCard}
                activeOpacity={0.8}
                onPress={() => handleNodePress(node.id)}
              >
                <View style={styles.nodeCardHeader}>
                  <Text style={styles.nodeCardTitle}>{node.name.split(' - ')[1] || node.name}</Text>
                  <Text style={styles.nodeCardDepthLarge}>{node.waterLevel}cm</Text>
                </View>

                <View style={styles.nodeCardDetails}>
                  <Text style={styles.nodeDetailText}>Water Depth: {node.waterLevel}cm</Text>
                  <Text style={styles.nodeDetailText}>Supercap SOC: {node.soc}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryHeader,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  heroHeader: {
    backgroundColor: Colors.primaryHeader,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 38,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroTitleSub: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  onlineBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  onlineText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '900',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: -22,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  cardGreenText: {
    color: Colors.safe,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },
  cardBlueText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 3,
  },
  cardGrayText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 3,
  },
  nodeListContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  nodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  nodeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nodeCardTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  nodeCardDepthLarge: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  nodeCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nodeDetailText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
