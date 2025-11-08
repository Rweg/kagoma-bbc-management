import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { getDashboardStats, getContributions, getExpenses } from '../database/database';
import { colors } from '../theme/theme';
import { format } from 'date-fns';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalContributions: 0,
    totalExpenses: 0,
    currentBalance: 0,
    activeContributors: 0,
    pendingExpenses: 0,
  });
  const [recentContributions, setRecentContributions] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);

      const contributions = await getContributions(5);
      setRecentContributions(contributions);

      const expenses = await getExpenses(5);
      setRecentExpenses(expenses);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} FRW`;
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Card.Content>
        <View style={styles.statCardContent}>
          <View style={styles.statCardLeft}>
            <Icon name={icon} size={32} color={color} />
          </View>
          <View style={styles.statCardRight}>
            <Paragraph style={styles.statTitle}>{title}</Paragraph>
            <Title style={[styles.statValue, { color }]}>{value}</Title>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current Balance - Prominent Display */}
      <Surface style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Title style={styles.balanceAmount}>
          {formatCurrency(stats.currentBalance)}
        </Title>
        <View style={styles.balanceInfo}>
          <View style={styles.balanceInfoItem}>
            <Icon name="arrow-up-circle" size={20} color={colors.success} />
            <Text style={styles.balanceInfoText}>
              {formatCurrency(stats.totalContributions)}
            </Text>
          </View>
          <View style={styles.balanceInfoItem}>
            <Icon name="arrow-down-circle" size={20} color={colors.error} />
            <Text style={styles.balanceInfoText}>
              {formatCurrency(stats.totalExpenses)}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Active Members"
          value={stats.activeContributors.toString()}
          icon="account-group"
          color={colors.primary}
        />
        <StatCard
          title="Pending Expenses"
          value={formatCurrency(stats.pendingExpenses)}
          icon="clock-alert"
          color={colors.warning}
          subtitle="Awaiting approval"
        />
      </View>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="cash-plus"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Contributions')}
            >
              Add Contribution
            </Button>
            <Button
              mode="outlined"
              icon="cash-minus"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Expenses')}
            >
              Add Expense
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Contributions */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Recent Contributions</Title>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Contributions')}
            >
              View All
            </Button>
          </View>
          {recentContributions.length === 0 ? (
            <Paragraph style={styles.emptyText}>No contributions yet</Paragraph>
          ) : (
            recentContributions.map((item) => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Icon name="cash-plus" size={24} color={colors.success} />
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName}>
                      {item.contributor_name || 'Unknown'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.transactionAmount, { color: colors.success }]}>
                  +{formatCurrency(item.amount)}
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Recent Expenses */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Recent Expenses</Title>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Expenses')}
            >
              View All
            </Button>
          </View>
          {recentExpenses.length === 0 ? (
            <Paragraph style={styles.emptyText}>No expenses yet</Paragraph>
          ) : (
            recentExpenses.map((item) => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Icon name="cash-minus" size={24} color={colors.error} />
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName}>{item.category}</Text>
                    <Text style={styles.transactionDate}>
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { color: colors.error }]}>
                    -{formatCurrency(item.amount)}
                  </Text>
                  {!item.approved && (
                    <Text style={styles.pendingBadge}>Pending</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.primary,
    elevation: 4,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: colors.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceInfoText: {
    color: colors.white,
    fontSize: 14,
  },
  statsGrid: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    marginBottom: 12,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCardLeft: {
    marginRight: 16,
  },
  statCardRight: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActions: {
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.dark,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingBadge: {
    fontSize: 10,
    color: colors.warning,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    paddingVertical: 20,
  },
  bottomPadding: {
    height: 24,
  },
});

export default DashboardScreen;

