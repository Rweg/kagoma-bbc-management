import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  Text,
  List,
  Avatar,
  Chip,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getContributors,
  addContributor,
  getDB,
} from '../database/database';
import { colors } from '../theme/theme';

const ContributorsScreen = ({ navigation }) => {
  const [contributors, setContributors] = useState([]);
  const [filteredContributors, setFilteredContributors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, balance, contributions
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadContributors();
  }, []);

  useEffect(() => {
    filterAndSortContributors();
  }, [contributors, searchQuery, sortBy]);

  const loadContributors = async () => {
    try {
      const contributorsList = await getContributors();
      setContributors(contributorsList);
    } catch (error) {
      console.error('Error loading contributors:', error);
    }
  };

  const filterAndSortContributors = () => {
    let filtered = contributors;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone?.includes(searchQuery) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'balance') {
        return b.balance - a.balance;
      } else if (sortBy === 'contributions') {
        return b.total_contributed - a.total_contributed;
      }
      return 0;
    });

    setFilteredContributors(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContributors();
    setRefreshing(false);
  };

  const handleAddContributor = async () => {
    try {
      if (!formData.name) {
        Alert.alert('Error', 'Please enter a name');
        return;
      }

      await addContributor(formData.name, formData.phone, formData.email);
      Alert.alert('Success', 'Team member added successfully');
      setModalVisible(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
      });
      await loadContributors();
    } catch (error) {
      console.error('Error adding contributor:', error);
      Alert.alert('Error', 'Failed to add team member');
    }
  };

  const handleViewDetails = (contributor) => {
    Alert.alert(
      contributor.name,
      `Phone: ${contributor.phone || 'N/A'}\n` +
      `Email: ${contributor.email || 'N/A'}\n` +
      `Current Balance: ${formatCurrency(contributor.balance)}\n` +
      `Total Contributed: ${formatCurrency(contributor.total_contributed)}\n` +
      `Total Owed: ${formatCurrency(contributor.total_owed)}`,
      [
        {
          text: 'View History',
          onPress: () => navigation.navigate('ContributorHistory', { contributorId: contributor.id }),
        },
        { text: 'Close' },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} FRW`;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (index) => {
    const colors_list = [
      '#1a237e',
      '#ff6f00',
      '#4caf50',
      '#2196f3',
      '#9c27b0',
      '#f44336',
    ];
    return colors_list[index % colors_list.length];
  };

  const getTotalStats = () => {
    return {
      total: contributors.length,
      totalContributed: contributors.reduce((sum, c) => sum + c.total_contributed, 0),
      avgContribution: contributors.length > 0
        ? contributors.reduce((sum, c) => sum + c.total_contributed, 0) / contributors.length
        : 0,
    };
  };

  const stats = getTotalStats();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="account-group" size={24} color={colors.primary} />
                <Title style={styles.statValue}>{stats.total}</Title>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="cash-multiple" size={24} color={colors.success} />
                <Title style={styles.statValue}>{formatCurrency(stats.totalContributed)}</Title>
                <Text style={styles.statLabel}>Total Raised</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="chart-line" size={24} color={colors.info} />
                <Title style={styles.statValue}>{formatCurrency(stats.avgContribution)}</Title>
                <Text style={styles.statLabel}>Avg/Member</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search members..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortChips}>
            <Chip
              selected={sortBy === 'name'}
              onPress={() => setSortBy('name')}
              style={styles.sortChip}
            >
              Name
            </Chip>
            <Chip
              selected={sortBy === 'contributions'}
              onPress={() => setSortBy('contributions')}
              style={styles.sortChip}
            >
              Total Contributed
            </Chip>
            <Chip
              selected={sortBy === 'balance'}
              onPress={() => setSortBy('balance')}
              style={styles.sortChip}
            >
              Balance
            </Chip>
          </View>
        </View>

        {/* Contributors List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Team Members ({filteredContributors.length})</Title>
            {filteredContributors.length === 0 ? (
              <Paragraph style={styles.emptyText}>
                {searchQuery
                  ? 'No members found matching your search'
                  : 'No team members added yet. Add your first member using the + button below.'}
              </Paragraph>
            ) : (
              filteredContributors.map((item, index) => (
                <List.Item
                  key={item.id}
                  title={item.name}
                  description={`Contributed: ${formatCurrency(item.total_contributed)}`}
                  left={(props) => (
                    <Avatar.Text
                      {...props}
                      size={48}
                      label={getInitials(item.name)}
                      style={{ backgroundColor: getAvatarColor(index) }}
                    />
                  )}
                  right={(props) => (
                    <View style={styles.contributorRight}>
                      <Text
                        style={[
                          styles.balance,
                          { color: item.balance >= 0 ? colors.success : colors.error },
                        ]}
                      >
                        {formatCurrency(item.balance)}
                      </Text>
                      <Text style={styles.balanceLabel}>Balance</Text>
                    </View>
                  )}
                  onPress={() => handleViewDetails(item)}
                  style={styles.listItem}
                />
              ))
            )}
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Contributor Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Add Team Member</Title>
          
          <TextInput
            label="Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleAddContributor}>
              Add Member
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="Add Member"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color={colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    elevation: 2,
  },
  sortContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 8,
  },
  sortChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortChip: {
    marginRight: 8,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contributorRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  balance: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceLabel: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray,
    paddingVertical: 20,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  bottomPadding: {
    height: 80,
  },
});

export default ContributorsScreen;

