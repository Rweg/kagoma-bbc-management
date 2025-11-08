import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
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
  Chip,
  Text,
  List,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getContributions,
  addContribution,
  getContributors,
  getUnprocessedSMS,
  markSMSAsProcessed,
} from '../database/database';
import { syncRecentSMS, extractAmount, extractTransactionRef } from '../services/smsService';
import { colors } from '../theme/theme';
import { format } from 'date-fns';

const ContributionsScreen = ({ navigation }) => {
  const [contributions, setContributions] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [unprocessedSMS, setUnprocessedSMS] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [selectedSMS, setSelectedSMS] = useState(null);
  
  const [formData, setFormData] = useState({
    contributorId: null,
    amount: '',
    source: 'MANUAL',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const contribs = await getContributions();
      setContributions(contribs);

      const contribs_list = await getContributors();
      setContributors(contribs_list);

      const sms = await getUnprocessedSMS();
      setUnprocessedSMS(sms.filter(s => s.type.includes('RECEIVED')));
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSyncSMS = async () => {
    try {
      Alert.alert(
        'Sync SMS',
        'This will scan your SMS messages for contributions from banks and mobile money. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sync',
            onPress: async () => {
              const result = await syncRecentSMS(30);
              if (result.success) {
                Alert.alert('Success', `Found ${result.processed} financial messages`);
                await loadData();
              } else {
                Alert.alert('Error', result.error);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to sync SMS');
    }
  };

  const handleSMSSelection = (sms) => {
    setSelectedSMS(sms);
    const amount = extractAmount(sms.content);
    setFormData({
      ...formData,
      amount: amount ? amount.toString() : '',
      source: sms.type.split('_')[0],
    });
    setSmsModalVisible(true);
  };

  const handleAddContribution = async () => {
    try {
      if (!formData.contributorId || !formData.amount) {
        Alert.alert('Error', 'Please select a contributor and enter an amount');
        return;
      }

      const transactionRef = selectedSMS ? extractTransactionRef(selectedSMS.content) : null;

      await addContribution(
        formData.contributorId,
        parseFloat(formData.amount),
        formData.source,
        selectedSMS ? selectedSMS.content : null,
        selectedSMS ? selectedSMS.sender : null,
        transactionRef,
        formData.notes
      );

      if (selectedSMS) {
        await markSMSAsProcessed(selectedSMS.id, formData.contributorId);
      }

      Alert.alert('Success', 'Contribution added successfully');
      setModalVisible(false);
      setSmsModalVisible(false);
      setSelectedSMS(null);
      setFormData({
        contributorId: null,
        amount: '',
        source: 'MANUAL',
        notes: '',
      });
      await loadData();
    } catch (error) {
      console.error('Error adding contribution:', error);
      Alert.alert('Error', 'Failed to add contribution');
    }
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} FRW`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Unprocessed SMS Alert */}
        {unprocessedSMS.length > 0 && (
          <Card style={[styles.card, styles.alertCard]}>
            <Card.Content>
              <View style={styles.alertContent}>
                <Icon name="message-alert" size={24} color={colors.warning} />
                <View style={styles.alertText}>
                  <Title style={styles.alertTitle}>
                    {unprocessedSMS.length} New Contributions Detected
                  </Title>
                  <Paragraph>
                    Review SMS messages from banks and mobile money services
                  </Paragraph>
                </View>
              </View>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('SMSReview', { smsMessages: unprocessedSMS })}
                style={styles.alertButton}
              >
                Review Now
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            icon="message-text-clock"
            onPress={handleSyncSMS}
            style={styles.syncButton}
          >
            Sync SMS
          </Button>
        </View>

        {/* Contributions List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>All Contributions</Title>
            {contributions.length === 0 ? (
              <Paragraph style={styles.emptyText}>
                No contributions recorded yet. Add your first contribution using the + button below.
              </Paragraph>
            ) : (
              contributions.map((item) => (
                <List.Item
                  key={item.id}
                  title={item.contributor_name || 'Unknown'}
                  description={`${format(new Date(item.date), 'MMM dd, yyyy')} • ${item.source}`}
                  left={(props) => (
                    <List.Icon {...props} icon="cash-plus" color={colors.success} />
                  )}
                  right={(props) => (
                    <View style={styles.contributionRight}>
                      <Text style={[styles.amount, { color: colors.success }]}>
                        +{formatCurrency(item.amount)}
                      </Text>
                      {item.synced_to_sheets ? (
                        <Icon name="cloud-check" size={16} color={colors.success} />
                      ) : (
                        <Icon name="cloud-off-outline" size={16} color={colors.gray} />
                      )}
                    </View>
                  )}
                  style={styles.listItem}
                />
              ))
            )}
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Manual Add Contribution Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Add Contribution</Title>
          
          <Text style={styles.label}>Select Contributor</Text>
          <ScrollView style={styles.chipContainer} horizontal>
            {contributors.map((contributor) => (
              <Chip
                key={contributor.id}
                selected={formData.contributorId === contributor.id}
                onPress={() =>
                  setFormData({ ...formData, contributorId: contributor.id })
                }
                style={styles.chip}
              >
                {contributor.name}
              </Chip>
            ))}
          </ScrollView>

          <TextInput
            label="Amount (FRW)"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.label}>Source</Text>
          <View style={styles.sourceButtons}>
            {['MANUAL', 'BANK', 'MTN_MOBILE_MONEY'].map((source) => (
              <Chip
                key={source}
                selected={formData.source === source}
                onPress={() => setFormData({ ...formData, source })}
                style={styles.chip}
              >
                {source.replace('_', ' ')}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleAddContribution}>
              Add
            </Button>
          </View>
        </Modal>

        {/* SMS-based Contribution Modal */}
        <Modal
          visible={smsModalVisible}
          onDismiss={() => {
            setSmsModalVisible(false);
            setSelectedSMS(null);
          }}
          contentContainerStyle={styles.modal}
        >
          <Title>Match SMS to Contributor</Title>
          
          {selectedSMS && (
            <Card style={styles.smsCard}>
              <Card.Content>
                <Paragraph style={styles.smsContent}>
                  {selectedSMS.content}
                </Paragraph>
                <Text style={styles.smsDate}>
                  {format(new Date(selectedSMS.date), 'MMM dd, yyyy HH:mm')}
                </Text>
              </Card.Content>
            </Card>
          )}

          <Text style={styles.label}>Who made this contribution?</Text>
          <ScrollView style={styles.chipContainer} horizontal>
            {contributors.map((contributor) => (
              <Chip
                key={contributor.id}
                selected={formData.contributorId === contributor.id}
                onPress={() =>
                  setFormData({ ...formData, contributorId: contributor.id })
                }
                style={styles.chip}
              >
                {contributor.name}
              </Chip>
            ))}
          </ScrollView>

          <TextInput
            label="Amount (FRW)"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Notes (Optional)"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <View style={styles.modalButtons}>
            <Button
              onPress={() => {
                setSmsModalVisible(false);
                setSelectedSMS(null);
              }}
            >
              Cancel
            </Button>
            <Button mode="contained" onPress={handleAddContribution}>
              Add Contribution
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
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
  alertCard: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  alertButton: {
    marginTop: 8,
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  syncButton: {
    borderColor: colors.primary,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contributionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
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
    maxHeight: '80%',
  },
  label: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
    marginBottom: 8,
  },
  chipContainer: {
    maxHeight: 50,
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
  },
  sourceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
  smsCard: {
    marginBottom: 16,
    backgroundColor: colors.light,
  },
  smsContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  smsDate: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 8,
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

export default ContributionsScreen;

